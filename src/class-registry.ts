import { MetadataAdapter } from './adapters/metadata-adapter';
import { DataTypeSetup } from './datatypes/setups/datatype-setup';
import { AnnotationDecorator } from './decorators/annotation-decorator';

/**
 * A generic type interface.
 */
export type Type<T> = new () => T;

/**
 * The class repository, a pseudo IOC container for OData 4 types.
 * @template T The type.
 */
export class ClassRepository<T> {
    /**
     * Types instances of the class repository.
     */
    public types: Type<T>[] = [];

    /**
     * Adds type instances to the class repository
     * @param types The type instances.
     */
    public add(...types: Type<T>[]): void {
        this.types = this.types.concat(types);
    }

    /**
     * Gets the class repository
     * @returns Gets the configured type instances.
     */
    public get(): T[] {
        const results = this.types.map(t => new t());

        return results;
    }
}

/**
 * The class registry.
 */
export class ClassRegistry {

    /**
     * Annotation decorators of class registry.
     */
    public static AnnotationDecorators = new ClassRepository<AnnotationDecorator>();

    /**
     * Data type setups of class registry.
     */
    public static DataTypeSetups = new ClassRepository<DataTypeSetup>();

    /**
     * Metadata adapters of class registry.
     */
    public static MetadataAdapters = new ClassRepository<MetadataAdapter>();
}
