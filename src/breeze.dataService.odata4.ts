import { AutoGeneratedKeyType, config, core, DataProperty, DataService, DataServiceSaveContext, DataServiceAdapter, DataType, Entity, EntityAspect, EntityQuery, EntityType, JsonResultsAdapter, MetadataStore, NodeContext, QueryContext, SaveResult } from 'breeze-client';
import { oData, Edmx } from 'ts-odatajs';

import { ClassRegistry } from "./class-registry";

import { MetadataAdapter } from "./adapters/metadata-adapter";
import { NavigationAdapter } from "./adapters/navigation-adapter";
import { AnnotationAdapter } from "./adapters/annotation-adapter";

import { AnnotationDecorator } from "./decorators/annotation-decorator";
import { StoreGeneratedPatternDecorator } from "./decorators/store-generated-pattern-decorator";
import { DisplayNameDecorator } from "./decorators/display-name-decorator";
import { ValidatorDecorator } from "./decorators/validator-decorator";
import { ODataError } from "./odata-error";

export class ProxyServiceAdapter {
    public _catchNoConnectionError(err: Error): any {
        throw new Error("_catchNoConnectionError not implemented");
    }

    public _createChangeRequestInterceptor(saveContext: DataServiceSaveContext, saveBundle: Object): {
        getRequest: (request: Object, entity: Entity, index: number) => Object;
        done: (requests: Object[]) => void
    } {
        throw new Error("_createChangeRequestInterceptor not implemented");
    }

    public checkForRecomposition(interfaceInitializedArgs: { interfaceName: string; isDefault: boolean; }): void {
        throw new Error("checkForRecomposition not implemented");
    }
}

Object.setPrototypeOf(ProxyServiceAdapter.prototype, config.getAdapter('dataService', 'WebApi').prototype);

// TODO: Latest error from breeze - ERROR Error: The 'dataService' parameter  must be an instance of 'DataService'
export class OData4ServiceAdapter extends ProxyServiceAdapter implements DataServiceAdapter {
    private metadataAdapters: MetadataAdapter[] = [];

    public name = 'OData4';

    public headers = {
        'OData-Version': '4.0'
    };

    public metadata: any;

    static register() {
        config.registerAdapter('dataService', OData4ServiceAdapter);
    }

    constructor() {
        super();
    }

    public initialize(): void {
        // TODO: Figure out why this doesn't work
        /*core.requireLib("odatajs", "Needed to support remote OData v4 services");*/
        this.fixODataFormats();

        ClassRegistry.MetadataAdapters.add(NavigationAdapter, AnnotationAdapter);
        ClassRegistry.AnnotationDecorators.add(StoreGeneratedPatternDecorator, DisplayNameDecorator, ValidatorDecorator);

        this.metadataAdapters = ClassRegistry.MetadataAdapters.get();
    }

    public getAbsoluteUrl(dataService: DataService, url: string): string {
        var serviceName = dataService.qualifyUrl('');
        // only prefix with serviceName if not already on the url
        var base = core.stringStartsWith(url, serviceName) ? '' : serviceName;
        // If no protocol, turn base into an absolute URI
        if (window && serviceName.startsWith('//')) {
            // no protocol; make it absolute
            let loc = window.location;
            base = `${loc.protocol}//${loc.host}${core.stringStartsWith(serviceName, '/') ? '' : '/'}{base}`;
        }

        return base + url;
    }

