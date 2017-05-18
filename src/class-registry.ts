import { MetadataAdapter } from './adapters/metadata-adapter';
import { AnnotationDecorator } from './decorators/annotation-decorator';

export interface Type<T> {
    new (): T;
}

export class ClassRepository<T> {
    public types: Type<T>[] = [];

    public add(...types: Type<T>[]): void {
        this.types = this.types.concat(types);
    }

    public get(): T[] {
        const results = this.types.map(t => new t());

        return results;
    }
}

export class ClassRegistry {
    public static MetadataAdapters = new ClassRepository<MetadataAdapter>();
    public static AnnotationDecorators = new ClassRepository<AnnotationDecorator>();
}
