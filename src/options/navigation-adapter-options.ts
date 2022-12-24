import { AssociationEndpoint } from '../models';

/**
 * The default navigation adapter options.
 */
export const DefaultNavigationAdapterOptions: NavigationAdapterOptions = {
  allowManyToMany: false,
  foreignKeyConventions: [
    (endpoint, suffix) => `${endpoint.propertyName}${suffix}`.toLowerCase(),
    (endpoint) => `${endpoint.propertyName}Id`.toLowerCase(),
    (endpoint, suffix) => `${endpoint.partnerEntityShortName}${suffix}`.toLowerCase(),
    (endpoint) => `${endpoint.partnerEntityShortName}Id`.toLowerCase(),
    getPartialMatchingProperty,
    (endpoint) => getPartialMatchingProperty(endpoint, 'id')
  ],
  inferNavigationPropertyPartner: true,
  inferReferentialConstraints: true
};

function getPartialMatchingProperty(endpoint: AssociationEndpoint, suffix: string): string {
  const propertyName = endpoint.propertyName.toLowerCase();
  const partnerEntityName = endpoint.partnerEntityShortName.toLowerCase();
  const propertyEnd = propertyName.replace(partnerEntityName, '');
  if (!propertyEnd || propertyEnd === suffix) {
    return null;
  }

  const result = `${propertyEnd}${suffix}`.toLowerCase();

  return result;
}

/**
 * The navigation adapter options.
 */
export interface NavigationAdapterOptions {
  /** Determines whether to allow many-to-many entity relationships.
   * @default false
   */
  allowManyToMany: boolean;

  /** Additional conventions used to infer foreign key properties. These are preferred over the defaults.
   * These conventions are used to infer referential constraints for navigation properties.
   * @default
   *
   *     [endpoint.propertyName][suffix]
   *     [endpoint.propertyName]Id
   *     [endpoint.partnerEntityShortName][suffix]
   *     [endpoint.partnerEntityShortName]Id
   */
  foreignKeyConventions: ((endpoint: AssociationEndpoint, suffix: string) => string)[];

  /** Determines whether to infer referential constraints when the referentialConstraint attribute is missing.
   * @default true
   */
  inferReferentialConstraints: boolean;

  /** Determines whether to infer the partner when the partner attribute is missing.
   * @default true
   */
  inferNavigationPropertyPartner: boolean;
}
