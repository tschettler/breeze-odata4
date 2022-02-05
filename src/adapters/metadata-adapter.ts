import { Edm, Edmx } from 'ts-odatajs';

/**
 * Provides capability to adapt the metadata.
 */
export interface MetadataAdapter {
    /**
     * Adapts the specified metadata.
     * @param  {Edmx.DataServices} metadata The metadata.
     * @returns void
     */
    adapt(metadata: Edmx.DataServices): void;

    /**
     * Adapts the schema contained within the metadata.
     * @param  {Edm.Schema} schema The schema.
     * @returns void
     */
    adaptSchema(schema: Edm.Schema): void;
}
