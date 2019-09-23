import { config, DataServiceAdapter, JsonResultsAdapter, DataService, DataServiceOptions } from 'breeze-client';
import { OData4DataService } from './../src/breeze-odata4-dataService';
jest.mock('../src/class-registry');
import { ClassRegistry } from '../src/class-registry';

const MockWebApiDataService = jest.fn<DataServiceAdapter>(() => ({
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

        expect(innerAdapter._catchNoConnectionError).toHaveBeenCalledTimes(1);
    });

    it('should call inner adapter when _createChangeRequestInterceptor is called', () => {
        sut._createChangeRequestInterceptor(null, null);

        expect(innerAdapter._createChangeRequestInterceptor).toHaveBeenCalledTimes(1);
    });

    it('should call inner adapter checkForRecomposition', () => {
        expect(innerAdapter.checkForRecomposition).toHaveBeenCalledTimes(1);
    });

    describe('initialize', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            sut.initialize();
        });

        it('should call get on ClassRegistry.MetadataAdapters', () => {
            expect(ClassRegistry.MetadataAdapters.get).toHaveBeenCalledTimes(1);
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
});
