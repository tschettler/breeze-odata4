import { MetadataAdapter } from "./metadata-adapter";
export declare class NavigationAdapter implements MetadataAdapter {
    private associations;
    adapt(schema: any): void;
    adaptEntityType(schema: any, entityType: any): void;
    adaptNavigationProperty(schema: any, entityTypeName: string, navProp: any): void;
    private getAssociation(firstType, secondType);
    private setAssociations(schema);
}
