import { Edm, Edmx } from 'ts-odatajs';

import { AnnotationAdapter } from '../../src/adapters';
import { ClassRegistry } from '../../src/class-registry';
import { DisplayNameDecorator } from '../../src/decorators';
import { AnnotationDecorator } from '../../src/decorators/annotation-decorator';
import { TargetNotFound } from './../../src/adapters/annotation-adapter';

let sut: AnnotationAdapter;
let metadata: Edmx.Edmx;

const MockDecorator = jest.fn<AnnotationDecorator, []>(() => ({
  canDecorate: () => true,
  decorate: jest.fn()
}));

const personEntityType: Edm.EntityType = {
  name: 'Person',
  property: [{ name: 'FirstName', type: 'Edm.String' } as Edm.Property]
};

const schema: Edm.Schema = {
  namespace: 'UnitTesting',
  entityContainer: {
    name: 'Default',
    entitySet: [{ name: 'People', entityType: 'Person' }],
    actionImport: { name: 'Action.Test' }
  },
  entityType: [personEntityType],
  function: { name: 'Function.Test', parameter: null }
} as any;

describe('AnnotationAdapter', () => {
  beforeEach(() => {
    ClassRegistry.AnnotationDecorators.add(DisplayNameDecorator, MockDecorator);
    sut = new AnnotationAdapter();
    schema.annotations = [];
    metadata = {
      version: '4.0',
      dataServices: {
        schema: [schema]
      }
    };
  });

  it('should create instance of AnnotationAdapter when constructor is called', () => {
    expect(sut).toBeInstanceOf(AnnotationAdapter);
  });

  it('should set decorators to registered decorators when constructor is called', () => {
    expect(sut.decorators).toContainEqual(expect.any(DisplayNameDecorator));
  });

  it('should throw error when adapt is called with unknown annotation type', () => {
    schema.annotations.push({ target: 'invalid', term: 'display' } as Edm.Annotations);

    expect(() => {
      sut.adapt(metadata.dataServices);
    }).toThrowError(TargetNotFound);
  });

  it('should not throw error when adapt is called with null annotations', () => {
    schema.annotations = null;

    sut.adapt(metadata.dataServices);
  });

  it('should not throw error when adapt is called with no annotations', () => {
    schema.annotations.push({ target: 'UnitTesting.Person', term: 'display' } as Edm.Annotations);

    sut.adapt(metadata.dataServices);
  });

  it('should call decorate on matching decorator when adapt is called', () => {
    schema.annotations.push({
      target: 'UnitTesting.Person',
      annotation: [
        {
          term: 'test',
          string: 'abc123'
        } as Edm.Annotation
      ]
    } as Edm.Annotations);

    sut.adapt(metadata.dataServices);

    expect(sut.decorators[1].decorate).toHaveBeenCalled();
  });

  it('should succeed with no decorators when adapt is called', () => {
    schema.annotations.push({
      target: 'UnitTesting.Person',
      annotation: [
        {
          term: 'test',
          string: 'abc123'
        } as Edm.Annotation
      ]
    } as Edm.Annotations);

    sut.decorators = [];
    sut.adapt(metadata.dataServices);
  });

  it('should call decorate on matching decorator when adapt is called for a property', () => {
    schema.annotations.push({
      target: 'UnitTesting.Person/FirstName',
      annotation: [
        {
          term: 'display',
          string: 'First Name'
        } as Edm.Annotation
      ]
    } as Edm.Annotations);

    sut.adapt(metadata.dataServices);

    expect(sut.decorators[1].decorate).toHaveBeenCalled();
  });

  it('should call decorate on matching decorator when adapt is called for a entityContainer', () => {
    schema.annotations.push({
      target: 'UnitTesting.Default',
      annotation: [
        {
          term: 'display',
          string: 'Entity Sets'
        } as Edm.Annotation
      ]
    } as Edm.Annotations);

    sut.adapt(metadata.dataServices);

    expect(sut.decorators[1].decorate).toHaveBeenCalled();
  });

  it('should call decorate on matching decorator when adapt is called for a entitySet', () => {
    schema.annotations.push({
      target: 'UnitTesting.Default/People',
      annotation: [
        {
          term: 'display',
          string: 'People'
        } as Edm.Annotation
      ]
    } as Edm.Annotations);

    sut.adapt(metadata.dataServices);

    expect(sut.decorators[1].decorate).toHaveBeenCalled();
  });

  it('should call decorate on matching decorator when adapt is called for a single item', () => {
    schema.annotations.push({
      target: 'UnitTesting.Default/Action.Test',
      annotation: [
        {
          term: 'display',
          string: 'Test action'
        } as Edm.Annotation
      ]
    } as Edm.Annotations);

    sut.adapt(metadata.dataServices);

    expect(sut.decorators[1].decorate).toHaveBeenCalled();
  });

  it('should not call decorate on matching decorator when adapt is called for a non-existent item', () => {
    schema.annotations.push({
      target: 'UnitTesting.Function.Test/Missing',
      annotation: [
        {
          term: 'display',
          string: 'Test action'
        } as Edm.Annotation
      ]
    } as Edm.Annotations);

    expect(() => {
      sut.adapt(metadata.dataServices);
    }).toThrowError(TargetNotFound);

    expect(sut.decorators[1].decorate).not.toHaveBeenCalled();
  });
});
