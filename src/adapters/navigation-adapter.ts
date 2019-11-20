import { Edm, EdmExtra, Edmx, oData } from 'ts-odatajs';
import { AssociationEndpoint, AssociationSet } from '../models/models';
import { MetadataAdapter } from './metadata-adapter';


export const EntityNotFound = 'Could not find entity with type name';
const PartnerSuffix = 'Partner';

export class NavigationAdapter implements MetadataAdapter {
  /** Determines whether to allow many-to-many entity relationships.
   * @default false
   */
  public static allowManyToMany = false;

  /** Determines whether to infer referential constraints when the referentialConstraint attribute is missing.
   * @default true
   */
  public static inferConstraints = true;

  /** Determines whether to infer the partner when the partner attribute is missing.
   * @default true
   */
  public static inferPartner = true;

  /** Conventions used to infer foreign key properties.
  */
  public static foreignKeyConventions: ((endpoint: AssociationEndpoint, suffix: string) => string)[] = [
    (endpoint, suffix) => `${endpoint.propertyName}${suffix}`.toLowerCase(),
    (endpoint) => `${endpoint.propertyName}Id`.toLowerCase(),
    (endpoint, suffix) => `${endpoint.partnerEntityShortName}${suffix}`.toLowerCase(),
    (endpoint) => `${endpoint.partnerEntityShortName}Id`.toLowerCase()
  ];

  private metadata: Edmx.DataServices;
  private entityContainer: Edm.EntityContainer;
  private associations: AssociationSet[] = [];

  public adapt(metadata: Edmx.DataServices): void {
    this.metadata = metadata;

    this.entityContainer = oData.utils.lookupDefaultEntityContainer(this.metadata.schema);

    oData.utils.forEachSchema(this.metadata.schema, this.adaptSchema.bind(this));
  }

  public adaptSchema(schema: Edm.Schema): void {
    this.associations = [];

    const entityTypes: Edm.EntityType[] = schema.entityType || [];
    entityTypes.forEach(e => this.adaptEntityType(schema, e));

    this.setAssociations(schema);
  }

  private adaptEntityType(schema: Edm.Schema, entityType: Edm.EntityType): void {
    (entityType.navigationProperty || []).forEach(n => this.adaptNavigationProperty(schema, entityType.name, n));
  }

  private adaptNavigationProperty(schema: Edm.Schema, entityTypeName: string, navigationProperty: Edm.NavigationProperty): void {
    const namespace = schema.namespace;
    const navPropType = this.getUnderlyingEntityType(navigationProperty);

    const endpoint = new AssociationEndpoint({
      containingEntityType: `${namespace}.${entityTypeName}`,
      partnerEntityType: navPropType,
      navigationProperty: navigationProperty
    });

    this.trySetReferentialConstraint(endpoint);

    let partnerNavProp = this.tryGetPartnerNavigationProperty(endpoint);

    if (!this.validateRelationship(navigationProperty, partnerNavProp)) {
      partnerNavProp = null;
    }

    const partnerEndpoint = new AssociationEndpoint({
      containingEntityType: navPropType,
      partnerEntityType: `${namespace}.${entityTypeName}`,
      navigationProperty: partnerNavProp,
      propertyName: !!partnerNavProp ? null : `${navigationProperty.name}${PartnerSuffix}`
    });

    this.trySetReferentialConstraint(partnerEndpoint);

    this.setAssociationSet(namespace, endpoint, partnerEndpoint);
  }

  private getUnderlyingEntityType(navigationProperty: Edm.NavigationProperty): string {
    const result = oData.utils.getCollectionType(navigationProperty.type) || navigationProperty.type;

    return result;
  }

