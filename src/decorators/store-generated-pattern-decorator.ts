import { Edm } from 'ts-odatajs';

import { AnnotationDecorator } from './annotation-decorator';

/**
 * Annotatable expression with a StoreGeneratedPattern property.
 */
export interface ExpressionWithStoreGeneratedPattern extends Edm.Base.Annotatable {
    StoreGeneratedPattern?: string; // case matters here
}

/**
 * @classdesc Decorates an annotatable expression with a StoreGeneratedPattern property.
 *
 * @example The following example metadata to set the StoreGeneratedPattern for the Article entity key.
 * ```xml
 *
 *     <Annotations Target="OData4Test.Models.Article/Id">
 *         <Annotation Term="Metadata.StoreGeneratedPattern" String="Identity" />
 *     </Annotations>
 * ```
 */
export class StoreGeneratedPatternDecorator implements AnnotationDecorator {

    /**
     * Determines whether or not to process the specified annotation.
     * @param  {Edm.Annotation} annotation The annotation to check.
     * @returns true if the annotation term ends with `.StoreGeneratedPattern`.
     */
    public canDecorate(annotation: Edm.Annotation): boolean {
        return /.\.StoreGeneratedPattern$/.test(annotation.term);
    }

    public decorate(expression: ExpressionWithStoreGeneratedPattern, annotation: Edm.Annotation): void {
        const value = annotation.string;

        expression.StoreGeneratedPattern = typeof value === 'string' ? value : value.text;
    }
}
