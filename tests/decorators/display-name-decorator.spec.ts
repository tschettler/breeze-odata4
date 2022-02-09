import { Edm } from 'ts-odatajs';

import { DisplayNameDecorator, ExpressionWithDisplayName } from './../../src/decorators/display-name-decorator';

let sut: DisplayNameDecorator;

describe('DisplayNameDecorator', () => {
  beforeEach(() => {
    sut = new DisplayNameDecorator();
  });

  describe('canDecorate', () => {
    it('should return true when annotation uses display term', () => {
      const annotation: Edm.Annotation = {
        term: 'Org.OData.Display.V1.DisplayName'
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeTruthy();
    });

    it('should return true when annotation term contains DisplayName', () => {
      const annotation: Edm.Annotation = {
        term: 'UnitTesting.DisplayName'
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
    it('should use string value as displayName', () => {
      const expression: ExpressionWithDisplayName = {};

      const annotation: Edm.Annotation = {
        term: 'Org.OData.Display.V1.DisplayName',
        string: 'Test'
      };

      sut.decorate(expression, annotation);

      expect(expression.displayName).toBe(annotation.string);
    });
    it('should use string text value as displayName', () => {
      const expression: ExpressionWithDisplayName = {};

      const annotation: Edm.Annotation = {
        term: 'Org.OData.Display.V1.DisplayName',
        string: { text: 'Test' }
      };

      sut.decorate(expression, annotation);

      expect(expression.displayName).toBe((annotation.string as Edm.Base.Text).text);
    });
  });
});
