import { CustomDecorator, ExpressionWithCustom } from './../../src/decorators/custom-decorator';
import { Edm } from 'ts-odatajs';

let sut: CustomDecorator;

describe('CustomDecorator', () => {
  beforeEach(() => {
    sut = new CustomDecorator();
  });

  describe('canDecorate', () => {
    it('should return true when annotation term contains Custom', () => {
      const annotation: Edm.Annotation = {
        term: 'UnitTesting.Custom.Value'
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeTruthy();
    });

    it('should return false when annotation term does not contain Custom', () => {
      const annotation: Edm.Annotation = {
        term: 'UnitTesting.X.Value'
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeFalsy();
    });
  });

  describe('decorate', () => {
    it('should not decorate without path', () => {
      const expression: ExpressionWithCustom = {};

      const annotation: Edm.Annotation = {
        term: 'UnitTesting.Custom',
        string: 'Bar'
      };

      sut.decorate(expression, annotation);

      expect(expression.custom).toBeUndefined();
    });

    it('should decorate simple path', () => {
      const expression: ExpressionWithCustom = {};

      const annotation: Edm.Annotation = {
        term: 'UnitTesting.Custom.Foo',
        string: 'Bar'
      };

      sut.decorate(expression, annotation);

      expect(expression.custom.Foo).toBe(annotation.string);
    });

    it('should decorate complex path', () => {
      const expression: ExpressionWithCustom = {};

      const annotation: Edm.Annotation = {
        term: 'UnitTesting.Custom.Foo.Bar',
        string: 'FooBar'
      };

      sut.decorate(expression, annotation);

      expect(expression.custom.Foo.Bar).toBe(annotation.string);
    });

    it('should handle decorating with multiple annotations', () => {
      const expression: ExpressionWithCustom = {};

      const annotation: Edm.Annotation = {
        term: 'UnitTesting.Custom.Foo.Date',
        date: '2018-01-01'
      };

      const annotation2: Edm.Annotation = {
        term: 'UnitTesting.Custom.Foo.Answer',
        int: '42'
      };

      sut.decorate(expression, annotation);
      sut.decorate(expression, annotation2);

      expect(expression.custom.Foo.Date).toEqual(new Date(annotation.date.toString()));
      expect(expression.custom.Foo.Answer).toBe(Number(annotation2.int));
    });
  });
});
