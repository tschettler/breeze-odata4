import { core, EntityQuery, EntityType, JsonResultsAdapter, MetadataStore, NodeContext, QueryContext, VisitNodeResult } from 'breeze-client';

export function getJsonResultsAdapter(): JsonResultsAdapter {
    const adapter = new JsonResultsAdapter({
        name: 'OData4',
        visitNode: visitNode
    });

    return adapter;

    function visitNode(node: any, mappingContext: QueryContext, nodeContext: NodeContext): VisitNodeResult {
        const result: VisitNodeResult = {};
        const metadataStore = mappingContext.entityManager.metadataStore;
        const workingNode = node;

        let nodeODataType: string;
        if (node === null) {
            return result;
        }

        let entityTypeName: string;
        if (nodeContext.nodeType === 'root') {
            if (mappingContext.query) {
                const resourceName = (<EntityQuery>mappingContext.query).resourceName;
                entityTypeName = metadataStore.getEntityTypeNameForResourceName(resourceName);
            } else {
                // convert from #Namespace.EntityType to EntityType:#Namespace
                nodeODataType = node['@odata.type'];
                entityTypeName = MetadataStore.normalizeTypeName(nodeODataType.replace('#', ''));
            }
        } else if (nodeContext.nodeType === 'navProp' || /* old */ nodeContext.nodeType === 'navPropItem') {
            entityTypeName = nodeContext.navigationProperty.entityTypeName;
        }

        const et = entityTypeName && <EntityType>metadataStore.getEntityType(entityTypeName, true);
        // OData response doesn't distinguish a projection from a whole entity.
        // We'll assume that whole-entity data would have at least as many properties  (<=)
        // as the EntityType has mapped properties on the basis that
        // most projections remove properties rather than add them.
        // If not, assume it's a projection and do NOT treat as an entity
        if (et /*&& et._mappedPropertiesCount <= Object.keys(node).length - 1*/) {
            // if (et && et._mappedPropertiesCount === Object.keys(node).length - 1) { // OLD
            result.entityType = et;
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
            (<any>result).node = workingNode.results;
        }

        const propertyName = nodeContext.propertyName;
        result.ignore = workingNode.__deferred != null || propertyName === '__metadata' ||
            // EntityKey properties can be produced by EDMX models
            (propertyName === 'EntityKey' && workingNode.$type && core.stringStartsWith(workingNode.$type, 'System.Data'));
        result.ignore = false;
    }
}
