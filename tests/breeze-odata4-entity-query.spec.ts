import { EntityQuery } from 'breeze-client';

import { ExpandParamsKey, OData4EntityQuery } from '../src/breeze-odata4-entity-query';

describe('OData4EntityQuery', () => {

    const sut = new OData4EntityQuery();

    describe('expand', () => {
        it('should return EntityQuery when called without subquery', () => {
            const propertyPaths = 'test';
            const result = sut.expand(propertyPaths);
            expect(result).toBeInstanceOf(EntityQuery);
        });

        it('should set expandClause when called without subquery', () => {
            const propertyPaths = 'test';
            const result = sut.expand(propertyPaths);
            expect(result.expandClause).toBeTruthy();
        });

        it('should return instance when called with subquery', () => {
            const propertyPaths = 'test';
            const result = sut.expand(propertyPaths, new EntityQuery());
            expect(result).toBe(sut);
        });

        it('should set parameters when called with subquery', () => {
            const propertyPaths = 'test';
            const result = sut.expand(propertyPaths, new EntityQuery());
            expect(result.parameters[ExpandParamsKey]).toBeTruthy();
        });
    });
});
