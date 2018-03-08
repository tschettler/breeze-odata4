/// <reference path="../typings/breeze-client/index.d.ts" />
export { OData4DataService } from './breeze-odata4-dataService';
export { OData4PredicateVisitor } from './breeze-odata4-predicateVisitor';
export { OData4UriBuilder } from './breeze-odata4-uriBuilder';
export { ClassRegistry, ClassRepository, Type } from './class-registry';
export {
    InvokableEntry,
    adaptComplexType,
    adaptEntityType,
    adaptStructuralType,
    getActions,
    getDataType,
    getEdmTypeFromTypeName,
    getFunctions,
    getInvokableUrl,
    lookupAction,
    lookupFunction
} from './utilities';
export { MetadataAdapter } from './adapters/metadata-adapter';
export { AnnotationAdapter } from './adapters/annotation-adapter';
export { NavigationAdapter } from './adapters/navigation-adapter';

export { AnnotationDecorator } from './decorators/annotation-decorator';
export { DisplayNameDecorator, ExpressionWithDisplayName } from './decorators/display-name-decorator';
export { StoreGeneratedPatternDecorator, ExpressionWithStoreGeneratedPattern } from './decorators/store-generated-pattern-decorator';
export { ValidatorDecorator, ExpressionWithValidators } from './decorators/validator-decorator';
