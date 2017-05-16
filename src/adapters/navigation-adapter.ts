import { MetadataAdapter } from "./metadata-adapter";
import { oData } from "ts-odatajs";

export class NavigationAdapter implements MetadataAdapter {
    private metadata: any;
    private entityContainer: oData.utils.EntityContainer;
    private associations: { [key: string]: oData.utils.Association; } = {};

    adapt(metadata: any): void {
        this.metadata = metadata;

        this.entityContainer = oData.utils.lookupDefaultEntityContainer(this.metadata.schema);

        oData.utils.forEachSchema(this.metadata.schema, this.adaptSchema.bind(this));
    }

    adaptSchema(schema: any): void {
        this.associations = {};

        const entityTypes: any[] = schema.entityType || [];

        entityTypes.forEach(e => this.adaptEntityType(schema, e));
    }

    adaptEntityType(schema: any, entityType: any) {
        (entityType.navigationProperty || []).forEach((n: any) => this.adaptNavigationProperty(schema, entityType.name, n));

        this.setAssociations(schema);
    }

    adaptNavigationProperty(schema: any, entityTypeName: string, navProp: any) {
        var namespace = schema.namespace;
        var navTypeIsSource = navProp.type.indexOf('Collection(') === 0;
        var fullType = navProp.type.replace(/Collection\(([^)]*)\)/, '$1');
        var shortType = fullType.split('.').pop();

        var sourceType = navTypeIsSource ? shortType : entityTypeName;
        var targetType = navTypeIsSource ? entityTypeName : shortType;

        var assocName = sourceType + '_' + targetType;
        var assoc = this.getAssociation(sourceType, targetType);

        var fullSourceTypeName = `${namespace}.${sourceType}`;
        var fullTargetTypeName = `${namespace}.${targetType}`;
        if (!(navTypeIsSource || assoc)) {
            var targetEntityType = oData.utils.lookupEntityType(fullTargetTypeName, this.metadata.schema);
            if (targetEntityType === null) {
                throw new Error(`Could not find entity with type name ${fullTargetTypeName}`);
            }

            var targetKey = <oData.utils.PropertyRef[]>targetEntityType.key.propertyRef;
            var sourceKey = <oData.utils.PropertyRef[]>targetKey;

            var constraint = (navProp.referentialConstraint || [])[0];
            if (constraint) {
                sourceKey = [{ name: constraint.property }];
                targetKey = [{ name: constraint.referencedProperty }];
            }

            assoc = {
                association: assocName,
                name: assocName,
                end: [
                    {
                        entitySet: this.getEntitySetNameByEntityType(fullSourceTypeName),
                        multiplicity: '*',
                        role: `${assocName}_Source`,
                        type: fullSourceTypeName
                    },
                    {
                        entitySet: this.getEntitySetNameByEntityType(fullTargetTypeName),
                        multiplicity: '1',
                        role: `${assocName}_Target`,
                        type: fullTargetTypeName
                    }
                ],
                referentialConstraint: {
                    dependent: {
                        propertyRef: sourceKey,
                        role: `${assocName}_Source`
                    },
                    principal: {
                        propertyRef: targetKey,
                        role: `${assocName}_Target`
                    }
                }
            };

            this.associations[assoc.name] = assoc;
        }

        navProp.relationship = `${namespace}.${assocName}`;
        navProp.fromRole = assocName + (navTypeIsSource ? '_Target' : '_Source');
        navProp.toRole = assocName + (navTypeIsSource ? '_Source' : '_Target');
    }

    private getAssociation(firstType: string, secondType: string): oData.utils.Association {
        return this.associations[`${firstType}_${secondType}`]
            || this.associations[`${secondType}_${firstType}`];
    }

    private getEntitySetNameByEntityType(entityType: string): string {
        const set = this.entityContainer.entitySet.find(s => s.entityType === entityType);

        return set && set.name;
    }

    private setAssociations(schema: any) {
        var assoc: oData.utils.Association[] = [];
        for (var key in this.associations) {
            assoc.push(this.associations[key]);
        }

        schema.association = assoc;
        this.entityContainer.associationSet = assoc;
    }
}
