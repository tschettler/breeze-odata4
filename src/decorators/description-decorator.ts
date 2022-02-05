import { Edm } from 'ts-odatajs';

import { AnnotationDecorator } from './annotation-decorator';

/**
 * Annotatable expression with a description property.
 */
export interface ExpressionWithDescription extends Edm.Base.Annotatable {
    description?: string;
}

/**
 * @classdesc Decorates an annotatable expression with a description property.
 *
 * @example The following example metadata to set the description property of the Article Title data property.
 * ```xml
 *
 *     <Annotations Target="OData4Test.Models.Article/Title">
 *         <Annotation Term="Org.OData.Display.V1.Description" String="The title of the article." />
 *     </Annotations>
 * ```
 */
export class DescriptionDecorator implements AnnotationDecorator {
    public terms = ['Org.OData.Display.V1.Description', 'Org.OData.Core.V1.Description'];

    /**
     * Determines whether or not to process the specified annotation.
     * @param  {Edm.Annotation} annotation The annotation to check.
     * @returns true if the annotation term is `Org.OData.Display.V1.Description` or `Org.OData.Core.V1.Description`.
     */
     public canDecorate(annotation: Edm.Annotation): boolean {
        return this.terms.includes(annotation.term);
    }

    public decorate(expression: ExpressionWithDescription, annotation: Edm.Annotation): void {
        const value = annotation.string;

        expression.description = typeof value === 'string' ? value : value.text;
    }
}
