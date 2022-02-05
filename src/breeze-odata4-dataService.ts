import {
  AutoGeneratedKeyType,
  ComplexType,
  config,
  core,
  DataProperty,
  DataService,
  DataServiceAdapter,
  DataServiceSaveContext,
  Entity,
  EntityAspect,
  EntityKey,
  EntityQuery,
  EntityType,
  JsonResultsAdapter,
  KeyMapping,
  MappingContext,
  MetadataStore,
  QueryResult,
  SaveBundle,
  SaveResult
} from 'breeze-client';
import { Batch, Edm, Edmx, HttpOData, oData } from 'ts-odatajs';

import { JsonResultsAdapterFactory } from './breeze-jsonResultsAdapter-factory';
import { ODataError } from './odata-error';
import { ODataHttpClient } from './odata-http-client';
import { InvokableEntry, Utilities } from './utilities';

/**
 * @classdesc Proxy data service
 * @summary Seems crazy, but this is the only way I can find to do the inheritance
 */
export class ProxyDataService { }

Object.setPrototypeOf(ProxyDataService.prototype, config.getAdapter('dataService', 'WebApi').prototype);

/**
 * @classdesc OData4 data service
 */
export class OData4DataService extends ProxyDataService implements DataServiceAdapter {

  /**
   * The breeze adapter name.
   */
  public static BreezeAdapterName = 'OData4';

  // I don't like this, but I'm not able to find a better way
  private innerAdapter: DataServiceAdapter = <DataServiceAdapter>config.getAdapterInstance('dataService', 'WebApi');

  private actions: InvokableEntry[] = [];

  /**
   * The name of the data service.
   */
  public name = OData4DataService.BreezeAdapterName;

  /**
   * The headers used by the data service when calling the OData 4 service.
   * @default
   * ```json
   * {'OData-Version': '4.0'}
   * ```
   */
  public headers: { [name: string]: string } = {
    'OData-Version': '4.0'
  };

  /**
   * The metadata accept header.
   */
  public metadataAcceptHeader = 'application/json;odata.metadata=full';

  /**
   * The metadata of the odata4 data service.
   */
  public metadata: Edmx.Edmx;

  /**
   * Http client of the data service.
   */
  public httpClient: ODataHttpClient;

  /**
   * Json results adapter of the data service.
   */
  public jsonResultsAdapter: JsonResultsAdapter;

  /**
   * Change request interceptor of data service.
   */
  public changeRequestInterceptor: {
    getRequest: <T>(request: T, entity: Entity, index: number) => T;
    done: (requests: Object[]) => void;
  } = this.innerAdapter.changeRequestInterceptor;

  /**
   * Registers the OData4 data service as a `dataService` breeze interface.
   */
  public static register() {
    config.registerAdapter('dataService', OData4DataService);
  }

  /**
   * @constructor Creates an instance of odata4 data service.
   */
  constructor() {
    super();
  }

  /**
   * Catches no connection error
   * @param err The error
   * @returns Deferred rejection with the error.
   */
  public _catchNoConnectionError(err: Error): any {
    return this.innerAdapter._catchNoConnectionError(err);
  }

  /**
   * Creates change request interceptor
   * @param saveContext The save context.
   * @param saveBundle The save bundle.
   * @returns The change request interceptor instance.
   */
  public _createChangeRequestInterceptor(
    saveContext: DataServiceSaveContext,
    saveBundle: SaveBundle
  ): {
    getRequest: <T>(request: T, entity: Entity, index: number) => T;
    done: (requests: Object[]) => void;
  } {
    return this.innerAdapter._createChangeRequestInterceptor(saveContext, saveBundle);
  }

  /**
   * Checks for recomposition of the interface.
   * @param interfaceInitializedArgs The interface initialization.
   */
  public checkForRecomposition(interfaceInitializedArgs: { interfaceName: string; isDefault: boolean }): void {
    this.innerAdapter.checkForRecomposition(interfaceInitializedArgs);
  }

