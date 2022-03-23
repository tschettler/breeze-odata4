import { AjaxConfig, config, HttpResponse } from 'breeze-client';
import { Batch, Edmx, HttpOData } from 'ts-odatajs';

import { OData4JsonAjaxAdapter } from '../../src/ajax-adapters';
import { ODataHttpClient } from '../../src/odata-http-client';

describe('OData4JsonAjaxAdapter', () => {
    let sut: OData4JsonAjaxAdapter;

    beforeAll(() => {
        sut = new OData4JsonAjaxAdapter();
    });

    it('should register when register is called', () => {
        OData4JsonAjaxAdapter.register();

        const adapter = config.getAdapterInstance('ajax');
        expect(adapter).toBeInstanceOf(OData4JsonAjaxAdapter);
    });

    it('should return correct value for name', () => {
        expect(sut.name).toEqual(OData4JsonAjaxAdapter.BreezeAdapterName);
    });

    describe('ajax', () => {
        let ajaxConfig: AjaxConfig;
        let httpClient: ODataHttpClient;
        let metadata: Edmx.Edmx;
        let odataResponse: HttpOData.Response;
        let batchRequest: Batch.BatchRequest;

        beforeEach(() => {
            ajaxConfig = {
                type: 'POST',
                url: 'https://localhost/Testing/$batch',
                headers: { 'OData-Version': '4.0' },
                success: jest.fn(),
                error: jest.fn()
            };

            httpClient = new ODataHttpClient();

            metadata = null;
        });

        describe('with request', () => {
            let changeResponse: Batch.ChangeResponse;
            let changeRequests: Batch.ChangeRequest[];

            beforeEach(() => {
                ajaxConfig.success = jest.fn();
                ajaxConfig.error = jest.fn();

                changeRequests = [];
                batchRequest = {
                    __batchRequests: [
                        {
                            __changeRequests: changeRequests
                        }
                    ]
                };
                ajaxConfig.data = batchRequest;

                changeResponse = {} as any;

                httpClient.request = (req, success, error) => {
                    odataResponse = ({
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        data: changeResponse,
                        requestUri: '',
                        statusCode: '200',
                        statusText: 'OK',
                    } as HttpOData.Response);
                    success(odataResponse);
                    return {} as HttpOData.RequestWithAbort;
                };
            });

            it('with no batchRequests property should return empty response', async () => {
                delete batchRequest['__batchRequests'];

                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.data as Batch.BatchResponse;
                expect(result.__batchResponses).toHaveLength(1);
                expect(result.__batchResponses[0].__changeResponses).toHaveLength(0);
            });

            it('with no batchRequests should return empty response', async () => {
                batchRequest.__batchRequests = [];

                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.data as Batch.BatchResponse;
                expect(result.__batchResponses).toHaveLength(1);
                expect(result.__batchResponses[0].__changeResponses).toHaveLength(0);
            });

            it('with batchRequest and no changeRequests property should return empty response', async () => {
                delete batchRequest.__batchRequests[0]['__changeRequests'];
                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.data as Batch.BatchResponse;
                expect(result.__batchResponses).toHaveLength(1);
                expect(result.__batchResponses[0].__changeResponses).toHaveLength(0);
            });

            it('with batchRequest and no changeRequests should return empty response', async () => {
                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.data as Batch.BatchResponse;
                expect(result.__batchResponses).toHaveLength(1);
                expect(result.__batchResponses[0].__changeResponses).toHaveLength(0);
            });

            it('with one change request should return one change response', async () => {
                changeRequests.push({
                    headers: {
                        'Content-ID': '1',
                        'Content-Type': 'application/json'
                    },
                    requestUri: 'https://localhost/testing/Person',
                    method: 'POST',
                    data: { id: 1, firstName: 'Test' }
                });
                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.data as Batch.BatchResponse;
                expect(result.__batchResponses).toHaveLength(1);
                expect(result.__batchResponses[0].__changeResponses).toHaveLength(1);
            });

            it('with multiple change requests should return multiple change responses', async () => {
                changeRequests.push({
                    headers: {
                        'Content-ID': '1',
                        'Content-Type': 'application/json'
                    },
                    requestUri: 'https://localhost/testing/Person',
                    method: 'POST',
                    data: { id: 1, firstName: 'Test' }
                });
                changeRequests.push({
                    headers: {
                        'Content-ID': '2',
                        'Content-Type': 'application/json'
                    },
                    requestUri: 'https://localhost/testing/Person',
                    method: 'POST',
                    data: { id: 2, firstName: 'Test2' }
                });

                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.data as Batch.BatchResponse;
                expect(result.__batchResponses).toHaveLength(1);
                expect(result.__batchResponses[0].__changeResponses).toHaveLength(2);
            });

            it('with change request should set Content-ID on change response', async () => {
                changeRequests.push({
                    headers: {
                        'Content-ID': '1',
                        'Content-Type': 'application/json'
                    },
                    requestUri: 'https://localhost/testing/Person',
                    method: 'POST',
                    data: { id: 1, firstName: 'Test' }
                });
                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.data as Batch.BatchResponse;
                expect((result.__batchResponses[0].__changeResponses[0] as Batch.ChangeResponse).headers['Content-ID']).toEqual(changeRequests[0].headers['Content-ID']);
            });

            it('should return failed responses', async () => {
                changeRequests.push({
                    headers: {
                        'Content-ID': '1',
                        'Content-Type': 'application/json'
                    },
                    requestUri: 'https://localhost/testing/Person',
                    method: 'POST',
                    data: { id: 1, firstName: 'Test' }
                });

                httpClient.request = (req, success, error) => {
                    error({
                        message: 'An error occurred',
                        response: {
                            statusCode: '500',
                            statusText: 'Internal Server Error'
                        }
                    } as HttpOData.Error);
                    return {} as HttpOData.RequestWithAbort;
                };

                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.data as Batch.BatchResponse;
                expect(result.__batchResponses).toHaveLength(1);
                expect(result.__batchResponses[0].__changeResponses).toHaveLength(1);
                expect(result.__batchResponses[0].__changeResponses[0].message).toEqual('An error occurred');
            });

            it('should return error when promise resolution fails', async () => {
                changeRequests.push({
                    headers: {
                        'Content-ID': '1',
                        'Content-Type': 'application/json'
                    },
                    requestUri: 'https://localhost/testing/Person',
                    method: 'POST',
                    data: { id: 1, firstName: 'Test' }
                });

                let errorResult = null;
                await new Promise<HttpResponse>((_, err) => {
                    httpClient.request = (req, success, error) => {
                        error(null); // this will cause the adapter to throw on promise resolution
                        return {} as HttpOData.RequestWithAbort;
                    };
                    ajaxConfig.error = reason => {
                        errorResult = reason;
                        err(reason);
                    }
                    sut.ajax(ajaxConfig, httpClient, metadata);
                }).catch(err => {
                    expect(errorResult).toBeTruthy();
                });
            });
        });

        describe('with no request', () => {
            beforeEach(() => {
                ajaxConfig.success = jest.fn();
                ajaxConfig.error = jest.fn();
                ajaxConfig.data = null;

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

            it('should return empty response', async () => {
                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.data as Batch.BatchResponse;
                expect(result.__batchResponses).toHaveLength(1);
                expect(result.__batchResponses[0].__changeResponses).toHaveLength(0);

            });

            it('should allow retrieving headers from response', async () => {
                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.getHeaders('OData-Version');
                const expected = '4.0';
                expect(result).toEqual(expected);
            });

            it('should return null for headers from response with no default settings', async () => {
                const settings = sut.defaultSettings;
                sut.defaultSettings = null;

                const response = await new Promise<HttpResponse>((resolve) => {
                    ajaxConfig.success = res => resolve(res);
                    sut.ajax(ajaxConfig, httpClient, metadata);
                });

                const result = response.getHeaders('OData-Version');
                expect(result).toBeUndefined();
                sut.defaultSettings = settings;
            });
        });
    });
});