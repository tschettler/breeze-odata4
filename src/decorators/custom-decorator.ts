import { core } from 'breeze-client';
import { Edm } from 'ts-odatajs';

import { Utilities } from '../utilities';
import { AnnotationDecorator } from './annotation-decorator';

/**
 * Annotatable expression with a custom property used to populate the custom property
 * on a breeze structural type or property.
 */
export interface ExpressionWithCustom extends Edm.Base.Annotatable {
    custom?: any;
}

const CustomTerm = 'Custom';

/**
 * @classdesc Decorates an annotatable expression with a custom property.
 *
 * @example The following example metadata to set the custom property of the Article Title data property.
 * ```xml
 *
 *     <Annotations Target="OData4Test.Models.Article/Title">
 *         <Annotation Term="Metadata.Custom.FieldDescription" String="The title of the article." />
 *     </Annotations>
 * ```
 */
export class CustomDecorator implements AnnotationDecorator {

    /**
     * Determines whether or not to process the specified annotation.
     * @param  {Edm.Annotation} annotation The annotation to check.
     * @returns true if the annotation term contains `.Custom.`.
     */
    public canDecorate(annotation: Edm.Annotation): boolean {
        return /.\.Custom\./.test(annotation.term);
    }

    public decorate(expression: ExpressionWithCustom, annotation: Edm.Annotation): void {
        const keys = Object.keys(annotation);
        core.arrayRemoveItem(keys, 'term', false);

        const valueKey = keys[0];
        const value = annotation[valueKey];

        const termParts = annotation.term.split('.');
        const startIndex = termParts.indexOf(CustomTerm);

        const customPath = termParts.slice(startIndex + 1);

        if (!customPath.length) {
            return;
        }

        const dataType = Utilities.getDataType(valueKey);
        const customValue = Utilities.parseValue(dataType, value);

        expression.custom = expression.custom instanceof Object ? expression.custom : {};

        customPath.reduce((prev: any, curr: string, index: number, arr: string[]) => {
            if (index < arr.length - 1) {
                prev[curr] = prev[curr] instanceof Object ? prev[curr] : {};
                return prev[curr];
            } else {
                prev[curr] = customValue;

                return prev;
            }
        }, expression.custom);
    }
}
