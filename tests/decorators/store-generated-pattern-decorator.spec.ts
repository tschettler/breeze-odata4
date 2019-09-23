import { Edm } from 'ts-odatajs';
import {
  StoreGeneratedPatternDecorator,
  ExpressionWithStoreGeneratedPattern
} from './../../src/decorators/store-generated-pattern-decorator';

let sut: StoreGeneratedPatternDecorator;

describe('StoreGeneratedPatternDecorator', () => {
  beforeEach(() => {
    sut = new StoreGeneratedPatternDecorator();
  });

  describe('canDecorate', () => {
    it('should return true when annotation uses store generated pattern term', () => {
      const annotation: Edm.Annotation = {
        term: 'UnitTesting.StoreGeneratedPattern'
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeTruthy();
    });

    it('should return false when annotation term does not match', () => {
      const annotation: Edm.Annotation = {
        term: 'Identity'
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeFalsy();
    });
  });

  describe('decorate', () => {
    it('should use string value as store generated pattern', () => {
      const expression: ExpressionWithStoreGeneratedPattern = {};

      const annotation: Edm.Annotation = {
        term: 'Utilities.StoreGeneratedPattern',
        string: 'Identity'
      };

      sut.decorate(expression, annotation);

      expect(expression.StoreGeneratedPattern).toBe(annotation.string);
    });
    it('should use string text value as store generated pattern', () => {
      const expression: ExpressionWithStoreGeneratedPattern = {};

      const annotation: Edm.Annotation = {
        term: 'Utilities.StoreGeneratedPattern',
        string: { text: 'Identity' }
      };

      sut.decorate(expression, annotation);

      expect(expression.StoreGeneratedPattern).toBe((<Edm.Base.Text>annotation.string).text);
    });
  });
});
