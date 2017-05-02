import { MetadataAdapter } from "./metadata-adapter";

export class IdentityAdapter implements MetadataAdapter {
    adapt(schema: any): void {
        throw new Error('Method not implemented.');
    }


}