  /**
   * Prepares the save bundle.
   * @param saveContext The save context.
   * @param saveBundle The save bundle.
   * @returns The save bundle.
   */
  public _prepareSaveBundle(saveContext: DataServiceSaveContext, saveBundle: SaveBundle): SaveBundle {
    return this.innerAdapter._prepareSaveBundle(saveContext, saveBundle);
  }

  /**
   * Prepares the save result.
   * @param saveContext The save context.
   * @param saveResult The save result.
   * @returns The save result.
   */
  public _prepareSaveResult(saveContext: DataServiceSaveContext, saveResult: SaveResult): SaveResult {
    return this.innerAdapter._prepareSaveResult(saveContext, saveResult);
  }

  /**
   * Initializes the data service.
   */
  public initialize(): void {
    this.jsonResultsAdapter = JsonResultsAdapterFactory.create();
  }

  /**
   * Gets the absolute url.
   * @param dataService The data service.
   * @param url The url path.
   * @returns The full absolute url.
   */
  public getAbsoluteUrl(dataService: DataService, url: string): string {
    const serviceName = dataService.qualifyUrl('');
    // only prefix with serviceName if not already on the url
    let base = core.stringStartsWith(url, serviceName) ? '' : serviceName;
    // If no protocol, turn base into an absolute URI
    if (typeof window !== 'undefined' && !serviceName.startsWith('//') && !serviceName.startsWith('http')) {
      // no protocol; make it absolute
      base = `${location.origin}${core.stringStartsWith(serviceName, '/') ? '' : '/'}${base}`;
    }

    return base + url;
  }

  /**
   * Fetches metadata from the server.
   * @param metadataStore The metadata store.
   * @param dataService The data service.
   * @returns A promise with the EDMX metadata.
   */
  public fetchMetadata(metadataStore: MetadataStore, dataService: DataService): Promise<Edmx.DataServices> {
    const serviceName = dataService.serviceName;
    const url = this.getAbsoluteUrl(dataService, '$metadata');

    return new Promise((resolve, reject) => {
      oData.read(
        {
          requestUri: url,
          headers: Object.assign({}, this.headers, { Accept: this.metadataAcceptHeader })
        },
        (data: Edmx.Edmx) => {
          // data.dataServices.schema is an array of schemas. with properties of
          // entityContainer[], association[], entityType[], and namespace.
          if (!data?.dataServices) {
            const error = new Error(`Metadata query failed for: ${url}`);
            return reject(error);
          }

          this.metadata = data;

          const csdlMetadata = this.metadata.dataServices;

          Utilities.adaptMetadata(this.metadata);

          // might have been fetched by another query
          if (!metadataStore.hasMetadataFor(serviceName)) {
            try {
              metadataStore.importMetadata(csdlMetadata);
            } catch (e) {
              reject(new Error(`Metadata query failed for ${url}; Unable to process returned metadata: ${e.message}`));
            }

            metadataStore.addDataService(dataService);
          }

          this.actions = Utilities.getActions(this.metadata, metadataStore);

          resolve(csdlMetadata);
        },
        (error: Error) => {
          const err = this.createError(error, url);
          err.message = `Metadata query failed for: ${url}; ${err.message}`;
          reject(err);
        },
        oData.metadataHandler,
        this.httpClient
      );
    });
  }

  /**
   * Executes the query against the server.
   * @param mappingContext The mapping context.
   * @returns The query result from the server.
   */
  public executeQuery(mappingContext: MappingContext): Promise<QueryResult> {
    const query = mappingContext.query as EntityQuery;

    const request = this.getRequest(mappingContext);
    return new Promise<QueryResult>((resolve, reject) => {
      oData.request(
        request,
        (data: any, response: any) => {
          let inlineCount: number;
          let results: any;

          if (data) {
            // OData can return data['@odata.count'] as a string
            inlineCount = Number(data['@odata.count']);
            results = data.value;
          }

          resolve({ results: results, query: query, inlineCount: inlineCount, httpResponse: response });
        },
        (error: Object) => {
          const err = this.createError(error, request.requestUri);
          reject(err);
        },
        null,
        this.httpClient
      );
    });
  }

