import { MetadataAdapter } from "./metadata-adapter";
import { oData } from "ts-odatajs";

interface Association {
    association: string;
    name: string;
    end: AssociationEndpoint[];
    referentialConstraint: AssociationConstraint;
}

interface AssociationEndpoint {
    entitySet: string;
    multiplicity: string;
    role: string;
    type: string;
}

interface AssociationConstraint {
    dependent: ConstraintActor;
    principal: ConstraintActor;
}

interface ConstraintActor {
    propertyRef: PropertyRef[];
    role: string;
}

interface PropertyRef {
    name: string;
}

export class NavigationAdapter implements MetadataAdapter {
    private associations: Association[];

    adapt(schema: any): void {
        schema.entityType.forEach(e => this.adaptEntityType(schema, e));
    }

    adaptEntityType(schema: any, entityType: any) {
        (entityType.navigationProperty || []).forEach(n => this.adaptNavigationProperty(schema, entityType.name, n));

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
        if (!(navTypeIsSource || assoc)) {
            var targetEntityType = oData.utils.lookupEntityType(targetType, schema); // TODO: verify working, replaces getEntityType
            var targetKey = <PropertyRef[]>targetEntityType.key.propertyRef;
            var sourceKey = <PropertyRef[]>targetKey;

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
                        entitySet: oData.utils.getEntitySetInfo(`${namespace}.${sourceType}`, schema), // TODO: verify working, replaces getResourceFromEntityName
                        multiplicity: '*',
                        role: `${assocName}_Source`,
                        type: `${namespace}.${sourceType}`
                    },
                    {
                        entitySet: oData.utils.getEntitySetInfo(`${namespace}.${targetType}`, schema),  // TODO: verify working, replaces getResourceFromEntityName
                        multiplicity: '1',
                        role: `${assocName}_Target`,
                        type: `${namespace}.${targetType}`
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

        var isSource = !navTypeIsSource;
        navProp.relationship = `${namespace}.${assocName}`;
        navProp.toRole = assocName + (isSource ? '_Target' : '_Source');
        navProp.fromRole = assocName + (isSource ? '_Source' : '_Target');
    }

    private getAssociation(firstType, secondType): Association {
        return this.associations[`${firstType}_${secondType}`]
            || this.associations[`${secondType}_${firstType}`];
    }
    
    private setAssociations(schema) {
        var assoc = [];
        for (var key in this.associations) {
            assoc.push(this.associations[key]);
        }

        schema.association = assoc;
        schema.entityContainer.associationSet = assoc;
    }
}
