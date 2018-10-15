import { HttpOData, oData } from 'ts-odatajs';

export class ODataHttpClient implements HttpOData.HttpClient {
    public formatQueryString?: '$format=json';
    public enableJsonPCallback?: boolean;
    public callbackParameterName?: string;

    public request(request: HttpOData.Request,
        success: (response: HttpOData.Response) => void,
        error: (error: HttpOData.Error) => void): HttpOData.RequestWithAbort {

        const response = oData.net.defaultHttpClient.request(request, success, error);

        return response;
    }
}
