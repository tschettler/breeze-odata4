import { MetadataAdapter } from "./metadata-adapter";
import { Association, EntityContainer, EntityType, NavigationProperty, oData, Schema } from "ts-odatajs";
import { Metadata } from "../interfaces";

export class NavigationAdapter implements MetadataAdapter {
    private metadata: Metadata;
    private entityContainer: EntityContainer;
    private associations: { [key: string]: Association; } = {};

    adapt(metadata: Metadata): void {
        this.metadata = metadata;

        this.entityContainer = oData.utils.lookupDefaultEntityContainer(this.metadata.schema);

        oData.utils.forEachSchema(this.metadata.schema, this.adaptSchema.bind(this));
    }

    adaptSchema(schema: Schema): void {
        this.associations = {};

        const entityTypes: EntityType[] = schema.entityType || [];

        entityTypes.forEach(e => this.adaptEntityType(schema, e));
    }

    adaptEntityType(schema: any, entityType: EntityType) {
        (entityType.navigationProperty || []).forEach((n: NavigationProperty) => this.adaptNavigationProperty(schema, entityType.name, n));

        this.setAssociations(schema);
    }

    adaptNavigationProperty(schema: Schema, entityTypeName: string, navProp: NavigationProperty) {
        var namespace = schema.namespace;
        var isCollection = oData.utils.isCollectionType(navProp.type);
        var fullType = oData.utils.getCollectionType(navProp.type) || navProp.type;
        var shortType = fullType.split('.').pop();

        var sourceType = isCollection ? shortType : entityTypeName;
        var targetType = isCollection ? entityTypeName : shortType;

        var assocName = sourceType + '_' + targetType;
        var assoc = this.getAssociation(sourceType, targetType);

        var fullSourceTypeName = `${namespace}.${sourceType}`;
        var fullTargetTypeName = `${namespace}.${targetType}`;
        if (!(isCollection || assoc)) {
            var targetEntityType = oData.utils.lookupEntityType(fullTargetTypeName, this.metadata.schema);
            if (targetEntityType === null) {
                throw new Error(`Could not find entity with type name ${fullTargetTypeName}`);
            }

            var targetKey = targetEntityType.key.propertyRef;
            var sourceKey = targetKey;

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
        navProp.fromRole = assocName + (isCollection ? '_Target' : '_Source');
        navProp.toRole = assocName + (isCollection ? '_Source' : '_Target');
    }

    private getAssociation(firstType: string, secondType: string): Association {
        return this.associations[`${firstType}_${secondType}`]
            || this.associations[`${secondType}_${firstType}`];
    }

    private getEntitySetNameByEntityType(entityType: string): string {
        const set = this.entityContainer.entitySet.find(s => s.entityType === entityType);

        return set && set.name;
    }

    private setAssociations(schema: Schema) {
        var assoc: Association[] = [];
        for (var key in this.associations) {
            assoc.push(this.associations[key]);
        }

        schema.association = assoc;
        this.entityContainer.associationSet = assoc;
    }
}
