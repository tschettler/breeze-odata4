import { core } from 'breeze-client';
import { Edm } from 'ts-odatajs';

import { getDataType } from '../utilities';
import { AnnotationDecorator } from './annotation-decorator';

export interface ExpressionWithCustom extends Edm.Base.Annotatable {
    custom?: any;
}

export class CustomDecorator implements AnnotationDecorator {
    public annotation = 'Custom';

    public decorate(expression: ExpressionWithCustom, annotation: Edm.Annotation): void {
        const keys = Object.keys(annotation);
        core.arrayRemoveItem(keys, 'term', false);

        const valueKey = keys[0];
        const value = annotation[valueKey];

        const termParts = annotation.term.split('.');
        const startIndex = termParts.indexOf(this.annotation);

        const customPath = termParts.slice(startIndex + 1);

        if (!customPath.length) {
            return;
        }

        const dataType = getDataType(valueKey);
        const customValue = dataType.parse(value, 'string');

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
