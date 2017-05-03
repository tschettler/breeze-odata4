import { MetadataAdapter } from "./adapters/metadata-adapter";
import { AnnotationDecorator } from "./decorators/annotation-decorator";

interface Type<T> {
    new (): T;
}

export class ClassRepository<T> {
    types: Type<T>[] = [];

    add(...types: Type<T>[]): void {
        this.types = this.types.concat(types);
    }

    get(): T[] {
        var results = this.types.map(t => new t());

        return results;
    }
}

export class ClassRegistry {
    static MetadataAdapters = new ClassRepository<MetadataAdapter>();
    static AnnotationDecorators = new ClassRepository<AnnotationDecorator>();
}
