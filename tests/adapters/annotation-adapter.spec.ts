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
  property: [<Edm.Property>{ name: 'FirstName', type: 'Edm.String' }]
};

const schema: Edm.Schema = <any>{
  namespace: 'UnitTesting',
  entityContainer: {
    name: 'Default',
    entitySet: [{ name: 'People', entityType: 'Person' }],
    actionImport: { name: 'Action.Test' }
  },
  entityType: [personEntityType],
  function: { name: 'Function.Test', parameter: null }
};

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
    schema.annotations.push(<Edm.Annotations>{ target: 'invalid', term: 'display' });

    expect(() => {
      sut.adapt(metadata.dataServices);
    }).toThrowError(TargetNotFound);
  });

  it('should not throw error when adapt is called with null annotations', () => {
    schema.annotations = null;

    sut.adapt(metadata.dataServices);
  });

  it('should not throw error when adapt is called with no annotations', () => {
    schema.annotations.push(<Edm.Annotations>{ target: 'UnitTesting.Person', term: 'display' });

    sut.adapt(metadata.dataServices);
  });

  it('should call decorate on matching decorator when adapt is called', () => {
    schema.annotations.push(<Edm.Annotations>{
      target: 'UnitTesting.Person',
      annotation: [
        <Edm.Annotation>{
          term: 'test',
          string: 'abc123'
        }
      ]
    });

    sut.adapt(metadata.dataServices);

    expect(sut.decorators[1].decorate).toHaveBeenCalled();
  });

  it('should succeed with no decorators when adapt is called', () => {
    schema.annotations.push(<Edm.Annotations>{
      target: 'UnitTesting.Person',
      annotation: [
        <Edm.Annotation>{
          term: 'test',
          string: 'abc123'
        }
      ]
    });

    sut.decorators = [];
    sut.adapt(metadata.dataServices);
  });

  it('should call decorate on matching decorator when adapt is called for a property', () => {
    schema.annotations.push(<Edm.Annotations>{
      target: 'UnitTesting.Person/FirstName',
      annotation: [
        <Edm.Annotation>{
          term: 'display',
          string: 'First Name'
        }
      ]
    });

    sut.adapt(metadata.dataServices);

    expect(sut.decorators[1].decorate).toHaveBeenCalled();
  });

  it('should call decorate on matching decorator when adapt is called for a entityContainer', () => {
    schema.annotations.push(<Edm.Annotations>{
      target: 'UnitTesting.Default',
      annotation: [
        <Edm.Annotation>{
          term: 'display',
          string: 'Entity Sets'
        }
      ]
    });

    sut.adapt(metadata.dataServices);

    expect(sut.decorators[1].decorate).toHaveBeenCalled();
  });

  it('should call decorate on matching decorator when adapt is called for a entitySet', () => {
    schema.annotations.push(<Edm.Annotations>{
      target: 'UnitTesting.Default/People',
      annotation: [
        <Edm.Annotation>{
          term: 'display',
          string: 'People'
        }
      ]
    });

    sut.adapt(metadata.dataServices);

    expect(sut.decorators[1].decorate).toHaveBeenCalled();
  });

  it('should call decorate on matching decorator when adapt is called for a single item', () => {
    schema.annotations.push(<Edm.Annotations>{
      target: 'UnitTesting.Default/Action.Test',
      annotation: [
        <Edm.Annotation>{
          term: 'display',
          string: 'Test action'
        }
      ]
    });

    sut.adapt(metadata.dataServices);

    expect(sut.decorators[1].decorate).toHaveBeenCalled();
  });

  it('should not call decorate on matching decorator when adapt is called for a non-existent item', () => {
    schema.annotations.push(<Edm.Annotations>{
      target: 'UnitTesting.Function.Test/Missing',
      annotation: [
        <Edm.Annotation>{
          term: 'display',
          string: 'Test action'
        }
      ]
    });

    expect(() => {
      sut.adapt(metadata.dataServices);
    }).toThrowError(TargetNotFound);

    expect(sut.decorators[1].decorate).not.toHaveBeenCalled();
  });
});
