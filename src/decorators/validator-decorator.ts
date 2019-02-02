import { core } from 'breeze-client';
import { Edm } from 'ts-odatajs';

import { Utilities } from '../utilities';
import { AnnotationDecorator } from './annotation-decorator';

export interface ExpressionWithValidators extends Edm.Base.Annotatable {
  validators?: any[];
}

const ValidatorTerm = 'Validator';
export class ValidatorDecorator implements AnnotationDecorator {
  public canDecorate(annotation: Edm.Annotation): boolean {
    return annotation.term.indexOf(`.${ValidatorTerm}`) > -1;
  }

  public decorate(expression: ExpressionWithValidators, annotation: Edm.Annotation): void {
    expression.validators = expression.validators || [];

    const keys = Object.keys(annotation);
    core.arrayRemoveItem(keys, 'term', false);

    const valueKey = keys[0];
    const value = annotation[valueKey];

    const nameAndProp = annotation.term.replace(/^.*Validator\.?/, '').split('.');
    const name = nameAndProp.shift();
    const prop = nameAndProp.shift();

    if (!name) {
      return;
    }

    let validator = expression.validators.find((val: { name: string }) => {
      return val.name === name;
    });

    if (!validator) {
      validator = { name: name };
      expression.validators.push(validator);
    }

    if (!prop) {
      return;
    }

    const dataType = Utilities.getDataType(valueKey);
    validator[prop] = dataType.parse(value, 'string');
  }
}