  /**
   * Saves changes from breeze.
   * @param saveContext The save context.
   * @param saveBundle The save bundle.
   * @returns The save result from the server.
   */
  public saveChanges(saveContext: DataServiceSaveContext, saveBundle: SaveBundle): Promise<SaveResult> {
    saveContext.adapter = this;

    saveContext.routePrefix = this.getAbsoluteUrl(saveContext.dataService, '');
    const url = `${saveContext.routePrefix}$batch`;

    const requestData = this.createChangeRequests(saveContext, saveBundle);
    const tempKeys = saveContext.tempKeys;
    const contentKeys = saveContext.contentKeys;

    return new Promise<SaveResult>((resolve, reject) => {
      oData.request(
        {
          method: 'POST',
          requestUri: url,
          headers: Object.assign({}, this.headers),
          data: requestData
        },
        (data: Batch.BatchResponse) => {
          const entities: Entity[] = [];
          const keyMappings: KeyMapping[] = [];
          const saveResult: SaveResult = { entities: entities, keyMappings: keyMappings, deletedKeys: null, XHR: null };
          data.__batchResponses.forEach((br: Batch.ChangeResponseSet) => {
            br.__changeResponses.forEach((cr: Batch.ChangeResponse | Batch.FailedResponse, index: number) => {
              const chResponse = (<Batch.FailedResponse>cr).response || <Batch.ChangeResponse>cr;
              const statusCode = chResponse.statusCode;
              if (!statusCode || Number(statusCode) >= 400) {
                const err = this.createError(cr, url);
                reject(err);
                return;
              }

              // The server is required to provide the Content-ID header starting at 1, use 0 and effectively ignore it if not provided.
              const contentId = Number((chResponse.headers || {})['Content-ID'] ?? 0);

              const origEntity = contentKeys[contentId];
              const rawEntity: Entity = chResponse.data;
              if (rawEntity) {
                const tempKey = tempKeys[contentId];
                if (tempKey) {
                  const entityType = tempKey.entityType;
                  if (entityType.autoGeneratedKeyType !== AutoGeneratedKeyType.None) {
                    const tempValue = tempKey.values[0];
                    const realKey = entityType.getEntityKeyFromRawEntity(rawEntity, DataProperty.getRawValueFromServer);
                    const keyMapping: KeyMapping = {
                      entityTypeName: entityType.name,
                      tempValue: tempValue,
                      realValue: realKey.values[0]
                    };
                    keyMappings.push(keyMapping);
                  }
                }
                entities.push(rawEntity);
              } else if (origEntity) {
                entities.push(origEntity);
              }
            });
          });

          resolve(saveResult);
        },
        err => {
          const error = this.createError(err, url);
          reject(error);
        },
        oData.batch.batchHandler,
        this.httpClient,
        this.metadata
      );
    });
  }

