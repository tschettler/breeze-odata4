import { MetadataAdapter } from './adapters/metadata-adapter';
import { Type } from './class-registry';
import { DataTypeSetup } from './datatypes/setups/datatype-setup';
import { AnnotationDecorator } from './decorators/annotation-decorator';
import { AssociationEndpoint } from './models';

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

    /** Additional conventions used to infer foreign key properties. These are preferred over the defaults.
     * These conventions are used to define referential constraints for navigation properties.
     * @default
     *
     *     [endpoint.propertyName][suffix]
     *     [endpoint.propertyName]Id
     *     [endpoint.partnerEntityShortName][suffix]
     *     [endpoint.partnerEntityShortName]Id
     */
    foreignKeyConventions: ((endpoint: AssociationEndpoint, suffix: string) => string)[];

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

    /** The metadata accept header.
     * @default 'application/json;odata.metadata=full'
     */
    metadataAcceptHeader: string;

    /** Determines whether to fail on save error.
     * @default true
     */
    failOnSaveError: boolean;

    /** Determines whether to use batch saving.
     * @default true
     */
    useBatchSave: boolean;
}

/**
 * The default OData 4 options.
 */
export const DefaultOptions: BreezeOData4Options = {
    allowManyToManyRelationships: false,
    annotationDecorators: [],
    dataTypeSetups: [],
    foreignKeyConventions: [],
    inferNavigationPropertyPartner: true,
    inferReferentialConstraints: true,
    initializeAdapters: true,
    metadataAdapters: [],
    failOnSaveError: true,
    metadataAcceptHeader: 'application/json;odata.metadata=full',
    useBatchSave: true
};
