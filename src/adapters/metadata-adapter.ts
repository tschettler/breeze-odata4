import { Edm, Edmx } from "ts-odatajs";

export interface MetadataAdapter {
    adapt(metadata: Edmx.DataServices): void;
    adaptSchema(schema: Edm.Schema): void;
}