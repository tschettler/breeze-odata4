import { core } from 'breeze-client';
import { Edm } from 'ts-odatajs';

import { Utilities } from '../utilities';
import { AnnotationDecorator } from './annotation-decorator';

export interface ExpressionWithCustom extends Edm.Base.Annotatable {
    custom?: any;
}

const CustomTerm = 'Custom';

export class CustomDecorator implements AnnotationDecorator {
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