  private trySetReferentialConstraint(endpoint: AssociationEndpoint): void {
    if (endpoint.isMapped && endpoint.navigationProperty.referentialConstraint) {
      endpoint.referentialConstraint = endpoint.navigationProperty.referentialConstraint;
      return;
    }

    if (endpoint.isCollection || !NavigationAdapter.inferConstraints) {
      return;
    }

    const entityType = oData.utils.lookupEntityType(endpoint.containingEntityType, this.metadata.schema);
    const partnerEntityType = oData.utils.lookupEntityType(endpoint.partnerEntityType, this.metadata.schema);

    if (partnerEntityType === null) {
      throw new Error(`${EntityNotFound} ${endpoint.partnerEntityType}`);
    }

    const entityName = endpoint.containingEntityShortName;
    const partnerEntityName = endpoint.partnerEntityShortName;
    const referentialConstraint: Edm.ReferentialConstraint[] = [];

    const entityKeys = this.getKeys(entityType);
    const entityProperties = this.getProperties(entityType);
    const partnerKeys = this.getKeys(partnerEntityType);
    const partnerProperties = this.getProperties(partnerEntityType);

    partnerKeys.forEach(r => {
      const partnerKeyProp = partnerProperties.find(p => p.name === r.name);
      const keySuffix = r.name.replace(partnerEntityName, '');
      let possibleFKs: string[];
      // this could be true for a 1:1 relationship where the PK is also the FK
      if (r.name.toLowerCase() === `${entityName}Id`.toLowerCase()) {
        possibleFKs = entityKeys.map(p => p.name.toLowerCase());
      } else {
        possibleFKs = NavigationAdapter.foreignKeyConventions
          .map(func => func(endpoint, keySuffix))
          .filter(p => !referentialConstraint.find(rc => rc.property.toLowerCase() === p));
      }

      const propsMatchingType = entityProperties.filter(p => p.type === partnerKeyProp.type);

      const fkProp = possibleFKs
        .map(fk => propsMatchingType.find(p => p.name.toLowerCase() === fk))
        .find(p => !!p);

      if (fkProp) {
        referentialConstraint.push({ property: fkProp.name, referencedProperty: r.name });
      }
    });

    endpoint.referentialConstraint = referentialConstraint;
  }

  private getAllTypes(entityType: Edm.EntityType): Edm.EntityType[] {
    const result = [entityType];
    let currentType = entityType;
    while (!!currentType.baseType) {
      const baseType = currentType.baseType;
      currentType = oData.utils.lookupEntityType(currentType.baseType, this.metadata.schema);

      if (currentType === null) {
        throw new Error(`${EntityNotFound} ${baseType}`);
      }

      result.push(currentType);
    }

    return result;
  }

  private getKeys(entityType: Edm.EntityType): Edm.PropertyRef[] {
    const types = this.getAllTypes(entityType);

    const result: Edm.PropertyRef[] = types
      .reduce((a: Edm.PropertyRef[], b: Edm.EntityType) => a.concat((b.key && b.key.propertyRef) || []), []);

    return result;
  }

  private getNavigationProperties(entityType: Edm.EntityType): Edm.NavigationProperty[] {
    const types = this.getAllTypes(entityType);

    const result: Edm.NavigationProperty[] = types
      .reduce((a: Edm.NavigationProperty[], b: Edm.EntityType) => a.concat(b.navigationProperty || []), []);

    return result;
  }

  private getProperties(entityType: Edm.EntityType): Edm.Property[] {
    const types = this.getAllTypes(entityType);

    const result: Edm.Property[] = types
      .reduce((a: Edm.Property[], b: Edm.EntityType) => a.concat(b.property || []), []);

    return result;
  }

  private tryGetPartnerNavigationProperty(endpoint: AssociationEndpoint): Edm.NavigationProperty {
    const navProp = endpoint.navigationProperty;
    const navPropType = this.getUnderlyingEntityType(navProp);
    const partnerEntityType = oData.utils.lookupEntityType(navPropType, this.metadata.schema);

    if (partnerEntityType === null) {
      throw new Error(`${EntityNotFound} ${navPropType}`);
    }

    const partnerNameCandidates = [];

    if (navProp.partner) {
      partnerNameCandidates.push(navProp.partner);
    } else if (NavigationAdapter.inferPartner) {
      const entitySetName = this.getEntitySetNameByEntityType(endpoint.containingEntityType);
      partnerNameCandidates.push(endpoint.containingEntityShortName);
      partnerNameCandidates.push(entitySetName);
    }

    const partnerNavProperties = this.getNavigationProperties(partnerEntityType);
    let partnerNavProp = partnerNavProperties
      .find(n => n !== navProp
        && partnerNameCandidates.includes(n.name)
        && (!n.partner || n.partner === navProp.name));

    if (!!partnerNavProp || !NavigationAdapter.inferPartner) {
      // (partnerNavProp || <any>{}).partner = navProp.name;

      return partnerNavProp;
    }

    // try to find the partner nav prop by type
    partnerNavProp = partnerNavProperties
      .find(n => n !== navProp
        && this.navigationPropertyTypeMatches(n, endpoint.containingEntityType)
        && (!n.partner || n.partner === navProp.name));

    return partnerNavProp;
  }