    public fetchMetadata(metadataStore: MetadataStore, dataService: DataService): Promise<any> {

        var associations = {};

        var serviceName = dataService.serviceName;
        var url = this.getAbsoluteUrl(dataService, '$metadata');

        return new Promise((resolve, reject) => {
            // OData.read(url,
            oData.read({
                requestUri: url,
                // headers: { 'Accept': 'application/json'}
                headers: { Accept: 'application/json;odata.metadata=full' }
            },
                (data: any, response: any) => {
                    // data.dataServices.schema is an array of schemas. with properties of
                    // entityContainer[], association[], entityType[], and namespace.
                    if (!data || !data.dataServices) {
                        var error = new Error('Metadata query failed for: ' + url);
                        return reject(error);
                    }

                    var edmx = <Edmx.Edmx>data;

                    var csdlMetadata = edmx.dataServices;

                    /*var schema = csdlMetadata.schema;

                    if (schema instanceof Array && schema.length > 1) {
                        for (var prop in schema[1]) {
                            if (prop === 'namespace') {
                                continue;
                            }
                            schema[0][prop] = schema[1][prop];
                        }

                        schema.pop();
                    }

                    this.metadataAdapters.forEach(a => {
                        oData.utils.forEachSchema(schema, a.adapt.bind(a))
                    });*/

                    this.metadataAdapters.forEach(a => {
                        oData.utils.forEachSchema(csdlMetadata, a.adapt.bind(a))
                    });

                    // might have been fetched by another query
                    if (!metadataStore.hasMetadataFor(serviceName)) {
                        try {
                            metadataStore.importMetadata(csdlMetadata);
                        } catch (e) {
                            reject(new Error('Metadata query failed for ' + url + '; Unable to process returned metadata: ' + e.message));
                        }

                        metadataStore.addDataService(dataService);
                    }

                    resolve(csdlMetadata);

                },
                (error: any) => {
                    this.createError(error, url).then((err: Error) => {
                        err.message = 'Metadata query failed for: ' + url + '; ' + (err.message || '');
                        reject(err);
                    });
                },
                oData.metadataHandler
            );
        });
    }

