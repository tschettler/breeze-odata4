import { DataService, Entity, EntityQuery, JsonResultsAdapter, MetadataStore, SaveResult } from 'breeze-client';
import { ODataServiceAdapter, DataServiceSaveContext } from './interfaces';
export declare class OData4ServiceAdapter implements ODataServiceAdapter {
    private innerDataServiceAdapter;
    private metadataAdapters;
    name: string;
    headers: {
        'OData-Version': string;
    };
    metadata: any;
    initialize(): void;
    _catchNoConnectionError(err: Error): void;
    _createChangeRequestInterceptor(saveContext: DataServiceSaveContext, saveBundle: Object): {
        getRequest: (request: Object, entity: Entity, index: number) => Object;
        done: (requests: Object[]) => void;
    };
    checkForRecomposition(interfaceInitializedArgs: {
        interfaceName: string;
        isDefault: boolean;
    }): void;
    fetchMetadata(metadataStore: MetadataStore, dataService: DataService): Promise<any>;
    executeQuery(mappingContext: {
        getUrl: () => string;
        query: EntityQuery;
        dataService: DataService;
    }): Promise<any>;
    saveChanges(saveContext: DataServiceSaveContext, saveBundle: Object): Promise<SaveResult>;
    getAbsoluteUrl(dataService: DataService, url: string): string;
    JsonResultsAdapter: JsonResultsAdapter;
    registerType<T>(): void;
    private createChangeRequests(saveContext, saveBundle);
    private transformValue(prop, val);
    private updateDeleteMergeRequest(request, aspect, routePrefix);
    private getUriKey(aspect);
    private fmtProperty(prop, aspect);
    private createError(error, url);
    private getMessage(body);
    private fixODataFormats();
}
