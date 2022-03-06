import { AjaxConfig, config, DataProperty, DataType, Entity, EntityManager, MetadataStore, SaveResult } from 'breeze-client';
import { ModelLibraryBackingStoreAdapter } from 'breeze-client/adapter-model-library-backing-store';
import { Batch, Edmx } from 'ts-odatajs';

import { OData4AjaxAdapter } from '../../src/ajax-adapters';
import { DataServiceSaveContext } from '../../src/breeze-odata4-dataService-adapter';
import { ODataHttpClient } from '../../src/odata-http-client';
import jsonMetadata = require('../breeze_metadata.json');

class TestOData4AjaxAdapter extends OData4AjaxAdapter {
    constructor() {
        super();
        this.checkForRecomposition = jest.fn();
    }

    public name = 'TestAdapter';

    public initialize = jest.fn();

    public ajax(_config: AjaxConfig, _httpClient?: ODataHttpClient, _metadata?: Edmx.Edmx): void {
        throw new Error('Method not implemented.');
    }
}

describe('OData4AjaxAdapter', () => {
    const sut = new TestOData4AjaxAdapter();

    beforeAll(() => {
        ModelLibraryBackingStoreAdapter.register();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('name should return name', () => {
        expect(sut.name).toEqual('TestAdapter');
    });

    it('registerAdapter should set impl', () => {
        config.registerAdapter<OData4AjaxAdapter>('ajax', TestOData4AjaxAdapter);
        const result = config.initializeAdapterInstance('ajax', 'TestAdapter');
        expect(result._$impl).toBeTruthy();
    });

    it('initializeAdapterInstance should call initialize', () => {
        config.registerAdapter<OData4AjaxAdapter>('ajax', TestOData4AjaxAdapter);
        const result = config.initializeAdapterInstance('ajax', 'TestAdapter');

        expect(result.initialize).toHaveBeenCalled();
    });

    it('initializeAdapterInstance should call checkForRecomposition', () => {

        config.registerAdapter<OData4AjaxAdapter>('ajax', TestOData4AjaxAdapter);
        const result = config.initializeAdapterInstance('ajax', 'TestAdapter');

        const subscriptionKey = config.interfaceInitialized.subscribe(args => {
            config.interfaceInitialized.unsubscribe(subscriptionKey);
            expect(result.initialize).toHaveBeenCalled();
        });
    });

    it('defaultSettings should contain OData version header', () => {
        expect(sut.defaultSettings?.headers['OData-Version']).toEqual('4.0');
    });

    describe('createChangeRequest', () => {
        let saveContext: DataServiceSaveContext;
        let entityManager: EntityManager;
        let metadataStore: MetadataStore;

        beforeAll(() => {
            metadataStore = new MetadataStore();
            metadataStore.importMetadata(jsonMetadata);

            const entityType = metadataStore.getEntityTypes()[0];
            entityType.dataProperties.push(new DataProperty({
                isUnmapped: true,
                name: 'unmapped',
                nameOnServer: 'unmapped',
                dataType: DataType.String
            }));
            entityType.dataProperties.push(new DataProperty({
                isUnmapped: false,
                name: 'quotedWithValue',
                nameOnServer: 'quotedWithValue',
                dataType: DataType.Decimal
            }));

            entityType.dataProperties.push(new DataProperty({
                isUnmapped: false,
                name: 'quotedWithoutValue',
                nameOnServer: 'quotedWithoutValue',
                dataType: DataType.Decimal
            }));

            entityManager = new EntityManager({ metadataStore });
            saveContext = {
                entityManager,
                routePrefix: 'Test/',
                contentKeys: [],
                tempKeys: []
            } as any;
        });

        describe('with new entity', () => {
            let entity: Entity;
            let changeRequest: Batch.ChangeRequest;

            beforeAll(() => {
                entity = entityManager.createEntity('Person', {
                    personId: 1,
                    firstName: 'Tester',
                    quotedWithValue: 123,
                    quotedWithoutValue: null,
                    unmapped: 'This should not get pushed to the server'
                });
                entity.entityAspect.setUnchanged();

                changeRequest = sut.createChangeRequest(saveContext, entity, 1);
            });

            afterAll(() => {
                entityManager.detachEntity(entity);
            });

            it('should add contentKey to save context', () => {
                const contentId = 1;
                expect(saveContext.contentKeys[contentId]).toBe(entity);
            });

            it('should set changeRequest to null', () => {
                expect(changeRequest).toBeNull();
            });
        });

        describe('with new entity', () => {
            let entity: Entity;
            let changeRequest: Batch.ChangeRequest;

            beforeAll(() => {
                entity = entityManager.createEntity('Person', {
                    personId: 1,
                    firstName: 'Tester',
                    quotedWithValue: 123,
                    quotedWithoutValue: null,
                    unmapped: 'This should not get pushed to the server'
                });

                changeRequest = sut.createChangeRequest(saveContext, entity, 1);
            });

            afterAll(() => {
                entityManager.detachEntity(entity);
            });

            it('should add contentKey to save context', () => {
                const contentId = 1;
                expect(saveContext.contentKeys[contentId]).toBe(entity);
            });

            it('should add tempKey to save context', () => {
                const contentId = 1;
                expect(saveContext.tempKeys[contentId]).toBe(entity.entityAspect.getKey());
            });

            const expectedHeaders = [
                { key: 'Content-ID', value: '1' },
                { key: 'Content-Type', value: 'application/json;IEEE754Compatible=true' },
                { key: 'OData-Version', value: '4.0' }
            ];
            expectedHeaders.forEach(header => {
                it(`should set '${header.key}' header`, () => {
                    expect(changeRequest.headers[header.key]).toEqual(header.value);
                });
            });

            it('should set method to POST', () => {
                expect(changeRequest.method).toEqual('POST');
            });

            it('should set requestUri', () => {
                expect(changeRequest.requestUri).toEqual(`${saveContext.routePrefix}${entity.entityType.defaultResourceName}`);
            });

            it('should set data to entity', () => {
                expect(changeRequest.data).toMatchObject({
                    personId: 1,
                    firstName: 'Tester',
                    lastLogin: null
                });
            });

            it('should not include unmapped property in data', () => {
                expect(changeRequest.data.unmapped).toBeUndefined();
            });

            it('should toString quoted value', () => {
                expect(changeRequest.data.quotedWithValue).toBe('123');
            });

            it('should pass null quoted value', () => {
                expect(changeRequest.data.quotedWithoutValue).toBeNull();
            });
        });

        describe('with updated entity', () => {
            let entity: Entity;
            let changeRequest: Batch.ChangeRequest;

            beforeAll(() => {
                entity = entityManager.createEntity('Person', {
                    personId: 1,
                    firstName: 'Tester',
                    quotedWithValue: 123,
                    quotedWithoutValue: null,
                    unmapped: 'This should not get pushed to the server'
                });

                entity.entityAspect.originalValues['firstName'] = 'NotSet';
                entity.entityAspect.setModified();

                changeRequest = sut.createChangeRequest(saveContext, entity, 1);
            });

            afterAll(() => {
                entityManager.detachEntity(entity);
            });

            it('should add contentKey to save context', () => {
                const contentId = 1;
                expect(saveContext.contentKeys[contentId]).toBe(entity);
            });

            const expectedHeaders = [
                { key: 'Content-ID', value: '1' },
                { key: 'Content-Type', value: 'application/json;IEEE754Compatible=true' },
                { key: 'OData-Version', value: '4.0' }
            ];
            expectedHeaders.forEach(header => {
                it(`should set '${header.key}' header`, () => {
                    expect(changeRequest.headers[header.key]).toEqual(header.value);
                });
            });

            it('should set method to PATCH', () => {
                expect(changeRequest.method).toEqual('PATCH');
            });

            it('should set requestUri', () => {
                expect(changeRequest.requestUri).toEqual(`${saveContext.routePrefix}${entity.entityType.defaultResourceName}(${entity['personId']})`);
            });

            it('should not send unchanged property value', () => {
                expect(changeRequest.data['entityId']).toBeUndefined();
            });

            it('should send changed property value', () => {
                expect(changeRequest.data.firstName).toEqual('Tester');
            });

            it('should set extraMetadata on the entity aspect', () => {
                const result = entity.entityAspect.extraMetadata;
                const expected = `${entity.entityType.defaultResourceName}(${entity['personId']})`;
                expect(result['uriKey']).toBe(expected);
            });
        });

        describe('with deleted entity', () => {
            let entity: Entity;
            let changeRequest: Batch.ChangeRequest;

            beforeAll(async () => {
                entity = entityManager.createEntity('Person', {
                    personId: 1,
                    firstName: 'Tester',
                    quotedWithValue: 123,
                    quotedWithoutValue: null,
                    unmapped: 'This should not get pushed to the server'
                });
                entity.entityAspect.setUnchanged();
                entity.entityAspect.setDeleted();

                changeRequest = sut.createChangeRequest(saveContext, entity, 1);
            });

            afterAll(() => {
                entityManager.detachEntity(entity);
            });

            it('should add contentKey to save context', () => {
                const contentId = 1;
                expect(saveContext.contentKeys[contentId]).toBe(entity);
            });

            const expectedHeaders = [
                { key: 'Content-ID', value: '1' },
                { key: 'Content-Type', value: 'application/json;IEEE754Compatible=true' },
                { key: 'OData-Version', value: '4.0' }
            ];
            expectedHeaders.forEach(header => {
                it(`should set '${header.key}' header`, () => {
                    expect(changeRequest.headers[header.key]).toEqual(header.value);
                });
            });

            it('should set method to DELETE', () => {
                const expected = 'DELETE';
                expect(changeRequest.method).toBe(expected);
            });

            it('should set requestUri', () => {
                expect(changeRequest.requestUri).toEqual(`${saveContext.routePrefix}${entity.entityType.defaultResourceName}(${entity['personId']})`);
            });

            it('should set extraMetadata on the entity aspect', () => {
                const result = entity.entityAspect.extraMetadata;
                const expected = `${entity.entityType.defaultResourceName}(${entity['personId']})`;
                expect(result['uriKey']).toBe(expected);
            });
        });

        it('should set If-Match header to etag value', () => {
            const entity = entityManager.createEntity('Person', {
                personId: 1,
                firstName: 'Tester',
                quotedWithValue: 123,
                quotedWithoutValue: null,
                unmapped: 'This should not get pushed to the server'
            });

            entity.entityAspect.originalValues['firstName'] = 'NotSet';
            entity.entityAspect.extraMetadata = { etag: '33asfasrwasf' };
            entity.entityAspect.setModified();

            const changeRequest = sut.createChangeRequest(saveContext, entity, 1);
            entityManager.detachEntity(entity);

            const result = changeRequest.headers['If-Match'];
            const expected = entity.entityAspect.extraMetadata['etag'];
            expect(result).toBe(expected);
        });

        it('should set correct headers without default settings', () => {
            const entity = entityManager.createEntity('Person', {
                personId: 1,
                firstName: 'Tester'
            });

            const settings = sut.defaultSettings;
            sut.defaultSettings = null;
            const changeRequest = sut.createChangeRequest(saveContext, entity, 1);
            entityManager.detachEntity(entity);
            sut.defaultSettings = settings;

            expect(Object.keys(changeRequest.headers)).toMatchObject(['Content-ID', 'Content-Type']);
        });

        it('should set requestUri to uriKey', () => {
            const entity = entityManager.createEntity('Person', {
                personId: 1,
                firstName: 'Tester',
                quotedWithValue: 123,
                quotedWithoutValue: null,
                unmapped: 'This should not get pushed to the server'
            });

            entity.entityAspect.originalValues['firstName'] = 'NotSet';
            entity.entityAspect.extraMetadata = {
                uriKey: `https://localhost/${saveContext.routePrefix}${entity.entityType.defaultResourceName}(${entity['entityId']})`
            };
            entity.entityAspect.setModified();

            const changeRequest = sut.createChangeRequest(saveContext, entity, 1);
            entityManager.detachEntity(entity);

            const result = changeRequest.requestUri;
            const expected = entity.entityAspect.extraMetadata['uriKey'];
            expect(result).toBe(expected);
        });

        it('should set correct requestUri for multi-part key', () => {
            const entity = entityManager.createEntity('PersonSkill', {
                personId: 1,
                skillId: 1,
                level: 10
            });

            entity.entityAspect.originalValues['level'] = 9;
            entity.entityAspect.setModified();

            const changeRequest = sut.createChangeRequest(saveContext, entity, 1);
            entityManager.detachEntity(entity);

            const result = changeRequest.requestUri;
            const expected = `${saveContext.routePrefix}${entity.entityType.defaultResourceName}(personId=${entity['personId']},skillId=${entity['skillId']})`;
            expect(result).toBe(expected);
        });
    });

    describe('prepareSaveResult', () => {
        let saveContext: DataServiceSaveContext;
        let entityManager: EntityManager;
        let metadataStore: MetadataStore;
        let originalEntity: Entity;

        beforeAll(() => {
            metadataStore = new MetadataStore();
            metadataStore.importMetadata(jsonMetadata);

            entityManager = new EntityManager({ metadataStore });
            saveContext = {
                entityManager,
                routePrefix: 'Test/',
                contentKeys: [],
                tempKeys: []
            } as any;

            originalEntity = entityManager.createEntity('Person', {
                personId: 1,
                firstName: 'Tester',
                quotedWithValue: 123,
                quotedWithoutValue: null,
                unmapped: 'This should not get pushed to the server'
            });

            saveContext.contentKeys[1] = originalEntity;
        });

        describe('response with no data', () => {
            let changeResponses: Batch.ChangeResponse[];
            let saveResult: SaveResult;

            beforeAll(() => {
                changeResponses = [
                    createChangeResponse(),
                    createChangeResponse(1)
                ];

                saveResult = sut.prepareSaveResult(saveContext, changeResponses);
            });

            it('should not add entity without content key', () => {
                expect(saveResult.entities).toHaveLength(1);
            });

            it('should add orginal entity', () => {
                expect(saveResult.entities).toContain(saveContext.contentKeys[1]);
            });
        });

        describe('response with no content id', () => {
            let changeResponses: Batch.ChangeResponse[];
            let saveResult: SaveResult;

            beforeAll(() => {
                changeResponses = [
                    createChangeResponse(null, {
                        personId: 1,
                        firstName: 'Tester',
                        lastLoginDate: new Date()
                    })
                ];

                saveResult = sut.prepareSaveResult(saveContext, changeResponses);
            });

            it('should not add key mapping', () => {
                expect(saveResult.keyMappings).toHaveLength(0);
            });

            it('should set raw entity to entities', () => {
                expect(saveResult.entities).toContain(changeResponses[0].data);
            });
        });

        describe('response with content id', () => {
            let changeResponses: Batch.ChangeResponse[];
            let saveResult: SaveResult;

            beforeAll(() => {
                changeResponses = [
                    createChangeResponse(1, {
                        personId: 1,
                        firstName: 'Tester',
                        lastLoginDate: new Date()
                    })
                ];

                saveResult = sut.prepareSaveResult(saveContext, changeResponses);
            });

            it('should not add key mapping', () => {
                expect(saveResult.keyMappings).toHaveLength(0);
            });

            it('should set raw entity to entities', () => {
                expect(saveResult.entities).toContain(changeResponses[0].data);
            });
        });

        describe('response with content id and identity key', () => {
            let changeResponses: Batch.ChangeResponse[];
            let saveResult: SaveResult;

            beforeAll(() => {
                const entity2 = entityManager.createEntity('Skill', {
                    skillId: -1,
                    name: 'Testing'
                });

                saveContext.contentKeys[2] = entity2;

                saveContext.tempKeys[2] = entity2.entityAspect.getKey();

                changeResponses = [
                    createChangeResponse(2, {
                        skillId: 1,
                        name: 'Testing'
                    })
                ];

                saveResult = sut.prepareSaveResult(saveContext, changeResponses);
            });

            it('should add key mapping', () => {
                const entity = saveContext.contentKeys[2];
                expect(saveResult.keyMappings[0]).toMatchObject({
                    entityTypeName: entity.entityType.name,
                    tempValue: -1,
                    realValue: 1
                });
            });

            it('should set raw entity to entities', () => {
                expect(saveResult.entities).toContain(changeResponses[0].data);
            });
        });
    });
});

function createChangeResponse(contentId?: number, data?: any): Batch.ChangeResponse {
    const headers = contentId ? { 'Content-ID': contentId.toString() } : null;

    const result = {
        headers,
        statusCode: '200',
        statusText: 'OK',
        data
    } as Batch.ChangeResponse;

    return result;
}
