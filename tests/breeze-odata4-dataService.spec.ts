import { config, DataService, DataServiceAdapter, DataServiceOptions, JsonResultsAdapter, MetadataStore } from 'breeze-client';
import * as fs from 'fs';
import * as path from 'path';
import { HttpOData } from 'ts-odatajs';
import { NavigationAdapter } from '../src/adapters/adapters';
import { ClassRegistry } from '../src/class-registry';
import { DataTypeSetup } from '../src/datatypes/setups/datatype-setup';
import { ODataHttpClient } from '../src/odata-http-client';
import { BreezeOData4 } from './../src/breeze-odata4';
import { OData4DataService } from './../src/breeze-odata4-dataService';

const metadataXml = fs.readFileSync(path.join(__dirname, './metadata.xml'), 'utf-8');
jest.mock('../src/class-registry');

const MockWebApiDataService = jest.fn<DataServiceAdapter, []>(() => (<any>{
    name: 'WebApi',
    _catchNoConnectionError: jest.fn(),
    _createChangeRequestInterceptor: jest.fn(),
    checkForRecomposition: jest.fn(),
    initialize: jest.fn()
}));

describe('OData4DataService', () => {
    let sut: OData4DataService;
    let innerAdapter: DataServiceAdapter;

    beforeEach(() => {
        jest.clearAllMocks();
        config.registerAdapter('dataService', MockWebApiDataService);
        OData4DataService.register();
        config.initializeAdapterInstance('dataService', OData4DataService.BreezeAdapterName, true);

        sut = <OData4DataService>config.getAdapterInstance('dataService');
        innerAdapter = <DataServiceAdapter>config.getAdapterInstance('dataService', 'WebApi');
    });

    it('should return value for metadataAcceptHeader', () => {
        const result = sut.metadataAcceptHeader;
        expect(result.length).toBeGreaterThan(0);
    });

    it('should have OData-Version 4.0 header', () => {
        const result = sut.headers;
        expect(result['OData-Version']).toEqual('4.0');
    });

    it('should create instance of OData4DataService when constructor is called', () => {
        const svc = new OData4DataService();
        expect(svc).toBeInstanceOf(OData4DataService);
    });

    it('should register DataService when register is called', () => {
        const adapter = config.getAdapterInstance('dataService');
        expect(adapter).toBeInstanceOf(OData4DataService);
    });

    it('should call inner adapter when _catchNoConnectionError is called', () => {
        sut._catchNoConnectionError(null);

        expect((<any>innerAdapter)._catchNoConnectionError).toHaveBeenCalledTimes(1);
    });

    it('should call inner adapter when _createChangeRequestInterceptor is called', () => {
        sut._createChangeRequestInterceptor(null, null);

        expect((<any>innerAdapter)._createChangeRequestInterceptor).toHaveBeenCalledTimes(1);
    });

    it('should call inner adapter checkForRecomposition', () => {
        expect(innerAdapter.checkForRecomposition).toHaveBeenCalledTimes(1);
    });

    describe('initialize', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            sut.initialize();
        });

        it('should set jsonResultsAdapter', () => {
            expect(sut.jsonResultsAdapter).toBeInstanceOf(JsonResultsAdapter);
        });

    });

    describe('getAbsoluteUrl', () => {
        it('should return valid url when url does not contain service name', () => {
            const serviceName = 'TestService';
            const opts: DataServiceOptions = {
                serviceName: serviceName
            };

            const ds = new DataService(opts);
            const url = '$metadata';

            const result = sut.getAbsoluteUrl(ds, url);

            expect(result).toEqual(`${serviceName}/${url}`);
        });

        it('should return valid url when url contains service name', () => {
            const serviceName = 'TestService';
            const opts: DataServiceOptions = {
                serviceName: serviceName
            };

            const ds = new DataService(opts);
            const url = `${serviceName}/$metadata`;

            const result = sut.getAbsoluteUrl(ds, url);

            expect(result).toEqual(url);
        });

        it('should return relative url when window exists and url starts with double slash', () => {
            const serviceName = '//TestService';
            const opts: DataServiceOptions = {
                serviceName: serviceName
            };

            global['window'] = {};
            global['location'] = { origin: 'http://localhost' };

            const ds = new DataService(opts);
            const url = `${serviceName}/$metadata`;

            const result = sut.getAbsoluteUrl(ds, url);

            expect(result).toEqual(url);
        });

        it('should return correct url when window exists and url starts with http', () => {
            const serviceName = 'http://TestService';
            const opts: DataServiceOptions = {
                serviceName: serviceName
            };

            global['window'] = {};
            global['location'] = { origin: 'http://localhost' };

            const ds = new DataService(opts);
            const url = `${serviceName}/$metadata`;

            const result = sut.getAbsoluteUrl(ds, url);

            expect(result).toEqual(url);
        });


        it('should return correct url when window exists and url starts with https', () => {
            const serviceName = 'https://TestService';
            const opts: DataServiceOptions = {
                serviceName: serviceName
            };

            global['window'] = {};
            global['location'] = { origin: 'https://localhost' };

            const ds = new DataService(opts);
            const url = `${serviceName}/$metadata`;

            const result = sut.getAbsoluteUrl(ds, url);

            expect(result).toEqual(url);
        });

        it('should return absolute url when window exists and url does not start with double slash', () => {
            const serviceName = 'TestService';
            const opts: DataServiceOptions = {
                serviceName: serviceName
            };

            global['window'] = {};
            global['location'] = { origin: 'http://localhost' };

            const ds = new DataService(opts);
            const url = `${serviceName}/$metadata`;

            const result = sut.getAbsoluteUrl(ds, url);

            expect(result).toEqual(`${location.origin}/${serviceName}/$metadata`);
        });


        it('should return absolute url when window exists and url does not contain service name', () => {
            const serviceName = 'TestService';
            const opts: DataServiceOptions = {
                serviceName: serviceName
            };

            global['window'] = {};
            global['location'] = { origin: 'http://localhost' };

            const ds = new DataService(opts);
            const url = `$metadata`;

            const result = sut.getAbsoluteUrl(ds, url);

            expect(result).toEqual(`${location.origin}/${serviceName}/${url}`);
        });

    });

    describe('fetchMetadata', () => {
        it('should get metadata', async () => {
            const httpClient = new ODataHttpClient();
            httpClient.request = (req, success, error) => {
                const response = <HttpOData.Response>{
                    headers: {
                        'Content-Type': 'application/xml'
                    },
                    body: metadataXml,
                    requestUri: req.requestUri,
                    statusCode: '200',
                    statusText: 'OK'
                };
                success(response);
                return <HttpOData.RequestWithAbort>{};
            };

            delete global['window'];
            global['location'] = { origin: 'http://localhost' };
            (<any>ClassRegistry.MetadataAdapters.get).mockReturnValue([new NavigationAdapter()]);
            (<any>ClassRegistry.DataTypeSetups.get) = jest.fn().mockImplementation(() => <DataTypeSetup[]>[]);
            BreezeOData4.configure();
            const ds = new OData4DataService();
            ds.initialize();
            ds.httpClient = httpClient;

            const metadataStore = new MetadataStore();
            const dataService = new DataService({
                serviceName: 'http://localhost',
                hasServerMetadata: true
            });

            const result = await ds.fetchMetadata(metadataStore, dataService);
            expect(result).toBeTruthy();
        });
    });
});