  private validateRelationship(...navigationProperties: Edm.NavigationProperty[]) {
    const result = NavigationAdapter.allowManyToMany
      || !navigationProperties.every(n => !!n && oData.utils.isCollectionType(n.type));

    return result;
  }

  private getEntitySetNameByEntityType(entityType: string): string {
    const set = this.entityContainer.entitySet.find(s => s.entityType === entityType);

    return set && set.name;
  }

  private navigationPropertyTypeMatches(navigationProperty: Edm.NavigationProperty, type: string): boolean {
    const navPropType = this.getUnderlyingEntityType(navigationProperty);
    const result = navPropType === type;
    return result;
  }

  private setAssociationSet(namespace: string,
    endpoint: AssociationEndpoint,
    partnerEndpoint: AssociationEndpoint): void {

    // find related partial association
    const assoc = this.associations.find(a => (a.containsProperty(partnerEndpoint.navigationProperty)
      || a.containsProperty(endpoint.navigationProperty)));

    const mappedEndpoints = [endpoint, partnerEndpoint].filter(e => assoc && assoc.containsProperty(e.navigationProperty));

    if (mappedEndpoints.length === 2) {
      // found existing association for the endpoints that is fully mapped, nothing more to do
      return;
    }

    const newAssoc = new AssociationSet(namespace, endpoint, partnerEndpoint);

    if (assoc && !assoc.fullyMapped && newAssoc.fullyMapped) {
      // existing association is incomplete, use new endpoints
      assoc.endpoints = newAssoc.endpoints;
    } else if (!assoc || newAssoc.fullyMapped) {
      // no existing association, add new
      this.associations.push(newAssoc);
    }
  }

  private setAssociations(schema: Edm.Schema): void {
    const associations = this.associations.map(a => this.processAssociation(a));
    schema.association = associations;
    this.entityContainer.associationSet = associations;
  }

  private getAssociationEndpoint(endpoint: AssociationEndpoint): EdmExtra.AssociationEndpoint {
    const result: EdmExtra.AssociationEndpoint = {
      entitySet: this.getEntitySetNameByEntityType(endpoint.partnerEntityType),
      multiplicity: endpoint.multiplicity,
      role: endpoint.role,
      type: endpoint.partnerEntityType
    };

    return result;
  }

  public processAssociation(association: AssociationSet): EdmExtra.Association {
    const result: EdmExtra.Association = {
      association: association.associationName,
      name: association.name,
      end: association.endpoints.map(e => this.getAssociationEndpoint(e)),
      referentialConstraint: this.getReferentialConstraint(association)
    };

    association.endpoints.forEach(e => {
      if (!e.isMapped) {
        return;
      }

      const partnerEndpoint = association.getPartnerEndpoint(e);
      const navProp = e.navigationProperty;

      if (!!navProp.relationship) {
        return;
      }

      navProp.relationship = association.associationName;
      navProp.fromRole = partnerEndpoint.role;
      navProp.toRole = e.role;
    });

    return result;
  }

  private getReferentialConstraint(association: AssociationSet): EdmExtra.AssociationConstraint {
    const constraintKeys: { [key: string]: Edm.PropertyRef[] } = {};
    const result: EdmExtra.AssociationConstraint = {
      dependent: {
        propertyRef: null,
        role: null
      },
      principal: {
        propertyRef: null,
        role: null
      }
    };

    // principal endpoint cannot be a collection
    const principalEndpoint = association.endpoints[0].isCollection ? association.endpoints[1] : association.endpoints[0];
    const dependentEndpoint = association.getPartnerEndpoint(principalEndpoint);

    const constraint = principalEndpoint.referentialConstraint;

    if (constraint.length === 0) {
      return null;
    }

    result.principal.role = principalEndpoint.role;
    result.dependent.role = dependentEndpoint.role;

    constraintKeys[result.dependent.role] = constraint.map(p => ({ name: p.property }));
    constraintKeys[result.principal.role] = constraint.map(p => ({ name: p.referencedProperty }));

    Object.keys(result).forEach(p => {
      const member: EdmExtra.ConstraintMember = result[p];

      member.propertyRef = constraintKeys[member.role];
    });

    return result;
  }
}
