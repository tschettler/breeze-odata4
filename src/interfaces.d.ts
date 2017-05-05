import { DataTypeSymbol, Validator, DataService, DataServiceAdapter, DataProperty, EntityAspect, EntityManager, Entity, MetadataStore, ComplexObject } from 'breeze-client';
export interface DataTypeSymbolEx extends DataTypeSymbol {
    isFloat?: boolean;
    isInteger?: boolean;
    quoteJsonOData?: boolean;
    validatorCtor: (context: any) => Validator;
    parse?: (val: any, sourceTypeName?: string) => any;
    fmtOData: (val: any) => any;
    getNext?: () => any;
    normalize?: (val: any) => any;
    getConcurrencyValue?: (val: any) => any;
    parseRawValue?: (val: any) => any;
}
export interface DataServiceEx extends DataService {
    qualifyUrl(suffix: string): string;
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
export declare class ODataError extends Error {
    body: any;
    statusText: string;
    status: number;
    url: string;
    constructor(message?: string);
    toString(): string;
}
