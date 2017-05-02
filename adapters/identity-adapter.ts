import { MetadataAdapter } from "./metadata-adapter";

export class IdentityAdapter implements MetadataAdapter {
    adapt(schema: any): void {
        var namespace = schema.namespace;
        schema.entityType.forEach(entType => {
            entType.key = entType.key[0];
            entType.key[0] = entType.key; // needed by odatajs jsonGetEntryKey
        });
    }
}