  private createChangeRequests(saveContext: DataServiceSaveContext, saveBundle: SaveBundle): Batch.BatchRequest {
    const changeRequestInterceptor = this._createChangeRequestInterceptor(saveContext, saveBundle);
    const changeRequests: Batch.ChangeRequest[] = [];
    const tempKeys: EntityKey[] = [];
    const contentKeys: Entity[] = [];
    const entityManager = saveContext.entityManager;
    const helper = entityManager.helper;
    let contentId = 1;
    const routePrefix = saveContext.routePrefix;

    saveBundle.entities.forEach((entity: Entity, index: number) => {
      const aspect = entity.entityAspect;

      let request: Batch.ChangeRequest = {
        headers: Object.assign(
          {
            'Content-ID': contentId.toString(),
            'Content-Type': 'application/json;IEEE754Compatible=true'
          },
          this.headers
        ),
        requestUri: null,
        method: null
      };

      contentKeys[contentId] = entity;
      if (aspect.entityState.isAdded()) {
        request.requestUri = routePrefix + entity.entityType.defaultResourceName;
        request.method = 'POST';
        request.data = helper.unwrapInstance(entity, this.transformValue);
        tempKeys[contentId] = aspect.getKey();
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
      contentId++;
    });

    saveContext.contentKeys = contentKeys;
    saveContext.tempKeys = tempKeys;
    changeRequestInterceptor.done(changeRequests);

    const changeRequestSet: Batch.ChangeRequestSet[] = [
      {
        __changeRequests: changeRequests
      }
    ];

    const batchRequest: Batch.BatchRequest = {
      __batchRequests: changeRequestSet
    };

    return batchRequest;
  }

  // TODO: Refactor to a request factory
  private getRequest(mappingContext: MappingContext): HttpOData.Request {
    const query = mappingContext.query as EntityQuery;
    let method = 'GET';
    let request: HttpOData.Request = {
      method: method,
      requestUri: this.getUrl(mappingContext),
      headers: Object.assign({}, this.headers)
    };

    if (!query?.parameters) {
      return request;
    }

    method = query.parameters['$method'] || method;
    delete query.parameters['$method'];

    if (method === 'GET') {
      request = Object.assign({}, request, { requestUri: this.addQueryString(request.requestUri, query.parameters) });
    } else {
      const data = this.getData(mappingContext, query.parameters['$data']) ?? query.parameters;
      request = Object.assign({}, request, { method: method, data: data });
    }

    return request;
  }

  // TODO: Refactor to a request factory
  private getData(mappingContext: MappingContext, data: any): any {
    if (!data) {
      return null;
    }

    if (!this.areValidPropertyNames(mappingContext.metadataStore, data)) {
      return data;
    }

    const helper = mappingContext.entityManager.helper;
    if (data.entityType || data.complexType) {
      return helper.unwrapInstance(data, null);
    }

    // check if action exists
    const invokeConfig = this.getInvokableConfig((<EntityQuery>mappingContext.query).resourceName);
    const actionEntry = this.actions.find(e => e.config === invokeConfig);

    if (!actionEntry) {
      return data;
    }

    const paramStartIndex = Number((invokeConfig.isBound === 'true'));

    const param = invokeConfig.parameter.find((p, idx) => {
      const isParameter = idx >= paramStartIndex;
      const isEdmType = p.type.startsWith('Edm.');

      const result = isParameter && !isEdmType;

      return result;
    });

    if (!param) {
      return data;
    }

    const edmType = Utilities.getEdmTypeFromTypeName(this.metadata, param.type);
    if (!edmType) {
      return data;
    }

    const structuralType = Utilities.adaptStructuralType(mappingContext.metadataStore, edmType);

    if (structuralType instanceof EntityType) {
      data = (<EntityType>structuralType).createEntity(data);
      return helper.unwrapInstance(data, null);
    } else if (structuralType instanceof ComplexType) {
      data = (<ComplexType>structuralType).createInstance(data);
      return helper.unwrapInstance(data, null);
    }

    return data;
  }

  private areValidPropertyNames(metadataStore: MetadataStore, data: any): boolean {
    const props = Object.keys(data);

    const result = props.every(p => {
      const sp = metadataStore.namingConvention.clientPropertyNameToServer(p);
      const cp = metadataStore.namingConvention.serverPropertyNameToClient(sp);
      return p === cp;
    });

    return result;
  }

  private getInvokableConfig(url: string): Edm.Action | Edm.Function {
    if (!url) {
      return null;
    }

    const urlParts = url.split('/');

    const invokableName = urlParts.pop().replace(/\([^\)]*\)/, '');

    const actionConfig = oData.utils.lookupAction(invokableName, this.metadata);
    const functionConfig = oData.utils.lookupFunction(invokableName, this.metadata);

    return actionConfig || functionConfig;
  }

  // TODO: Refactor to a request factory
  private getUrl(mappingContext: MappingContext): string {
    const url = this.getAbsoluteUrl(mappingContext.dataService, mappingContext.getUrl());

    return url;
  }

