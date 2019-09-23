import { ExpressionWithDescription } from '../../dist/types/decorators/description-decorator';
import { DescriptionDecorator } from '../../src/decorators/description-decorator';
import { Edm } from 'ts-odatajs';

let sut: DescriptionDecorator;

describe('DescriptionDecorator', () => {
  beforeEach(() => {
    sut = new DescriptionDecorator();
  });

  describe('canDecorate', () => {
    it('should return true when annotation uses display term', () => {
      const annotation: Edm.Annotation = {
        term: sut.terms[0]
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeTruthy();
    });

    it('should return true when annotation uses core term', () => {
      const annotation: Edm.Annotation = {
        term: sut.terms[1]
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeTruthy();
    });

    it('should return false when annotation term is not description', () => {
      const annotation: Edm.Annotation = {
        term: 'Test'
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeFalsy();
    });
  });

  describe('decorate', () => {
    it('should use string value as description', () => {
      const expression: ExpressionWithDescription = {};

      const annotation: Edm.Annotation = {
        term: sut.terms[0],
        string: 'Test'
      };

      sut.decorate(expression, annotation);

      expect(expression.description).toBe(annotation.string);
    });
    it('should use string text value as description', () => {
      const expression: ExpressionWithDescription = {};

      const annotation: Edm.Annotation = {
        term: sut.terms[0],
        string: { text: 'Test' }
      };

      sut.decorate(expression, annotation);

      expect(expression.description).toBe((<Edm.Base.Text>annotation.string).text);
    });
  });
});
