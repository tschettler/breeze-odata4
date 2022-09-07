import {
  core,
  EntityQuery,
  EntityType,
  JsonResultsAdapter,
  MappingContext,
  MetadataStore,
  NodeContext,
  NodeMeta,
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

  private static visitNode(node: any, mappingContext: MappingContext, nodeContext: NodeContext): NodeMeta {
    const result: NodeMeta = {};

    if (node === null) {
      return result;
    }

    const entityType = JsonResultsAdapterFactory.getEntityType(node, mappingContext, nodeContext);

    if (entityType && JsonResultsAdapterFactory.hasMatchingProperties(node, entityType)) {
      result.entityType = entityType;
      result.extraMetadata = {};
    }

    // OData v3 - projection arrays will be enclosed in a results array
    if (node.results) {
      result['node'] = node.results;
    }

    const propertyName = nodeContext.propertyName;
    result.ignore =
      node.__deferred != null ||
      propertyName === '__metadata' ||
      // EntityKey properties can be produced by EDMX models
      (propertyName === 'EntityKey' && node.$type && core.stringStartsWith(node.$type, 'System.Data'));

    return result;
  }

  private static getEntityType(node: any, mappingContext: MappingContext, nodeContext: NodeContext): EntityType {
    const metadataStore = mappingContext.entityManager.metadataStore;
    let entityType: EntityType;
    let entityTypeName: string;

    if (nodeContext.nodeType === 'root') {
      if (mappingContext.query instanceof EntityQuery) {
        const eq = mappingContext.query;
        if (!eq.resultEntityType) {
          entityTypeName = metadataStore.getEntityTypeNameForResourceName(eq.resourceName);
        } else if (eq.resultEntityType instanceof EntityType) {
          entityType = eq.resultEntityType;
        } else {
          entityTypeName = eq.resultEntityType;
        }
      } else {
        // convert from #Namespace.EntityType to EntityType:#Namespace
        const nodeODataType = node['@odata.type'];
        entityTypeName = MetadataStore.normalizeTypeName(nodeODataType.replace('#', ''));
      }
    } else if (nodeContext.nodeType === 'navProp' || /* old */ nodeContext.nodeType === 'navPropItem') {
      entityTypeName = nodeContext.navigationProperty.entityTypeName;
    }

    entityType = entityType || (entityTypeName && metadataStore.getAsEntityType(entityTypeName, true));

    return entityType;
  }

  private static hasMatchingProperties(node: any, entityType: EntityType): boolean {
    const nodePropNames = Object.keys(node);
    const result = entityType.dataProperties
      .every(p => nodePropNames.includes(p.nameOnServer));

    return result;
  }
}
