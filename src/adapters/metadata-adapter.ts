export interface MetadataAdapter {
    adapt(metadata: any): void;
    adaptSchema(schema: any): void;
}