    public executeQuery(mappingContext: { getUrl: () => string; query: EntityQuery; dataService: DataService; }): Promise<any> {
        var url = this.getAbsoluteUrl(mappingContext.dataService, mappingContext.getUrl());

        /**
         *  The syntax for getting the count of a collection has changed with v4
         *  http://docs.oasis-open.org/odata/odata/v4.0/errata01/os/complete/part2-url-conventions/odata-v4.0-errata01-os-part2-url-conventions-complete.html#_Toc395267183
         */
        url = url.replace('$inlinecount=allpages', '$count=true');
        url = url.replace('$inlinecount=none', '$count=false');
        url = url.replace(/substringof\(('[^']*')(,|%2C)\s*([^)]*\)?)\)/gi, 'contains($3$2$1)');

        return new Promise((resolve, reject) => {
            oData.read(
                {
                    requestUri: url,
                    headers: this.headers
                },
                (data: any, response: any) => {
                    var inlineCount;
                    if (data['@odata.count']) {
                        // OData can return data['@odata.count'] as a string
                        inlineCount = parseInt(data['@odata.count'], 10);
                    }

                    resolve({ results: data.value, inlineCount: inlineCount, httpResponse: response });
                },
                (error: Object) => {
                    this.createError(error, url)
                        .then((err: Error) => reject(err));
                }
            );
        });
    }

    public saveChanges(saveContext: DataServiceSaveContext, saveBundle: Object): Promise<SaveResult> {
        var adapter = saveContext.adapter = this;

        saveContext.routePrefix = this.getAbsoluteUrl(saveContext.dataService, '');
        var url = saveContext.routePrefix + '$batch';

        var requestData = this.createChangeRequests(saveContext, saveBundle);
        var tempKeys = saveContext.tempKeys;
        var contentKeys = saveContext.contentKeys;

        return new Promise((resolve, reject) => {
            oData.request({
                //oData.read({
                requestUri: url,
                method: 'POST',
                data: requestData
            },
                (data: any, response: any) => {
                    var entities: Entity[] = [];
                    var keyMappings: any[] = [];
                    var saveResult = { entities: entities, keyMappings: keyMappings };
                    data.__batchResponses.forEach((br: any) => {
                        br.__changeResponses.forEach((cr: any, index: number) => {
                            var response = cr.response || cr;
                            var statusCode = response.statusCode;
                            if ((!statusCode) || statusCode >= 400) {
                                this.createError(cr, url)
                                    .then((error: Error) => reject(error));
                                return;
                            }

                            /**
                             * It seems that the `Content-ID` header is not being properly parsed out by the odatajs library. As a work around
                             * we can assume that each change response is numbered sequentially from 1, and infer the ID from the index in the
                             * br.__changeResponses array.
                             */
                            //var contentId = cr.headers['Content-ID'];
                            var contentId = index + 1;

                            var rawEntity = cr.data;
                            if (rawEntity) {
                                var tempKey = tempKeys[contentId];
                                if (tempKey) {
                                    var entityType = tempKey.entityType;
                                    if (entityType.autoGeneratedKeyType !== AutoGeneratedKeyType.None) {
                                        var tempValue = tempKey.values[0];
                                        // TODO: cleanup after typings get updated
                                        var realKey = entityType.getEntityKeyFromRawEntity(rawEntity, DataProperty.getRawValueFromServer); // TODO: Typing is missing function
                                        var keyMapping = { entityTypeName: entityType.name, tempValue: tempValue, realValue: realKey.values[0] };
                                        keyMappings.push(keyMapping);
                                    }
                                }
                                entities.push(rawEntity);
                            } else {
                                var origEntity = contentKeys[contentId];
                                entities.push(origEntity);
                            }
                        });
                    });

                    /*if (defer._rejected) {
                        throw defer.promise.source.exception;
                    }*/

                    return resolve(saveResult);
                }, err => {
                    this.createError(err, url)
                        .then((error: Error) => reject(error));
                }, oData.batch.batchHandler, undefined, this.metadata);

        });
    }

    public JsonResultsAdapter: JsonResultsAdapter = new JsonResultsAdapter(
        {
            name: 'Test',
            visitNode: (node: any, mappingContext: QueryContext, nodeContext: NodeContext): { entityType?: EntityType; nodeId?: any; nodeRefId?: any; ignore?: boolean; } => {
                var workingNode = <any>node;
                var result: { entityType?: EntityType; nodeId?: any; nodeRefId?: any; ignore?: boolean; } = {};
                if (node === null) {
                    return result;
                }

                var entityTypeName: string;
                if (nodeContext.nodeType === 'root') {
                    if (mappingContext.query) {
                        entityTypeName = mappingContext.entityManager.metadataStore.getEntityTypeNameForResourceName((<EntityQuery>mappingContext.query).resourceName);
                    } else {
                        // convert from #Namespace.EntityType to EntityType:#Namespace
                        var nodeODataType = node['@odata.type'];
                        var typeParts = nodeODataType.split('.');
                        var typename = typeParts.pop();
                        typeParts[0] = typename + ':' + typeParts[0];
                        entityTypeName = typeParts.join('.');
                    }
                } else if (nodeContext.nodeType === 'navProp' || /* old */ nodeContext.nodeType === 'navPropItem') {
                    entityTypeName = (<any>nodeContext).navigationProperty.entityTypeName;
                }

                var et = entityTypeName && mappingContext.entityManager.metadataStore.getEntityType(entityTypeName, true);
                // OData response doesn't distinguish a projection from a whole entity.
                // We'll assume that whole-entity data would have at least as many properties  (<=)
                // as the EntityType has mapped properties on the basis that
                // most projections remove properties rather than add them.
                // If not, assume it's a projection and do NOT treat as an entity
                if (et /*&& et._mappedPropertiesCount <= Object.keys(node).length - 1*/) {
                    // if (et && et._mappedPropertiesCount === Object.keys(node).length - 1) { // OLD
                    result.entityType = <EntityType>et;
                    /*var uriKey = metadata.uri || metadata.id;
                        if (uriKey) {
                            // Strip baseUri to make uriKey a relative uri
                            // Todo: why is this necessary when absolute works for every OData source tested?
                            var re = new RegExp('^' + mappingContext.dataService.serviceName, 'i')
                            uriKey = uriKey.replace(re, '');
                        }*/
                    (<any>result).extraMetadata = {
                        //uriKey: uriKey,
                        //etag: etag

                    };

                }

                // OData v3 - projection arrays will be enclosed in a results array
                if (workingNode.results) {
                    (<any>result).node = workingNode.results;
                }

                var propertyName = nodeContext.propertyName;
                result.ignore = workingNode.__deferred != null || propertyName === '__metadata' ||
                    // EntityKey properties can be produced by EDMX models
                    (propertyName === 'EntityKey' && workingNode.$type && core.stringStartsWith(workingNode.$type, 'System.Data'));
                result.ignore = false;
            }
        }
    );

    private createChangeRequests(saveContext: DataServiceSaveContext, saveBundle: Object) {
        var changeRequestInterceptor = this._createChangeRequestInterceptor(saveContext, saveBundle);
        var changeRequests: any[] = [];
        var tempKeys: any[] = [];
        var contentKeys: any[] = [];
        var entityManager = saveContext.entityManager;
        var helper = entityManager.helper;
        var id = 0;
        var routePrefix = saveContext.routePrefix;

        (<{ entities: Entity[] }>saveBundle).entities.forEach((entity: Entity, index: number) => {
            var aspect = entity.entityAspect;
            id = id + 1; // we are deliberately skipping id=0 because Content-ID = 0 seems to be ignored.
            var request = <{ [key: string]: any; }>{ headers: { 'Content-ID': id, 'Content-Type': 'application/json;IEEE754Compatible=true' } };
            contentKeys[id] = entity;
            if (aspect.entityState.isAdded()) {
                var resourceName = saveContext.resourceName || entity.entityType.defaultResourceName;
                request.requestUri = routePrefix + entity.entityType.defaultResourceName;
                request.method = 'POST';
                request.data = helper.unwrapInstance(entity, this.transformValue);
                tempKeys[id] = aspect.getKey();
            } else if (aspect.entityState.isModified()) {
                this.updateDeleteMergeRequest(request, aspect, routePrefix);
                request.method = 'PATCH';
                request.data = helper.unwrapChangedValues(entity, entityManager.metadataStore, this.transformValue);
                // should be a PATCH/MERGE
            } else if (aspect.entityState.isDeleted()) {
                this.updateDeleteMergeRequest(request, aspect, routePrefix);
                request.method = 'DELETE';
            } else {
                return;
            }
            request = changeRequestInterceptor.getRequest(request, entity, index);
            changeRequests.push(request);
        });
        saveContext.contentKeys = contentKeys;
        saveContext.tempKeys = tempKeys;
        changeRequestInterceptor.done(changeRequests);
        return {
            __batchRequests: [
                {
                    __changeRequests: changeRequests
                }
            ]
        };

    }

    private transformValue(prop: DataProperty, val: any) {
        if (prop.isUnmapped) return undefined;
        if (prop.dataType === DataType.DateTimeOffset) {
            // The datajs lib tries to treat client dateTimes that are defined as DateTimeOffset on the server differently
            // from other dateTimes. This fix compensates before the save.
            val = val && new Date(val.getTime() - (val.getTimezoneOffset() * 60000));
        } else if (prop.dataType.quoteJsonOData) {
            val = val != null ? val.toString() : val;
        }
        return val;
    }

    private updateDeleteMergeRequest(request: any, aspect: EntityAspect, routePrefix: string) {
        var uriKey;
        var extraMetadata: any = aspect.extraMetadata;
        if (extraMetadata == null) {
            uriKey = this.getUriKey(aspect);
            aspect.extraMetadata = {
                uriKey: uriKey
            }
        } else {
            uriKey = extraMetadata["uriKey"] || this.getUriKey(aspect);
            if (extraMetadata["etag"]) {
                request.headers['If-Match'] = extraMetadata["etag"];
            }
        }
        request.requestUri =
            // use routePrefix if uriKey lacks protocol (i.e., relative uri)
            uriKey.indexOf('//') > 0 ? uriKey : routePrefix + uriKey;
    }

    private getUriKey(aspect: EntityAspect): string {
        var entityType = aspect.entity.entityType;
        var resourceName = entityType.defaultResourceName;
        var kps = entityType.keyProperties;
        var uriKey = resourceName + '(';
        if (kps.length === 1) {
            uriKey = uriKey + this.fmtProperty(kps[0], aspect) + ')';
        } else {
            var delim = '';
            kps.forEach(kp => {
                uriKey = uriKey + delim + kp.nameOnServer + '=' + this.fmtProperty(kp, aspect);
                delim = ',';
            });
            uriKey = uriKey + ')';
        }
        return uriKey;
    }

    private fmtProperty(prop: DataProperty, aspect: EntityAspect) {
        return prop.dataType.fmtOData(aspect.getPropertyValue(prop.name));
    }

    private async createError(error: any, url: string) {
        // OData errors can have the message buried very deeply - and nonobviously
        // this code is tricky so be careful changing the response.body parsing.
        var result = new ODataError();
        var response = error && <Response>error.response;
        if (!response) {
            // in case DataJS returns 'No handler for this data'
            result.message = error;
            result.statusText = error;
            return result;
        }

        result.message = response.statusText;
        result.statusText = response.statusText;
        result.status = response.status;
        // non std
        if (url) result.url = url;
        result.body = response.body;
        if (response.body) {
            var nextErr;
            try {
                var body = await response.json();
                result.body = body;
                // OData v3 logic
                if (body['odata.error']) {
                    body = body['odata.error'];
                }
                var msg = '';
                do {
                    nextErr = body.error || body.innererror;
                    if (!nextErr) msg = msg + this.getMessage(body);
                    nextErr = nextErr || body.internalexception;
                    body = nextErr || body;
                } while (nextErr);
                if (msg.length > 0) {
                    result.message = msg;
                }
            } catch (e) {

            }
        }
        this._catchNoConnectionError(result);
        return result;
    }

    private getMessage(body: any): string {
        var msg = body['message'] || body['Message'] || '';
        return ((typeof (msg) === 'string') ? msg : msg.value) + '; ';
    }

    private fixODataFormats() {
        DataType.Int64.fmtOData = fmtFloat;
        DataType.Decimal.fmtOData = fmtFloat;
        DataType.Double.fmtOData = fmtFloat;
        DataType.DateTime.fmtOData = fmtDateTime;
        DataType.DateTimeOffset.fmtOData = fmtDateTimeOffset;
        DataType.Time.fmtOData = fmtTime;
        DataType.Guid.fmtOData = fmtGuid;

        function fmtFloat(val: any): any {
            if (val == null) return null;
            if (typeof val === "string") {
                val = parseFloat(val);
            }
            return val;
        }

        function fmtDateTime(val: any): any {
            if (val == null) return null;
            try {
                return val.toISOString();
            } catch (e) {
                throwError("'%1' is not a valid dateTime", val);
            }
        }

        function fmtDateTimeOffset(val: any): any {
            if (val == null) return null;
            try {
                return val.toISOString();
            } catch (e) {
                throwError("'%1' is not a valid dateTime", val);
            }
        }

        function fmtTime(val: any): any {
            if (val == null) return null;
            if (!core.isDuration(val)) {
                throwError("'%1' is not a valid ISO 8601 duration", val);
            }
            return val;
        }

        function fmtGuid(val: any) {
            if (val == null) return null;
            if (!core.isGuid(val)) {
                throwError("'%1' is not a valid guid", val);
            }
            return val;
        }

        function throwError(msg: string, val: any): void {
            msg = core.formatString(msg, val);
            throw new Error(msg);
        }
    }
}