  // TODO: Refactor to a request factory
  private addQueryString(url: string, parameters: Object): string {
    // Add query params if .withParameters was used
    const queryString = this.toQueryString(parameters);
    if (!queryString) {
      return url;
    }

    const sep = url.indexOf('?') < 0 ? '?' : '&';
    url += sep + queryString;

    return url;
  }

  private transformValue(prop: DataProperty, val: any): any {
    // TODO: Split these into separate parsers
    if (prop.isUnmapped) {
      return undefined;
    }

    if (prop.dataType.quoteJsonOData) {
      val = val != null ? val.toString() : val;
    }

    return val;
  }

  private updateDeleteMergeRequest(request: Batch.ChangeRequest, aspect: EntityAspect, routePrefix: string): void {
    if (!aspect.extraMetadata) {
      aspect.extraMetadata = {};
    }

    const extraMetadata = aspect.extraMetadata;
    if (extraMetadata['etag']) {
      request.headers['If-Match'] = extraMetadata['etag'];
    }

    if (!extraMetadata['uriKey']) {
      extraMetadata['uriKey'] = this.getUriKey(aspect);
    }

    const uriKey = extraMetadata['uriKey'];
    request.requestUri =
      // use routePrefix if uriKey lacks protocol (i.e., relative uri)
      uriKey.indexOf('//') > 0 ? uriKey : routePrefix + uriKey;
  }

  private getUriKey(aspect: EntityAspect): string {
    const entityType = aspect.entity.entityType;
    const resourceName = entityType.defaultResourceName;
    const kps = entityType.keyProperties;

    const uriKeyValue =
      kps.length === 1
        ? this.fmtProperty(kps[0], aspect)
        : kps.map(kp => {
          return `${kp.nameOnServer}=${this.fmtProperty(kp, aspect)}`;
        });

    const uriKey = `${resourceName}(${uriKeyValue})`;

    return uriKey;
  }

  private fmtProperty(prop: DataProperty, aspect: EntityAspect): any {
    return prop.dataType.fmtOData(aspect.getPropertyValue(prop.name));
  }

  private createError(error: any, url: string): ODataError {
    // OData errors can have the message buried very deeply - and nonobviously
    // this code is tricky so be careful changing the response.body parsing.
    const result = new ODataError();
    const response = error && (<Batch.FailedResponse>error).response;

    result.message = error.message || error;
    result.statusText = error.message || error;

    if (!response) {
      // in case DataJS returns 'No handler for this data'
      return result;
    }

    if (response.statusCode !== '200') {
      result.message = response.statusText;
      result.statusText = response.statusText;
      result.status = Number(response.statusCode);
    }

    // non std
    if (url) {
      result.url = url;
    }

    result.body = response.body;
    if (response.body) {
      let nextErr;
      try {
        let body = JSON.parse(response.body);
        result.body = body;
        // OData v3 logic
        if (body['odata.error']) {
          body = body['odata.error'];
        }
        let msg = '';
        do {
          nextErr = body.error || body.innererror;
          if (!nextErr) {
            msg = msg + this.getMessage(body);
          }

          nextErr = nextErr || body.internalexception;
          body = nextErr || body;
        } while (nextErr);
        if (msg.length > 0) {
          result.message = msg;
        }
      } catch (e) { }
    }

    this._catchNoConnectionError(result);

    return result;
  }

  private getMessage(body: any): string {
    const messageKey = Object.keys(body)
      .find(k => k.toLowerCase() === 'message');

    if (!messageKey) {
      return '';
    }

    const msg = body[messageKey];
    return `${(typeof msg === 'string' ? msg : msg.value)}; `;
  }

  private toQueryString(payload: {}): string {
    const keys = Object.keys(payload);
    if (!keys.length) {
      return null;
    }

    const result = keys
      .map(key => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`;
      })
      .join('&');

    return result;
  }
}
