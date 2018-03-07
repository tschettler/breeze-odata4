import { MetadataAdapter } from './metadata-adapter';
import { Edm, EdmExtra, oData, Edmx } from 'ts-odatajs';

export class NavigationAdapter implements MetadataAdapter {
    private metadata: Edmx.DataServices;
    private entityContainer: Edm.EntityContainer;
    private associations: { [key: string]: EdmExtra.Association; } = {};

    public adapt(metadata: Edmx.DataServices): void {
        this.metadata = metadata;

        this.entityContainer = oData.utils.lookupDefaultEntityContainer(this.metadata.schema);

        oData.utils.forEachSchema(this.metadata.schema, this.adaptSchema.bind(this));
    }

    public adaptSchema(schema: Edm.Schema): void {
        this.associations = {};

        const entityTypes: Edm.EntityType[] = schema.entityType || [];

        entityTypes.forEach(e => this.adaptEntityType(schema, e));
    }

    private adaptEntityType(schema: any, entityType: Edm.EntityType) {
        (entityType.navigationProperty || [])
            .forEach(n => this.adaptNavigationProperty(schema, entityType.name, n));

        this.setAssociations(schema);
    }

    private adaptNavigationProperty(schema: Edm.Schema, entityTypeName: string, navProp: Edm.NavigationProperty) {
        const namespace = schema.namespace;
        const isCollection = oData.utils.isCollectionType(navProp.type);
        const fullType = oData.utils.getCollectionType(navProp.type) || navProp.type;
        const shortType = fullType.split('.').pop();

        const sourceType = isCollection ? shortType : entityTypeName;
        const targetType = isCollection ? entityTypeName : shortType;

        const assoc = this.getAssociation(namespace, sourceType, targetType);

        const fullTargetTypeName = `${namespace}.${targetType}`;
        const targetEntityType = oData.utils.lookupEntityType(fullTargetTypeName, this.metadata.schema);
        if (targetEntityType === null) {
            throw new Error(`Could not find entity with type name ${fullTargetTypeName}`);
        }

        if (!assoc.referentialConstraint) {
            assoc.referentialConstraint = this.getReferentialConstraint(navProp, assoc.name, targetEntityType);
        }

        this.setNavigationRoles(navProp, namespace, assoc.name);
    }

    private getReferentialConstraint(navProp: Edm.NavigationProperty, assocName: string, targetEntityType: Edm.EntityType):
        EdmExtra.AssociationConstraint {
        const isCollection = oData.utils.isCollectionType(navProp.type);
        if (isCollection) {
            return null;
        }

        let targetKey = targetEntityType.key.propertyRef;
        let sourceKey = targetKey;

        const constraint = (navProp.referentialConstraint || [])[0];
        if (constraint) {
            sourceKey = [{ name: constraint.property }];
            targetKey = [{ name: constraint.referencedProperty }];
        }

        const result = {
            dependent: {
                propertyRef: sourceKey,
                role: `${assocName}_Source`
            },
            principal: {
                propertyRef: targetKey,
                role: `${assocName}_Target`
            }
        };

        return result;
    }

    private setNavigationRoles(navProp: Edm.NavigationProperty, namespace: string, assocName: string): void {
        if (!this.associations[assocName]) {
            return;
        }

        const isCollection = oData.utils.isCollectionType(navProp.type);
        navProp.relationship = `${namespace}.${assocName}`;
        navProp.fromRole = assocName + (isCollection ? '_Target' : '_Source');
        navProp.toRole = assocName + (isCollection ? '_Source' : '_Target');
    }

    private getAssociation(namespace: string, firstType: string, secondType: string): EdmExtra.Association {
        const assocName1 = `${firstType}_${secondType}`;
        const assocName2 = `${secondType}_${firstType}`;
        let assoc = this.associations[assocName1]
            || this.associations[assocName2];

        if (assoc) {
            return assoc;
        }

        const fullSourceTypeName = `${namespace}.${firstType}`;
        const fullTargetTypeName = `${namespace}.${secondType}`;

        assoc = {
            association: assocName1,
            name: assocName1,
            end: [
                {
                    entitySet: this.getEntitySetNameByEntityType(fullSourceTypeName),
                    multiplicity: '*',
                    role: `${assocName1}_Source`,
                    type: fullSourceTypeName
                },
                {
                    entitySet: this.getEntitySetNameByEntityType(fullTargetTypeName),
                    multiplicity: '1',
                    role: `${assocName1}_Target`,
                    type: fullTargetTypeName
                }
            ],
            referentialConstraint: null
        };

        this.associations[assoc.name] = assoc;

        return assoc;
    }

    private getEntitySetNameByEntityType(entityType: string): string {
        const set = this.entityContainer.entitySet.find(s => s.entityType === entityType);

        return set && set.name;
    }

    private setAssociations(schema: Edm.Schema) {
        const assoc: EdmExtra.Association[] = [];
        // tslint:disable-next-line:forin
        for (const key in this.associations) {
            assoc.push(this.associations[key]);
        }

        schema.association = assoc;
        this.entityContainer.associationSet = assoc;
    }
}
