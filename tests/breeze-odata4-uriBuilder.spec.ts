import { config, EntityQuery, MetadataStore, Predicate } from 'breeze-client';

import { OData4PredicateVisitor } from '../src/breeze-odata4-predicateVisitor';
import { OData4UriBuilder } from './../src/breeze-odata4-uriBuilder';

jest.mock('../src/breeze-odata4-predicateVisitor');
const jsonMetadata = require('./breeze_metadata.json');

describe('OData4UriBuilder', () => {
    it('should register UriBuilder when register is called', () => {
        OData4UriBuilder.register();
        config.initializeAdapterInstance('uriBuilder', OData4UriBuilder.BreezeAdapterName, true);

        const adapter = config.getAdapterInstance('uriBuilder');
        expect(adapter).toBeInstanceOf(OData4UriBuilder);
    });

    it('should call OData4PredicateVisitor.initialize when initialize is called', () => {
        const sut = new OData4UriBuilder();
        sut.initialize();
        expect(OData4PredicateVisitor.initialize).toHaveBeenCalled();
    });

    describe('buildUri', () => {
        const sut = new OData4UriBuilder();
        sut.initialize();

        let metadataStore: MetadataStore;
        let query: EntityQuery;

        beforeEach(() => {
            metadataStore = new MetadataStore();
            metadataStore.importMetadata(jsonMetadata);
            query = new EntityQuery('Person');
        });

        it('should return resource name with no options', () => {
            const result = sut.buildUri(query, new MetadataStore());
            expect(result).toEqual(query.resourceName);
        });

        it('should add count when inlineCountEnabled=true', () => {
            query = query.inlineCount(true);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$count=true`);
        });

        it('should add skip when skip is set', () => {
            const skipCount = 5;
            query = query.skip(skipCount);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$skip=${skipCount}`);
        });

        it('should add top when take is set', () => {
            const takeCount = 5;
            query = query.take(takeCount);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$top=${takeCount}`);
        });

        it('should add expand option', () => {
            const navProperty = 'id';
            query = query.expand(navProperty);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=${navProperty}`);
        });

        it('should add select option', () => {
            const selectValue = 'personId,firstName';
            query = query.select(selectValue);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$select=${selectValue}`);
        });

        it('should add filter option', () => {
            const predicate = new Predicate('firstName', 'eq', 'Test');
            query = query.where(predicate);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$filter=firstName%20eq%20'Test'`);
        });

        it('should add orderby option', () => {
            const orderBy = 'firstName';
            query = query.orderBy(orderBy);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$orderby=${orderBy}`);
        });

        it('should add orderby desc option', () => {
            const orderBy = 'firstName';
            query = query.orderBy(orderBy, true);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$orderby=${orderBy}%20desc`);
        });

        it('should add expand option', () => {
            const navProperty = 'id';
            query = query.expand(navProperty);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=${navProperty}`);
        });

        it('should add select and expand option', () => {
            const navProp = 'id';
            const navPropSelect = 'idType';
            const selectValue = `${navProp}.${navPropSelect}`;
            query = query.select(selectValue);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=${navProp}($select=${navPropSelect})`);
        });

        it('should add filter and orderby options', () => {
            const predicate = new Predicate('firstName', 'eq', 'Test');
            const orderBy = 'firstName';
            query = query.where(predicate)
                .orderBy(orderBy);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$filter=firstName%20eq%20'Test'&$orderby=${orderBy}`);
        });

        it('should replace parameters in query', () => {
            const paramName = 'param1';
            const paramValue = 'TestParam';
            query.parameters = { param1: paramValue };
            query.resourceName = `GetValues({${paramName}})`;

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`GetValues(${paramValue})`);
        });

        it('should replace null parameter with empty string in query', () => {
            const paramName = 'param1';
            const paramValue = null;
            query.parameters = { param1: paramValue };
            query.resourceName = `GetValues({${paramName}})`;

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual('GetValues()');
        });

        it('should add expand and select for multiple navigation properties', () => {
            const navProp1 = 'spouse.firstName';
            const navProp2 = 'id.idType';
            const selectValue = `${navProp1},${navProp2}`;
            query = query.select(selectValue).orderBy(navProp1);

            const result = sut.buildUri(query, metadataStore);
            // tslint:disable-next-line:max-line-length
            expect(result).toEqual(`${query.resourceName}?$expand=spouse($select=firstName),id($select=idType)&$orderby=spouse%2FfirstName`);
        });

        it('should add select, filter, and orderby options for navigation properties', () => {
            const navProp1 = 'spouse.firstName';
            const predicate1 = new Predicate('spouse.firstName', 'eq', 'Test');
            query = query.select(navProp1).where(predicate1).orderBy(navProp1);

            const result = sut.buildUri(query, metadataStore);
            // tslint:disable-next-line:max-line-length
            expect(result).toEqual(`${query.resourceName}?$expand=spouse($select=firstName)&$filter=spouse%2FfirstName%20eq%20'Test'&$orderby=spouse%2FfirstName`);
        });
    });

});
