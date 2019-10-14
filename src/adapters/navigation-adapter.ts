import { Edm, EdmExtra, Edmx, oData } from 'ts-odatajs';

import { MetadataAdapter } from './adapters';
import { AssociationEndpoint, AssociationSet } from '../models/models';

export const EntityNotFound = 'Could not find entity with type name';
const PartnerSuffix = 'Partner';

export class NavigationAdapter implements MetadataAdapter {

  public static inferPartner = true;

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

    const partnerNavProp = this.tryGetPartnerNavigationProperty(endpoint);

    const partnerEndpoint = new AssociationEndpoint({
      containingEntityType: navPropType,
      partnerEntityType: `${namespace}.${entityTypeName}`,
      navigationProperty: partnerNavProp,
      propertyName: !!partnerNavProp ? null : `${navigationProperty.name}${PartnerSuffix}`
    });

    this.setAssociationSet(namespace, endpoint, partnerEndpoint);
  }

  private getUnderlyingEntityType(navigationProperty: Edm.NavigationProperty) {
    const result = oData.utils.getCollectionType(navigationProperty.type) || navigationProperty.type;

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

    let partnerNavProp = partnerEntityType.navigationProperty
      .find(n => n !== navProp
        && partnerNameCandidates.includes(n.name)
        && (!n.partner || n.partner === navProp.name));

    if (!!partnerNavProp || !NavigationAdapter.inferPartner) {
      // (partnerNavProp || <any>{}).partner = navProp.name;

      return partnerNavProp;
    }

    // try to find the partner nav prop by type
    partnerNavProp = partnerEntityType.navigationProperty
      .find(n => n !== navProp
        && this.navigationPropertyTypeMatches(n, endpoint.containingEntityType)
        && (!n.partner || n.partner === navProp.name));

    return partnerNavProp;
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

    let constraint: Edm.ReferentialConstraint = null;
    association.endpoints.find(e => {
      if (!e.isMapped) {
        return false;
      }

      constraint = (e.navigationProperty.referentialConstraint || [])[0];

      if (!constraint) {
        return false;
      }

      const partnerEndpoint = association.getPartnerEndpoint(e);
      result.principal.role = e.role;
      result.dependent.role = partnerEndpoint.role;

      return true;
    });

    if (!constraint) {
      return null;
    }

    constraintKeys[result.dependent.role] = [{ name: constraint.property }];
    constraintKeys[result.principal.role] = [{ name: constraint.referencedProperty }];

    Object.keys(result).forEach(p => {
      const member: EdmExtra.ConstraintMember = result[p];

      member.propertyRef = constraintKeys[member.role];
    });

    return result;
  }
}
