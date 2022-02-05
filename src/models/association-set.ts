import { Edm, } from 'ts-odatajs';

import { AssociationEndpoint } from '.';

/**
 * Association set representing the endpoints of a referential constraint.
 */
export class AssociationSet {
    private _endpoints: AssociationEndpoint[];

    /**
     * Namespace  of the association set.
     */
    public namespace: string;

    /**
     * Creates an association set instance.
     * @constructor
     * @param namespace The namespace.
     * @param endpoint The primary endpoint.
     * @param partnerEndpoint The partner endpoint.
     */
    public constructor(namespace: string, endpoint: AssociationEndpoint, partnerEndpoint: AssociationEndpoint) {
        this.namespace = namespace;
        this.endpoints = [endpoint, partnerEndpoint];
    }

    /**
     * Gets the association name.
     */
    public get associationName(): string {
        const result = `${this.namespace}.${this.name}`;

        return result;
    }

    /**
     * Determines whether either end of the association contains the specified navigation property.
     * @param navigationProperty The navigation property to check for.
     * @returns true if property is associated with one of the endpoints.
     */
    public containsProperty(navigationProperty: Edm.NavigationProperty): boolean {
        const result = !!navigationProperty
            && this.endpoints.some(e => e.navigationProperty === navigationProperty);

        return result;
    }

    /**
     * Gets the endpoints of the association set.
     */
    public get endpoints(): AssociationEndpoint[] {
        return this._endpoints;
    }

    public set endpoints(value: AssociationEndpoint[]) {
        this._endpoints = value.sort((a, b) => a.order - b.order);
    }

    /**
     * Gets the partner endpoint for the provided endpoint.
     * @param endpoint The endpoint.
     * @returns The partner endpoint, if any.
     */
    public getPartnerEndpoint(endpoint: AssociationEndpoint): AssociationEndpoint {
        const result = endpoint && this.endpoints.find(e => e !== endpoint);

        return result;
    }

    /**
     * Determines whether the endpoints in the association are fully mapped.
     */
    public get fullyMapped(): boolean {
        const result = this.endpoints.every(e => e.isMapped);

        return result;
    }

    /**
     * Gets the association name.
     */
    public get name(): string {
        const result = this.endpoints
            .map(e => e.role)
            .join('_');

        return result;
    }
}
