import { AjaxConfig, config, HttpResponse } from 'breeze-client';
import { Edmx, HttpOData } from 'ts-odatajs';

import { ODataHttpClient } from '../../src/odata-http-client';
import { OData4BatchAjaxAdapter } from '../../src/ajax-adapters';

describe('OData4BatchAjaxAdapter', () => {
    let sut: OData4BatchAjaxAdapter;

    beforeAll(() => {
        sut = new OData4BatchAjaxAdapter();
    });

    it('should register when register is called', () => {
        OData4BatchAjaxAdapter.register();

        const adapter = config.getAdapterInstance('ajax');
        expect(adapter).toBeInstanceOf(OData4BatchAjaxAdapter);
    });

    it('should return correct value for name', () => {
        expect(sut.name).toEqual(OData4BatchAjaxAdapter.BreezeAdapterName);
    });

    describe('ajax', () => {
        let ajaxConfig: AjaxConfig;
        let httpClient: ODataHttpClient;
        let metadata: Edmx.Edmx;
        let odataResponse: HttpOData.Response;

        beforeEach(() => {
            ajaxConfig = {
                type: 'POST',
                url: 'https://localhost/Testing/$batch',
                headers: { 'OData-Version': '4.0' },
                success: jest.fn(),
                error: jest.fn()
            };

            httpClient = new ODataHttpClient();

            httpClient.request = (req, success, error) => {
                odataResponse = ({
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {},
                    requestUri: '',
                    statusCode: '200',
                    statusText: 'OK',
                } as HttpOData.Response);
                success(odataResponse);
                return {} as HttpOData.RequestWithAbort;
            };

            metadata = null;
        });

        it('should map response correctly', async () => {
            const result = await new Promise<HttpResponse>((resolve) => {
                ajaxConfig.success = res => resolve(res);
                sut.ajax(ajaxConfig, httpClient, metadata);
            });

            expect(result).toMatchObject({
                config: ajaxConfig,
                data: {},
                error: null,
                status: 200
            });

            expect(ajaxConfig.error).toHaveBeenCalledTimes(0);
        });

        it('should allow retrieving headers from response', async () => {
            const response = await new Promise<HttpResponse>((resolve) => {
                ajaxConfig.success = res => resolve(res);
                sut.ajax(ajaxConfig, httpClient, metadata);
            });

            const result = response.getHeaders('Content-Type');
            const expected = 'application/json';
            expect(result).toEqual(expected);
        });

        it('should allow succeed without defaultSettings', async () => {
            const settings = sut.defaultSettings;
            sut.defaultSettings = null;

            const result = await new Promise<HttpResponse>((resolve) => {
                ajaxConfig.success = res => resolve(res);
                sut.ajax(ajaxConfig, httpClient, metadata);
            });

            sut.defaultSettings = settings;
            expect(result).toBeTruthy();
        });

        it('should handle error response correctly', async () => {
            httpClient.request = (req, success, error) => {
                error({ message: 'An error occurred' } as HttpOData.Error);
                return {} as HttpOData.RequestWithAbort;
            };

            const result = await new Promise<HttpOData.Error>((resolve, error) => {
                ajaxConfig.error = err => resolve(err as any);
                sut.ajax(ajaxConfig, httpClient, metadata);
            });

            expect(result).toMatchObject({
                message: 'An error occurred'
            });

            expect(ajaxConfig.success).toHaveBeenCalledTimes(0);
        });
    });
});