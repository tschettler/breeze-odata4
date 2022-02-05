import { core } from 'breeze-client';
import { Edm } from 'ts-odatajs';

import { Utilities } from '../utilities';
import { AnnotationDecorator } from './annotation-decorator';

/**
 * Annotatable expression with a validators property.
 */
export interface ExpressionWithValidators extends Edm.Base.Annotatable {
  validators?: any[];
}

const ValidatorTerm = 'Validator';

/**
 * @classdesc Decorates an annotatable expression with a validators property.
 *
 * @example The following example metadata to add required validator configuration for the Article Title data property.
 * ```xml
 *
 *     <Annotations Target="OData4Test.Models.Article/Title">
 *        <Annotation Term="Metadata.Validator.required.ErrorMessage" String="The Title field is required." />
 *        <Annotation Term="Metadata.Validator.required.AllowEmptyStrings" Bool="false" />
 *        <Annotation Term="Metadata.Validator.required.ErrorMessageString" String="The {0} field is required." />
 *     </Annotations>
 * ```
 */
export class ValidatorDecorator implements AnnotationDecorator {

  /**
   * Determines whether or not to process the specified annotation.
   * @param  {Edm.Annotation} annotation The annotation to check.
   * @returns true if the annotation term contains `.Validator`.
   */
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
    validator[prop] = Utilities.parseValue(dataType, value);
  }
}
