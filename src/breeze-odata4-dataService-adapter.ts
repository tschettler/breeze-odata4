import {
  AbstractDataServiceAdapter,
  ComplexType,
  config,
  core,
  DataService,
  Entity,
  EntityQuery,
  EntityType,
  HttpResponse,
  JsonResultsAdapter,
  MappingContext,
  MetadataStore,
  QueryResult,
  SaveBundle,
  SaveContext,
  SaveResult
} from 'breeze-client';
import { Batch, Edm, Edmx, HttpOData, oData } from 'ts-odatajs';

import { OData4AjaxAdapter } from './ajax-adapters';
import { JsonResultsAdapterFactory } from './breeze-jsonResultsAdapter-factory';
import { ODataError } from './odata-error';
import { DataServiceAdapterOptions, DefaultDataServiceAdapterOptions } from './options';
import { InvokableEntry, Utilities } from './utilities';

export interface DataServiceSaveContext extends SaveContext {
  contentKeys: any[];
  requestUri: string;
  tempKeys: any[];
}

/**
 * @classdesc OData4 data service
 */
export class OData4DataServiceAdapter extends AbstractDataServiceAdapter {
  private _options = DefaultDataServiceAdapterOptions;

  /**
   * The breeze adapter name.
   */
  public static BreezeAdapterName = 'OData4';

  private actions: InvokableEntry[] = [];

  public ajaxImpl: OData4AjaxAdapter;

  /**
   * The name of the data service.
   */
  public name = OData4DataServiceAdapter.BreezeAdapterName;

  /**
   * The metadata of the odata4 data service.
   */
  public metadata: Edmx.Edmx;

  /**
   * Json results adapter of the data service.
   */
  public jsonResultsAdapter: JsonResultsAdapter;

  /**
   * Gets the currently configured options.
   */
  public get options(): Readonly<DataServiceAdapterOptions> {
    return this._options;
  }

  /**
   * Registers the OData4 data service as a `dataService` breeze interface.
   */
  public static register() {
    config.registerAdapter('dataService', OData4DataServiceAdapter);
  }

  /**
   * Prepares the save bundle.
   * @param saveContext The save context.
   * @param saveBundle The save bundle.
   * @returns The save bundle.
   */
  public _prepareSaveBundle(saveContext: DataServiceSaveContext, saveBundle: SaveBundle): Batch.BatchRequest {
    const changeRequestInterceptor = this._createChangeRequestInterceptor(saveContext, saveBundle);
    const changeRequests: Batch.ChangeRequest[] = [];
    saveContext.tempKeys = [];
    saveContext.contentKeys = [];

    let contentId = 1;
    saveBundle.entities.forEach((entity: Entity, index: number) => {
      const changeRequest = this.ajaxImpl.createChangeRequest(saveContext, entity, contentId);
      if (!changeRequest) {
        return;
      }

      const request = changeRequestInterceptor.getRequest(changeRequest, entity, index);
      changeRequests.push(request);

      contentId++;
    });

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

  /**
   * Prepares the save result.
   * @param saveContext The save context.
   * @param saveResult The save result.
   * @returns The save result.
   */
  public _prepareSaveResult(saveContext: DataServiceSaveContext, data: Batch.BatchResponse, reject?: (reason?: any) => void): SaveResult {
    const changeResponses = data.__batchResponses
      .flatMap(br => br.__changeResponses)
      .map(cr => (cr as Batch.FailedResponse).response || cr as Batch.ChangeResponse);

    const failedResponse = changeResponses.find(cr => {
      const statusCode = cr.statusCode;
      const result = !statusCode || Number(statusCode) >= 400;

      return result;
    });

    // TODO: Configure whether to prevent reject on failure
    if (failedResponse && this._options.failOnSaveError) {
      const err = this.createError(failedResponse, saveContext.requestUri);
      reject(err);
      return;
    }

    const saveResult = this.ajaxImpl.prepareSaveResult(saveContext, changeResponses);

    return saveResult;
  }

  /**
   * Configures the navigation adapter with the specified options.
   * @param options The navigation adapter options.
   */
  public configure(options: Partial<DataServiceAdapterOptions>) {
    options = options || {};

    options.headers = {
      ...this._options.headers,
      ...options.headers
    };

    this._options = {
      ...this._options,
      ...options
    };
  }

  /**
   * Initializes the data service.
   */
  public initialize(): void {
    super.initialize();
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
          headers: { ...this._options.headers, Accept: this._options.metadataAcceptHeader }
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
        this._options.httpClient
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

          resolve({ results, query, inlineCount, httpResponse: response });
        },
        (error: any) => {
          const err = this.createError(error, request.requestUri);
          reject(err);
        },
        null,
        this._options.httpClient
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
    saveContext.requestUri = `${saveContext.routePrefix}$batch`;

    const requestData = this._prepareSaveBundle(saveContext, saveBundle);

    const result = new Promise<SaveResult>((resolve, reject) => {
      this.ajaxImpl.ajax({
        type: 'POST',
        url: saveContext.requestUri,
        headers: { ...this._options.headers },
        data: requestData,
        success: (res: HttpResponse) => {
          res.saveContext = saveContext;
          const data = res.data;
          if (data.__batchResponses) {
            const saveResult = this._prepareSaveResult(saveContext, data, reject);
            saveResult.httpResponse = res;
            resolve(saveResult);
          } else {
            const error = this.createError(res, saveContext.requestUri);
            reject(error);
          }
        },
        error: (res: HttpResponse) => {
          res.saveContext = saveContext;
          const error = this.createError(res, saveContext.requestUri);
          reject(error);
        }
      },
        this._options.httpClient,
        this.metadata);
    });

    return result;
  }

  // TODO: Refactor to a request factory
  private getRequest(mappingContext: MappingContext): HttpOData.Request {
    const query = mappingContext.query as EntityQuery;
    let method = 'GET';
    let request: HttpOData.Request = {
      method,
      requestUri: this.getUrl(mappingContext),
      headers: { ...this._options.headers }
    };

    if (!query?.parameters) {
      return request;
    }

    method = query.parameters['$method'] || method;
    delete query.parameters['$method'];

    if (method === 'GET') {
      request = { ...request, requestUri: this.addQueryString(request.requestUri, query.parameters) };
    } else {
      const data = this.getData(mappingContext, query.parameters['$data']) ?? query.parameters;
      request = { ...request, method, data };
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
    const invokeConfig = this.getInvokableConfig((mappingContext.query as EntityQuery).resourceName);
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
      data = structuralType.createEntity(data);
      return helper.unwrapInstance(data, null);
    } else if (structuralType instanceof ComplexType) {
      data = structuralType.createInstance(data);
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

    // Get the action or function name, last path part in the url excluding any parentheses
    const invokableName = url.split('/').pop().split('(')[0];

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
  private addQueryString(url: string, parameters: any): string {
    // Add query params if .withParameters was used
    const queryString = this.toQueryString(parameters);
    if (!queryString) {
      return url;
    }

    const sep = url.indexOf('?') < 0 ? '?' : '&';
    url += sep + queryString;

    return url;
  }

  private createError(error: any, url: string): ODataError {
    // OData errors can have the message buried very deeply - and nonobviously
    // this code is tricky so be careful changing the response.body parsing.
    const result = new ODataError();
    const response = error && (error as Batch.FailedResponse).response;

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

    AbstractDataServiceAdapter._catchNoConnectionError(result);

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
