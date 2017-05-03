import { MetadataAdapter } from "./metadata-adapter";
import { AnnotationDecorator } from "../decorators/annotation-decorator";
export declare class AnnotationAdapter implements MetadataAdapter {
    decorators: AnnotationDecorator[];
    constructor();
    adapt(schema: any): void;
    private getProperty(entityType, propertyName);
}
