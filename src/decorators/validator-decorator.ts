import { DataType, DataTypeSymbol } from 'breeze-client';
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
        const value = annotation[keys[1]]; // assuming value is second key
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

        const dataType = getDataType(keys[1]); // TODO: need to see if this still works with the interface
        validator[prop] = dataType.parse(value, 'string');
    }
}
