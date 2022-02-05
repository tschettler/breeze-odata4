import { Edm } from 'ts-odatajs';

/**
 * Provides capability to decorate elements based on corresponding annotations.
 */
export interface AnnotationDecorator {
    /**
     * Determines whether or not to process the specified annotation.
     * @param  {Edm.Annotation} annotation The annotation to check.
     * @returns boolean Indicates whether the decorator handles the specified annotation.
     */
    canDecorate(annotation: Edm.Annotation): boolean;

    /**
     * Decorates the annotatable element with additional properties based on the annotation.
     * @param  {Edm.Base.Annotatable} expression The annotatable element.
     * @param  {Edm.Annotation} annotation The annotation for the element.
     * @returns void
     */
    decorate(expression: Edm.Base.Annotatable, annotation: Edm.Annotation): void;
}
