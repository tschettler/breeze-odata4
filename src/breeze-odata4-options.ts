import { MetadataAdapter } from './adapters/metadata-adapter';
import { BreezeOData4Options } from './breeze-odata4-options';
import { Type } from './class-registry';
import { DataTypeSetup } from './datatypes/setups/datatype-setup';
import { AnnotationDecorator } from './decorators/annotation-decorator';

/**
 * Configuration options for breeze-odata4.
 */
export interface BreezeOData4Options {
    /** Determines whether to allow many-to-many entity relationships.
     * @default false
     */
    allowManyToManyRelationships: boolean;

    /**
     * Custom annotation decorators to register with breeze-odata4.
     */
    annotationDecorators: Type<AnnotationDecorator>[];

    /**
     * Custom adata type setups to register with breeze-odata4.
     */
    dataTypeSetups: Type<DataTypeSetup>[];

    /** Determines whether to infer the partner when the partner attribute of a navigation property is missing.
     * @default true
     */
    inferNavigationPropertyPartner: boolean;

    /** Determines whether to infer referential constraints when the referentialConstraint attribute is missing.
     * @default true
     */
    inferReferentialConstraints: boolean;

    /** Determines whether to initialize the breeze-odata4 dataService and uriBuilder breeze adapter instances.
     * @default true
     */
    initializeAdapters: boolean;

    /**
     * Custom metadata adapters to register with breeze-odata4.
     */
    metadataAdapters: Type<MetadataAdapter>[];
}

export const DefaultOptions: BreezeOData4Options = {
    allowManyToManyRelationships: false,
    annotationDecorators: [],
    dataTypeSetups: [],
    inferNavigationPropertyPartner: true,
    inferReferentialConstraints: true,
    initializeAdapters: true,
    metadataAdapters: []
};
