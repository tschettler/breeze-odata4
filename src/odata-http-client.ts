import { HttpOData, oData } from 'ts-odatajs';

/**
 * @classdesc OData Http client
 * @summary Create a new class that implements this type in order to intercept the OData request/response.
 */
export class ODataHttpClient implements HttpOData.HttpClient {
    /**
     * Callback parameter name of OData http client.
     */
    public callbackParameterName?: string;

    /**
     * Enable json pcallback of OData http client.
     */
    public enableJsonPCallback?: boolean;

    /**
     * Format query string of OData http client.
     */
    public formatQueryString?: string = oData.net.defaultHttpClient.formatQueryString;

    /**
     * Requests the OData http client.
     * @param request The request.
     * @param success The success callback.
     * @param error The error callback.
     * @returns The HttpOData request.
     */
    public request(request: HttpOData.Request,
        success: (response: HttpOData.Response) => void,
        error: (error: HttpOData.Error) => void): HttpOData.RequestWithAbort {
        return oData.net.defaultHttpClient.request(request, success, error);
    }
}
