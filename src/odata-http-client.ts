import { HttpOData, oData } from 'ts-odatajs';

/**
 * OData Http client
 * Create a new class that implements this type in order to intercept the OData request/response.
 */
export class ODataHttpClient implements HttpOData.HttpClient {
    public callbackParameterName?: string;
    public enableJsonPCallback?: boolean;
    public formatQueryString?: string = oData.net.defaultHttpClient.formatQueryString;

    public request(request: HttpOData.Request,
        success: (response: HttpOData.Response) => void,
        error: (error: HttpOData.Error) => void): HttpOData.RequestWithAbort {
        return oData.net.defaultHttpClient.request(request, success, error);
    }
}
