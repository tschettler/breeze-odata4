import { Schema } from "ts-odatajs";
import { Metadata } from "../interfaces";

export interface MetadataAdapter {
    adapt(metadata: Metadata): void;
    adaptSchema(schema: Schema): void;
}