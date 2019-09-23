import { Edm } from 'ts-odatajs';
import { ValidatorDecorator, ExpressionWithValidators } from './../../src/decorators/validator-decorator';

let sut: ValidatorDecorator;

describe('ValidatorDecorator', () => {
  beforeEach(() => {
    sut = new ValidatorDecorator();
  });

  describe('canDecorate', () => {
    it('should return true when annotation term contains Validator', () => {
      const annotation: Edm.Annotation = {
        term: 'UnitTesting.Validator'
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeTruthy();
    });

    it('should return false when annotation term does not contain Validator', () => {
      const annotation: Edm.Annotation = {
        term: 'UnitTesting.X'
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeFalsy();
    });
  });

  describe('decorate', () => {
    it('should not decorate without path', () => {
      const expression: ExpressionWithValidators = {};

      const annotation: Edm.Annotation = {
        term: 'UnitTesting.Validator',
        string: 'Bar'
      };

      sut.decorate(expression, annotation);

      expect(expression.validators).toHaveLength(0);
    });

    it('should decorate simple path', () => {
      const expression: ExpressionWithValidators = {};

      const annotation: Edm.Annotation = {
        term: 'UnitTesting.Validator.required',
        string: ''
      };

      sut.decorate(expression, annotation);

      expect(expression.validators[0]).toMatchObject({ name: 'required' });
    });

    it('should decorate complex path', () => {
      const expression: ExpressionWithValidators = {};

      const annotation: Edm.Annotation = {
        term: 'UnitTesting.Validator.required.errorMessage',
        string: 'Value is required'
      };

      sut.decorate(expression, annotation);

      expect(expression.validators[0]).toMatchObject({ errorMessage: annotation.string });
    });

    it('should handle decorating with multiple annotations', () => {
      const expression: ExpressionWithValidators = {};

      const annotation: Edm.Annotation = {
        term: 'UnitTesting.Validator.maxlength.errorMessage',
        string: 'Value must not exceed max length'
      };

      const annotation2: Edm.Annotation = {
        term: 'UnitTesting.Validator.maxlength.max',
        int: '42'
      };

      sut.decorate(expression, annotation);
      sut.decorate(expression, annotation2);

      expect(expression.validators[0]).toMatchObject({ name: 'maxlength', errorMessage: annotation.string, max: Number(annotation2.int) });
    });
  });
});
