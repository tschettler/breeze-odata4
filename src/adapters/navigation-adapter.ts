import { Edm, EdmExtra, Edmx, oData } from 'ts-odatajs';

import { MetadataAdapter } from './adapters';

export const EntityNotFound = 'Could not find entity with type name';
const SourceSuffix = '_Source';
const TargetSuffix = '_Target';
const ConstrainMany = '*';
const ConstrainOne = '1';

export class NavigationAdapter implements MetadataAdapter {
  private metadata: Edmx.DataServices;
  private entityContainer: Edm.EntityContainer;
  private associations: { [key: string]: EdmExtra.Association } = {};

  public adapt(metadata: Edmx.DataServices): void {
    this.metadata = metadata;

    this.entityContainer = oData.utils.lookupDefaultEntityContainer(this.metadata.schema);

    oData.utils.forEachSchema(this.metadata.schema, this.adaptSchema.bind(this));
  }

  public adaptSchema(schema: Edm.Schema): void {
    this.associations = {};

    const entityTypes: Edm.EntityType[] = schema.entityType || [];
    entityTypes.forEach(e => this.adaptEntityType(schema, e));

    this.setAssociations(schema);
  }

  private adaptEntityType(schema: Edm.Schema, entityType: Edm.EntityType): void {
    (entityType.navigationProperty || []).forEach(n => this.adaptNavigationProperty(schema, entityType.name, n));
  }

  private adaptNavigationProperty(schema: Edm.Schema, entityTypeName: string, navProp: Edm.NavigationProperty): void {
    const namespace = schema.namespace;
    const isCollection = oData.utils.isCollectionType(navProp.type);
    const fullType = oData.utils.getCollectionType(navProp.type) || navProp.type;
    const shortType = fullType.split('.').pop();

    const sourceType = isCollection ? shortType : entityTypeName;
    const targetType = isCollection ? entityTypeName : shortType;

    const assoc = this.getAssociation(namespace, sourceType, targetType);

    this.setMultiplicity(navProp, assoc.name, namespace);

    this.setReferentialConstraint(navProp, assoc.name, namespace);

    this.setNavigationRoles(navProp, assoc.name, namespace);
  }

  private setMultiplicity(navProp: Edm.NavigationProperty, assocName: string, namespace: string): void {
    const assoc = this.associations[assocName];

    const isCollection = oData.utils.isCollectionType(navProp.type);
    const multiplicity = isCollection ? ConstrainMany : ConstrainOne;

    const fullType = oData.utils.getCollectionType(navProp.type) || navProp.type;
    assoc.end.filter(m => m.type === fullType).forEach(m => (m.multiplicity = multiplicity));
  }

  private setReferentialConstraint(navProp: Edm.NavigationProperty, assocName: string, namespace: string): void {
    const assoc = this.associations[assocName];
    if (assoc.referentialConstraint) {
      return;
    }

    const constraintKeys: { [key: string]: Edm.PropertyRef[] } = {};
    const result: EdmExtra.AssociationConstraint = {
      dependent: {
        propertyRef: null,
        role: `${assoc.name}${SourceSuffix}`
      },
      principal: {
        propertyRef: null,
        role: `${assoc.name}${TargetSuffix}`
      }
    };

    const constraint = (navProp.referentialConstraint || [])[0];
    if (constraint) {
      constraintKeys[`${assoc.name}${SourceSuffix}`] = [{ name: constraint.property }];
      constraintKeys[`${assoc.name}${TargetSuffix}`] = [{ name: constraint.referencedProperty }];
    } else {
      assoc.end
        .sort(e => Number(!e.role.endsWith(TargetSuffix)))
        .forEach(e => {
          const entityType = oData.utils.lookupEntityType(e.type, this.metadata.schema);
          if (entityType === null) {
            throw new Error(`${EntityNotFound} ${e.type}`);
          }

          const isTarget = e.role.endsWith(TargetSuffix);

          let entityKeyRef = isTarget ? entityType.key.propertyRef : constraintKeys[`${assoc.name}${TargetSuffix}`];

          if (entityType.key.propertyRef[0].name !== entityKeyRef[0].name) {
            entityKeyRef = entityType.key.propertyRef;
          }

          constraintKeys[e.role] = entityKeyRef;
        });
    }

    Object.keys(result).forEach(p => {
      const member: EdmExtra.ConstraintMember = result[p];

      member.propertyRef = constraintKeys[member.role];
    });

    assoc.referentialConstraint = result;
  }

  private setNavigationRoles(navProp: Edm.NavigationProperty, assocName: string, namespace: string): void {
    const assoc = this.associations[assocName];

    const isCollection = oData.utils.isCollectionType(navProp.type);
    navProp.relationship = `${namespace}.${assoc.name}`;
    navProp.fromRole = assoc.name + (isCollection ? TargetSuffix : SourceSuffix);
    navProp.toRole = assoc.name + (isCollection ? SourceSuffix : TargetSuffix);
  }

  private getAssociation(namespace: string, firstType: string, secondType: string): EdmExtra.Association {
    const assocName1 = `${firstType}_${secondType}`;
    const assocName2 = `${secondType}_${firstType}`;
    let assoc = this.associations[assocName1] || this.associations[assocName2];

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
          role: `${assocName1}${SourceSuffix}`,
          type: fullSourceTypeName
        },
        {
          entitySet: this.getEntitySetNameByEntityType(fullTargetTypeName),
          multiplicity: '*',
          role: `${assocName1}${TargetSuffix}`,
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

  private setAssociations(schema: Edm.Schema): void {
    const assoc: EdmExtra.Association[] = [];
    // tslint:disable-next-line:forin
    for (const key in this.associations) {
      assoc.push(this.associations[key]);
    }

    schema.association = assoc;
    this.entityContainer.associationSet = assoc;
  }
}
