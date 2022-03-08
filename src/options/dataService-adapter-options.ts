import { ODataHttpClient } from "../odata-http-client";

/**
 * The default OData 4 data service adapter options.
 */
export const DefaultDataServiceAdapterOptions: DataServiceAdapterOptions = {
    failOnSaveError: true,
    headers: { 'OData-Version': '4.0' },
    metadataAcceptHeader: 'application/json;odata.metadata=full'
};

/**
 * The OData 4 data service adapter options.
 */
export interface DataServiceAdapterOptions {

    /** Determines whether to fail on save error.
     * @default true
     */
    failOnSaveError: boolean;

    /**
     * The headers used by the data service when calling the OData 4 service.
     * @default
     * ```json
     * {'OData-Version': '4.0'}
     * ```
     */
    headers: { [name: string]: string };

    /**
     * Http client instance to use with the data service.
     */
    httpClient?: ODataHttpClient;

    /** The metadata accept header.
     * @default 'application/json;odata.metadata=full'
     */
    metadataAcceptHeader: string;
}
