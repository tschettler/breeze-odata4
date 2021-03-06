import { EntityManager, EntityQuery, JsonResultsAdapter, MappingContext, MetadataStore, NodeContext } from 'breeze-client';

import { JsonResultsAdapterFactory } from './../src/breeze-jsonResultsAdapter-factory';

const jsonMetadata = require('./breeze_metadata.json');

let metadataStore: MetadataStore;
let entityManager: EntityManager;
let mappingContext: MappingContext;
let nodeContext: NodeContext;

describe('JsonResultsAdapterFactory', () => {
  beforeEach(() => {
    metadataStore = new MetadataStore();
    metadataStore.importMetadata(jsonMetadata);

    entityManager = new EntityManager({ metadataStore: metadataStore });
    mappingContext = <MappingContext>{ entityManager: entityManager };
    nodeContext = <NodeContext>{ nodeType: 'root' };
  });

  it('should return JsonResultsAdapter when create is called', () => {
    const sut = JsonResultsAdapterFactory.create();
    expect(sut).toBeInstanceOf(JsonResultsAdapter);
  });

  it('should return JsonResultsAdapter with name of OData when create is called', () => {
    const sut = JsonResultsAdapterFactory.create();
    expect(sut.name).toBe('OData4');
  });

  it('should return empty result when visitNode is called with null node', () => {
    const sut = JsonResultsAdapterFactory.create();
    const result = sut.visitNode(null, mappingContext, nodeContext);
    expect(result).toEqual({});
  });

  it('should return result when visitNode is called with empty node', () => {
    const sut = JsonResultsAdapterFactory.create();
    const node = {};
    node['@odata.type'] = 'String';

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result).not.toEqual({});
  });

  it('should map results to node when visitNode is called for node with results', () => {
    const sut = JsonResultsAdapterFactory.create();
    const node = { results: {} };
    node['@odata.type'] = 'String';

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result.node).toBe(node.results);
  });

  it('should return result with EntityType when visitNode is called for node with @odata.type', () => {
    const sut = JsonResultsAdapterFactory.create();
    const node = {};
    node['@odata.type'] = '#UnitTesting.Person';

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result.entityType.shortName).toBe('Person');
  });

  it('should return result with EntityType when visitNode is called for query with resultEntityType', () => {
    const sut = JsonResultsAdapterFactory.create();
    const query = new EntityQuery('Person');
    query.resultEntityType = <any>metadataStore.getEntityType('Person');
    mappingContext.query = query;
    const node = {};

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result.entityType.shortName).toBe('Person');
  });

  it('should return result with EntityType when visitNode is called for query with resourceName', () => {
    const sut = JsonResultsAdapterFactory.create();
    const query = new EntityQuery('Person');
    mappingContext.query = query;
    const node = {};

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result.entityType.shortName).toBe('Person');
  });

  it('should return result with EntityType when visitNode is called for navProp', () => {
    const sut = JsonResultsAdapterFactory.create();
    const node = {};
    nodeContext.nodeType = 'navProp';
    nodeContext.navigationProperty = { entityTypeName: 'Person' };

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result.entityType.shortName).toBe('Person');
  });

  it('should return result with EntityType when visitNode is called for navPropItem', () => {
    const sut = JsonResultsAdapterFactory.create();
    const node = {};
    nodeContext.nodeType = 'navPropItem';
    nodeContext.navigationProperty = { entityTypeName: 'Person' };

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result.entityType.shortName).toBe('Person');
  });

  it('should not return result with EntityType when visitNode is called for unknown nodeType', () => {
    const sut = JsonResultsAdapterFactory.create();
    const node = {};
    nodeContext.nodeType = 'other';

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result.entityType).toBeUndefined();
  });

  it('should return result with ignore true when __deferred is not null', () => {
    const sut = JsonResultsAdapterFactory.create();
    const node = { __deferred: 'yes' };
    nodeContext.nodeType = 'other';

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result.ignore).toBeTruthy();
  });

  it('should return result with ignore true when propertyName is __metadata', () => {
    const sut = JsonResultsAdapterFactory.create();
    const node = {};
    nodeContext.nodeType = 'other';
    nodeContext.propertyName = '__metadata';

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result.ignore).toBeTruthy();
  });

  it('should return result with ignore true when propertyName is EntityKey and $type begins with System.Data', () => {
    const sut = JsonResultsAdapterFactory.create();
    const node = { $type: 'System.Data.EntityKey' };
    nodeContext.nodeType = 'other';
    nodeContext.propertyName = 'EntityKey';

    const result = sut.visitNode(node, mappingContext, nodeContext);
    expect(result.ignore).toBeTruthy();
  });
});
