import { config, EntityQuery, MetadataStore, Predicate } from 'breeze-client';
import { AjaxFetchAdapter } from 'breeze-client/adapter-ajax-fetch';
import { DataServiceWebApiAdapter } from 'breeze-client/adapter-data-service-webapi';
import { ModelLibraryBackingStoreAdapter } from 'breeze-client/adapter-model-library-backing-store';
import { UriBuilderODataAdapter } from 'breeze-client/adapter-uri-builder-odata';

import { OData4EntityQuery } from '../src/breeze-odata4-entity-query';
import { OData4PredicateVisitor } from '../src/breeze-odata4-predicateVisitor';
import { OData4UriBuilder } from '../src/breeze-odata4-uriBuilder';

jest.mock('../src/breeze-odata4-predicateVisitor');
import jsonMetadata = require('./breeze_metadata.json');

describe('OData4UriBuilder', () => {
    beforeAll(() => {
        ModelLibraryBackingStoreAdapter.register();
        new UriBuilderODataAdapter().initialize();
        AjaxFetchAdapter.register();
        DataServiceWebApiAdapter.register();
    });

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

        it('should add multiple filter options', () => {
            const predicate = new Predicate('firstName', 'eq', 'Test');
            query = query.where(predicate).where('personId', 'eq', 1);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$filter=(firstName%20eq%20'Test')%20and%20(personId%20eq%201)`);
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

        it('should add expand option with select', () => {
            const navProp = 'id';
            const navPropSelect = 'idType';
            const selectValue = `${navProp}.${navPropSelect}`;
            query = query.select(selectValue);

            const result = sut.buildUri(query, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=${navProp}($select=${navPropSelect})`);
        });

        it('should add expand with merged select', () => {
            const expandSelect = 'personId';
            query = query.select(expandSelect);

            const navProperty = 'spouse';
            const navPropSelect = 'firstName';
            const selectValue = `${navProperty}.${navPropSelect}`;
            const newQuery = new OData4EntityQuery('Person')
                .expand(navProperty, query)
                .select(selectValue);

            const result = sut.buildUri(newQuery, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=${navProperty}($select=${navPropSelect},${expandSelect})`);
        });

        it('should add expand with unique select names', () => {
            const navProperty = 'spouse';
            const navPropSelect = 'firstName';
            query = query.select(navPropSelect);
            const selectValue = `${navProperty}.${navPropSelect}`;
            const newQuery = new OData4EntityQuery('Person')
                .expand(navProperty, query)
                .select(selectValue);

            const result = sut.buildUri(newQuery, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=${navProperty}($select=${navPropSelect})`);
        });

        it('should add expand with unique nested expand', () => {
            const navProperty = 'spouse';
            query = query.expand(navProperty);
            const expandValue = `${navProperty}.${navProperty}`;
            const newQuery = new OData4EntityQuery('Person')
                .expand(navProperty, query)
                .expand(expandValue);

            const result = sut.buildUri(newQuery, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=${navProperty}($expand=${navProperty})`);
        });

        it('should add expand option with filter', () => {
            const navProperty = 'spouse';
            query = query.where('firstName', 'eq', 'Test');

            const newQuery = new OData4EntityQuery('Person')
                .expand(navProperty, query);

            const result = sut.buildUri(newQuery, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=${navProperty}($filter=firstName%20eq%20'Test')`);
        });

        it('should add multiple expand options', () => {
            const navProperty = 'spouse';
            query = query.where('firstName', 'eq', 'Test');

            const newQuery = new OData4EntityQuery('Person')
                .expand(navProperty, query)
                .expand('id');

            const result = sut.buildUri(newQuery, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=id,${navProperty}($filter=firstName%20eq%20'Test')`);
        });

        it('should add multiple expand options with suboptions', () => {
            const navProperty1 = 'spouse';
            const query1 = query.where('firstName', 'eq', 'Test');

            const navProperty2 = 'id';
            const navPropSelect = 'idType';
            const query2 = new EntityQuery('Identification').select(navPropSelect);

            const newQuery = new OData4EntityQuery('Person')
                .expand(navProperty1, query1)
                .expand(navProperty2, query2);

            const result = sut.buildUri(newQuery, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=${navProperty1}($filter=firstName%20eq%20'Test'),${navProperty2}($select=${navPropSelect})`);
        });

        it('should add nested expand options', () => {
            const navProperty = 'spouse';
            query = query.expand('spouse');

            const newQuery = new OData4EntityQuery('Person')
                .expand(navProperty, query);

            const result = sut.buildUri(newQuery, metadataStore);
            expect(result).toEqual(`${query.resourceName}?$expand=${navProperty}($expand=${navProperty})`);
        });

        it('should add expand option with select and filter', () => {
            const navProperty = 'spouse';
            const navPropSelect = 'firstName';
            const selectValue = `${navProperty}.${navPropSelect}`;
            query = query
                .where('firstName', 'eq', 'Test');

            const newQuery = new OData4EntityQuery('Person')
                .expand(navProperty, query)
                .select(selectValue);

            const result = sut.buildUri(newQuery, metadataStore);
            expect(result).toEqual(
                `${query.resourceName}?$expand=${navProperty}($filter=firstName%20eq%20'Test';$select=${navPropSelect})`);
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
