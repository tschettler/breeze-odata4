import { Edm } from 'ts-odatajs';

import { BreezeOData4 } from '../../src/breeze-odata4';
import { ExpressionWithPublication, PublicationDecorator } from '../../src/decorators/publication-decorator';

let sut: PublicationDecorator;

describe('PublicationDecorator', () => {
  BreezeOData4.configure({ initializeAdapters: false });

  beforeEach(() => {
    sut = new PublicationDecorator();
  });

  describe('canDecorate', () => {
    it('should return true when annotation term contains Publication', () => {
      const annotation: Edm.Annotation = {
        term: 'Org.OData.Publication.V1.Value'
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeTruthy();
    });

    it('should return false when annotation term does not contain Publication', () => {
      const annotation: Edm.Annotation = {
        term: 'Org.OData.Publication.x.Value'
      };

      const result = sut.canDecorate(annotation);

      expect(result).toBeFalsy();
    });
  });

  describe('decorate', () => {
    it('should not decorate without path', () => {
      const expression: ExpressionWithPublication = {};

      const annotation: Edm.Annotation = {
        term: 'Org.OData.Publication.V1.',
        string: 'Bar'
      };

      sut.decorate(expression, annotation);

      expect(expression.publication).toBeUndefined();
    });

    it('should decorate simple path', () => {
      const expression: ExpressionWithPublication = {};

      const annotation: Edm.Annotation = {
        term: 'Org.OData.Publication.V1.publisherName',
        string: 'Bar'
      };

      sut.decorate(expression, annotation);

      expect(expression.publication.publisherName).toBe(annotation.string);
    });

    it('should handle decorating with multiple annotations', () => {
      const expression: ExpressionWithPublication = {};

      const annotation: Edm.Annotation = {
        term: 'Org.OData.Publication.V1.lastModified',
        date: '2018-01-01'
      };

      const annotation2: Edm.Annotation = {
        term: 'Org.OData.Publication.V1.publisherName',
        string: 'Testing'
      };

      sut.decorate(expression, annotation);
      sut.decorate(expression, annotation2);

      expect(expression.publication.lastModified.toString()).toBe(annotation.date);
      expect(expression.publication.publisherName).toBe(annotation2.string);
    });
  });
});
