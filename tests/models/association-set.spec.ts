import { Edm } from 'ts-odatajs';

import { AssociationEndpoint, AssociationSet } from '../../src/models';

describe('AssociationSet', () => {

    const namespace = 'TestNamespace';
    let endpoint: AssociationEndpoint;
    let partnerEndpoint: AssociationEndpoint;
    let sut: AssociationSet;

    beforeEach(() => {
        endpoint = new AssociationEndpoint({
            containingEntityType: 'TestNamespace.Entity1',
            navigationProperty: <Edm.NavigationProperty>{
                name: 'Item',
            },
            partnerEntityType: 'TestNamespace.Entity2'
        });
        partnerEndpoint = new AssociationEndpoint({
            containingEntityType: 'TestNamespace.Entity2',
            navigationProperty: <Edm.NavigationProperty>{
                name: 'Items',
                type: 'Collection(TestNamespace.Entity1)'
            },
            partnerEntityType: 'TestNamespace.Entity1'
        });

        sut = new AssociationSet(namespace, endpoint, partnerEndpoint);
    });

    describe('ctor', () => {
        it('should set namespace', () => {
            const result = new AssociationSet(namespace, endpoint, partnerEndpoint);
            expect(result.namespace).toBe(namespace);
        });

        it('should set endpoint', () => {
            const result = new AssociationSet(namespace, endpoint, partnerEndpoint);
            expect(result.endpoints).toContain(endpoint);
        });

        it('should set partnerEndpoint', () => {
            const result = new AssociationSet(namespace, endpoint, partnerEndpoint);
            expect(result.endpoints).toContain(partnerEndpoint);
        });
    });

    describe('associationName', () => {
        it('should return namespace and name', () => {
            const result = sut.associationName;

            expect(result).toBe(`${sut.namespace}.${sut.name}`);
        });
    });

    describe('containsProperty', () => {
        it('should return false for null', () => {
            const result = sut.containsProperty(null);

            expect(result).toBeFalsy();
        });

        it('should return true when contains navigation property', () => {
            const result = sut.containsProperty(endpoint.navigationProperty);

            expect(result).toBeTruthy();
        });

        it('should return false when not contains navigation property', () => {
            const unknownProp = <Edm.NavigationProperty>{};
            const result = sut.containsProperty(unknownProp);

            expect(result).toBeFalsy();
        });
    });

    describe('endpoints', () => {
        it('get should return sorted endpoints', () => {
            const result = sut.endpoints;
            expect(result).toHaveLength(2);
            expect(result[0]).toBe(endpoint);
            expect(result[1]).toBe(partnerEndpoint);
        });

        it('set should set endpoints', () => {
            sut.endpoints = [partnerEndpoint, endpoint];
            expect(sut.endpoints[0]).toBe(endpoint);
            expect(sut.endpoints[1]).toBe(partnerEndpoint);
        });
    });

    describe('getPartnerEndpoint', () => {
        it('should return null for null endpoint', () => {
            const result = sut.getPartnerEndpoint(null);

            expect(result).toBeNull();
        });

        it('should return other endpoint', () => {
            const result = sut.getPartnerEndpoint(endpoint);

            expect(result).toBe(partnerEndpoint);
        });
    });

    describe('fullyMapped', () => {
        it('should return true when both endpoints contain a navigation property', () => {
            const result = sut.fullyMapped;

            expect(result).toBeTruthy();
        });

        it('should return false when an endpoint does not contain a navigation property', () => {
            endpoint.navigationProperty = null;
            const result = sut.fullyMapped;

            expect(result).toBeFalsy();
        });
    });

    describe('name', () => {
        it('should return joined endpoint roles', () => {
            const result = sut.name;

            expect(result).toBe(`${endpoint.role}_${partnerEndpoint.role}`);
        });
    });
});
