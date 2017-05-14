import { MetadataAdapter } from "./metadata-adapter";
import { oData } from "ts-odatajs";

export class IdentityAdapter implements MetadataAdapter {
    adapt(metadata: any): void {
        oData.utils.forEachSchema(metadata.schema, this.adaptSchema.bind(this));
    }

    adaptSchema(schema: any): void {
        const entityTypes: any[] = schema.entityType || [];
        entityTypes.forEach(entType => {
            entType.key = entType.key[0];
            entType.key[0] = entType.key; // needed by odatajs jsonGetEntryKey
        });
    }
}
