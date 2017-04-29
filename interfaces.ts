import { DataTypeSymbol, Validator, DataService, DataServiceAdapter, DataProperty, EntityAspect, EntityManager, Entity, MetadataStore, ComplexObject } from 'breeze-client';

export interface DataTypeSymbolEx extends DataTypeSymbol {
    isFloat?: boolean;
    isInteger?: boolean;
    quoteJsonOData?: boolean;

    validatorCtor: (context: any) => Validator;

    /** Function to convert a value from string to this DataType.  Note that this will be called each time a property is changed, so make it fast. */
    parse?: (val: any, sourceTypeName?: string) => any;

    /** Function to format this DataType for OData queries. */
    fmtOData: (val: any) => any;

    /** Optional function to get the next value for key generation, if this datatype is used as a key.  Uses an internal table of previous values. */
    getNext?: () => any;

    /** Optional function to normalize a data value for comparison, if its value cannot be used directly.  Note that this will be called each time a property is changed, so make it fast. */
    normalize?: (val: any) => any;

    /** Optional function to get the next value when the datatype is used as a concurrency property. */
    getConcurrencyValue?: (val: any) => any;

    /** Optional function to convert a raw (server) value from string to this DataType. */
    parseRawValue?: (val: any) => any;
}

export interface DataServiceEx extends DataService {
    qualifyUrl(suffix: string): string;
}

export interface ODataServiceAdapter extends DataServiceAdapter {
    headers: { [key: string]: string; };

    getAbsoluteUrl: (dataService: DataService, url: string) => string;

    _catchNoConnectionError(err: Error): any;
}

export interface DataServiceSaveContext {
    resourceName: string;
    dataService: DataService;
    adapter: DataServiceAdapter;
    routePrefix: string;
    tempKeys: any[];
    contentKeys: any[];
    entityManager: EntityManager;
}

export interface EntityAspectExt extends EntityAspect {
    getPropertyValue: (property: string | DataProperty) => any;
}

export interface EntityManagerEx extends EntityManager {
    helper: {
        unwrapInstance: (structObj: any, transformFn: (dp: DataProperty, val: any) => any) => any;
        unwrapOriginalValues: (target: ComplexObject | Entity, metadataStore: MetadataStore, transformFn: (dp: DataProperty, val: any) => any) => any;
        unwrapChangedValues: (entity: Entity, metadataStore: MetadataStore, transformFn: (dp: DataProperty, val: any) => any) => any;
    };
}

export class ODataError extends Error {
    body: any;
    statusText: string;
    status: number;
    url: string;

    constructor(message?: string) {
        super(message);
    }

    toString() {
        return this.name + ': ' + this.message;
    }
}
