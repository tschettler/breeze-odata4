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

/**
 * @classdesc OData 4 Json results adapter factory.
 */
export class JsonResultsAdapterFactory {

  /**
   * Creates the OData 4 json results adapter.
   * @returns The json results adapter.
   */
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
    if (entityType) {
      result.entityType = entityType;
      result.extraMetadata = {};
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
