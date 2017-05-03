import { MetadataAdapter } from "./adapters/metadata-adapter";
import { AnnotationDecorator } from "./decorators/annotation-decorator";
export interface Type<T> {
    new (): T;
}
export declare class ClassRepository<T> {
    types: Type<T>[];
    add(...types: Type<T>[]): void;
    get(): T[];
}
export declare class ClassRegistry {
    static MetadataAdapters: ClassRepository<MetadataAdapter>;
    static AnnotationDecorators: ClassRepository<AnnotationDecorator>;
}
