import { MetadataAdapter } from '../adapters/metadata-adapter';
import { Type } from '../class-registry';
import { DataTypeSetup } from '../datatypes/setups/datatype-setup';
import { AnnotationDecorator } from '../decorators/annotation-decorator';
import { DataServiceAdapterOptions } from './dataService-adapter-options';
import { NavigationAdapterOptions } from './navigation-adapter-options';

/**
 * The default OData 4 options.
 */
 export const DefaultOptions: BreezeOData4Options = {
    annotationDecorators: [],
    dataServiceAdapter: { headers: {} },
    dataTypeSetups: [],
    initializeAdapters: true,
    metadataAdapters: [],
    navigationAdapter: { foreignKeyConventions: [] },
    useBatchSave: true
};

/**
 * Configuration options for breeze-odata4.
 */
export interface BreezeOData4Options {
     /**
      * Custom annotation decorators to register with breeze-odata4.
      */
     annotationDecorators: Type<AnnotationDecorator>[];
 
     /**
      * Options for data service adapter.
      */
     dataServiceAdapter: Partial<DataServiceAdapterOptions>;

     /**
      * Custom adata type setups to register with breeze-odata4.
      */
     dataTypeSetups: Type<DataTypeSetup>[];
 
     /** Determines whether to initialize the breeze-odata4 dataService and uriBuilder breeze adapter instances.
      * @default true
      */
     initializeAdapters: boolean;
 
     /**
      * Custom metadata adapters to register with breeze-odata4.
      */
     metadataAdapters: Type<MetadataAdapter>[];
 
     /**
      * Options for navigation adapter.
      */
     navigationAdapter: Partial<NavigationAdapterOptions>;

     /** Determines whether to use batch saving.
      * @default true
      */
     useBatchSave: boolean;
}
