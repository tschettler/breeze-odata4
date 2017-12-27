import { core, DataType, DataTypeSymbol } from 'breeze-client';
import { Edm } from 'ts-odatajs';

import { AnnotationDecorator } from './annotation-decorator';
import { getDataType } from '../utilities';

export interface ExpressionWithValidators extends Edm.Base.Annotatable {
    validators?: any[];
}

export class ValidatorDecorator implements AnnotationDecorator {
    public annotation = 'Validator';

    public decorate(expression: ExpressionWithValidators, annotation: Edm.Annotation): void {
        expression.validators = expression.validators || [];

        const keys = Object.keys(annotation);
        core.arrayRemoveItem(keys, 'term', false);

        const valueKey = keys[0];
        const value = annotation[valueKey];

        const nameAndProp = annotation.term.replace(/^.*Validator\./, '').split('.');
        const name = nameAndProp.shift();
        const prop = nameAndProp.shift();

        let validator = expression.validators.find((val: { name: string; }) => {
            return val.name === name;
        });

        if (!validator) {
            validator = { name: name };
            expression.validators.push(validator);
        }

        const dataType = getDataType(valueKey);
        validator[prop] = dataType.parse(value, 'string');
    }
}
