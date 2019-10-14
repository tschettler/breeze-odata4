import { Edm, } from 'ts-odatajs';

import { AssociationEndpoint } from './models';

export class AssociationSet {
    private _endpoints: AssociationEndpoint[];

    public namespace: string;

    public constructor(namespace: string, endpoint: AssociationEndpoint, partnerEndpoint: AssociationEndpoint) {
        this.namespace = namespace;
        this.endpoints = [endpoint, partnerEndpoint];
    }

    public get associationName(): string {
        const result = `${this.namespace}.${this.name}`;

        return result;
    }

    public containsProperty(navigationProperty: Edm.NavigationProperty): boolean {
        const result = !!navigationProperty
            && this.endpoints.some(e => e.navigationProperty === navigationProperty);

        return result;
    }

    public get endpoints(): AssociationEndpoint[] {
        return this._endpoints;
    }

    public set endpoints(value: AssociationEndpoint[]) {
        this._endpoints = value.sort((a, b) => a.order - b.order);
    }

    public getPartnerEndpoint(endpoint: AssociationEndpoint): AssociationEndpoint {
        const result = endpoint && this.endpoints.find(e => e !== endpoint);

        return result;
    }

    public get fullyMapped(): boolean {
        const result = this.endpoints.every(e => e.isMapped);

        return result;
    }

    public get name(): string {
        const result = this.endpoints
            .map(e => e.role)
            .join('_');

        return result;
    }
}
