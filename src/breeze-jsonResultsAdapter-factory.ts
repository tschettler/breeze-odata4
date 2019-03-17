import {
  core,
  EntityQuery,
  EntityType,
  JsonResultsAdapter,
  MappingContext,
  MetadataStore,
  NodeContext,
  VisitNodeResult
} from 'breeze-client';

export class JsonResultsAdapterFactory {
  public static create(): JsonResultsAdapter {
    const adapter = new JsonResultsAdapter({
      name: 'OData4',
      visitNode: JsonResultsAdapterFactory.visitNode
    });

    return adapter;
  }

  private static visitNode(node: any, mappingContext: MappingContext, nodeContext: NodeContext): VisitNodeResult {
    const result: VisitNodeResult = {};
    const metadataStore = mappingContext.entityManager.metadataStore;
    const workingNode = node;

    let nodeODataType: string;
    if (node === null) {
      return result;
    }

    let entityType: EntityType;
    let entityTypeName: string;
    if (nodeContext.nodeType === 'root') {
      if (mappingContext.query instanceof EntityQuery) {
        const eq = mappingContext.query as EntityQuery;
        if (eq.resultEntityType) {
          entityType = eq.resultEntityType;
        } else {
          entityTypeName = metadataStore.getEntityTypeNameForResourceName(eq.resourceName);
        }
      } else {
        // convert from #Namespace.EntityType to EntityType:#Namespace
        nodeODataType = node['@odata.type'];
        entityTypeName = MetadataStore.normalizeTypeName(nodeODataType.replace('#', ''));
      }
    } else if (nodeContext.nodeType === 'navProp' || /* old */ nodeContext.nodeType === 'navPropItem') {
      entityTypeName = nodeContext.navigationProperty.entityTypeName;
    }

    entityType = entityType || (entityTypeName && <EntityType>metadataStore.getEntityType(entityTypeName, true));
    // OData response doesn't distinguish a projection from a whole entity.
    // We'll assume that whole-entity data would have at least as many properties  (<=)
    // as the EntityType has mapped properties on the basis that
    // most projections remove properties rather than add them.
    // If not, assume it's a projection and do NOT treat as an entity
    if (entityType /*&& entityType._mappedPropertiesCount <= Object.keys(node).length - 1*/) {
      // if (et && entityType._mappedPropertiesCount === Object.keys(node).length - 1) { // OLD
      result.entityType = entityType;
      /*var uriKey = metadata.uri || metadata.id;
                if (uriKey) {
                    // Strip baseUri to make uriKey a relative uri
                    // Todo: why is this necessary when absolute works for every OData source tested?
                    var re = new RegExp('^' + mappingContext.dataService.serviceName, 'i')
                    uriKey = uriKey.replace(re, '');
                }*/
      result.extraMetadata = {
        /*uriKey: uriKey,
                etag: etag*/
      };
    }

    // OData v3 - projection arrays will be enclosed in a results array
    if (workingNode.results) {
      result.node = workingNode.results;
    }

    const propertyName = nodeContext.propertyName;
    result.ignore =
      workingNode.__deferred != null ||
      propertyName === '__metadata' ||
      // EntityKey properties can be produced by EDMX models
      (propertyName === 'EntityKey' && workingNode.$type && core.stringStartsWith(workingNode.$type, 'System.Data'));

    return result;
  }
}
