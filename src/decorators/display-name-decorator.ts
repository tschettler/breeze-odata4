import { Edm } from 'ts-odatajs';

import { AnnotationDecorator } from './annotation-decorator';

/**
 * Annotatable expression with a displayName property.
 */
export interface ExpressionWithDisplayName extends Edm.Base.Annotatable {
    displayName?: string;
}

/**
 * @classdesc Decorates an annotatable expression with a displayName property.
 *
 * @example The following example metadata to set the displayName property of the Article Title data property.
 * ```xml
 *
 *     <Annotations Target="OData4Test.Models.Article/Title">
 *         <Annotation Term="Org.OData.Display.V1.DisplayName" String="Article Title" />
 *     </Annotations>
 * ```
 */
export class DisplayNameDecorator implements AnnotationDecorator {

    /**
     * Determines whether or not to process the specified annotation.
     * @param  {Edm.Annotation} annotation The annotation to check.
     * @returns true if the annotation term is `Org.OData.Display.V1.DisplayName` or ends with `DisplayName`.
     */
    public canDecorate(annotation: Edm.Annotation): boolean {
        return annotation.term === 'Org.OData.Display.V1.DisplayName' || /.\.DisplayName$/.test(annotation.term);
    }

    public decorate(expression: ExpressionWithDisplayName, annotation: Edm.Annotation): void {
        const value = annotation.string;

        expression.displayName = typeof value === 'string' ? value : value.text;
    }
}
