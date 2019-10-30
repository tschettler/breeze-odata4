import { ComplexType, DataType, EntityType, MetadataStore } from 'breeze-client';
import { Edm, Edmx } from 'ts-odatajs';

import { Utilities } from '../src/utilities';
import { BreezeOData4 } from './../src/breeze-odata4';

describe('Utilities', () => {
  BreezeOData4.configure(false);

  const jsonMetadata = require('./breeze_metadata.json');
  const metadataStore = new MetadataStore();
  metadataStore.importMetadata(jsonMetadata);

  const personEntityType: Edm.EntityType = {
    name: 'Person'
  };
  const addressComplexType: Edm.ComplexType = {
    name: 'Address'
  };

  const unmappedType: Edm.ComplexType = {
    name: 'Unmapped'
  };

  const schema: Edm.Schema = {
    namespace: 'UnitTesting',
    entityContainer: {
      name: 'Default',
      entitySet: []
    },
    entityType: [personEntityType],
    complexType: [addressComplexType]
  };
  let metadata: Edmx.Edmx;

  describe('getDataType', () => {
    beforeEach(() => {
      metadata = {
        version: '4.0',
        dataServices: {
          schema: [schema]
        }
      };
    });

    it('should return DataType.string for an unmapped type.', () => {
      const type = 'animal';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.String);
    });

    it('should return DataType.Binary for "binary".', () => {
      const type = 'binary';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.Binary);
    });

    it('should return DataType.Boolean for "bool".', () => {
      const type = 'bool';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.Boolean);
    });

    it('should return DataType.DateTimeOffset for "date".', () => {
      const type = 'date';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.DateTimeOffset);
    });

    it('should return DataType.DateTimeOffset for "datetimeoffset".', () => {
      const type = 'datetimeoffset';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.DateTimeOffset);
    });

    it('should return DataType.Decimal for "decimal".', () => {
      const type = 'decimal';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.Decimal);
    });

    it('should return DataType.Duration for "duration".', () => {
      const type = 'duration';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType['Duration']);
    });

    it('should return DataType.Double for "float".', () => {
      const type = 'float';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.Double);
    });

    it('should return DataType.Guid for "guid".', () => {
      const type = 'guid';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.Guid);
    });

    it('should return DataType.Int64 for "int".', () => {
      const type = 'int';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.Int64);
    });

    it('should return DataType.Single for "single".', () => {
      const type = 'single';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.Single);
    });

    it('should return DataType.Stream for "stream".', () => {
      const type = 'stream';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType['Stream']);
    });

    it('should return DataType.String for "string".', () => {
      const type = 'string';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.String);
    });

    it('should return DataType.TimeOfDay for "timeofday".', () => {
      const type = 'timeofday';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType['TimeOfDay']);
    });
  });

  describe('getEdmTypeFromTypeName', () => {
    it('should return the entityType for an entity type name', () => {
      const name = `${schema.namespace}.${personEntityType.name}`;
      const result = Utilities.getEdmTypeFromTypeName(metadata, name);
      expect(result).toEqual(personEntityType);
    });

    it('should return the correct complexType for a complex type name', () => {
      const name = `${schema.namespace}.${addressComplexType.name}`;
      const result = Utilities.getEdmTypeFromTypeName(metadata, name);
      expect(result).toEqual(addressComplexType);
    });

    it('should return null if the type is not found', () => {
      const name = `${schema.namespace}.unknown`;
      const result = Utilities.getEdmTypeFromTypeName(metadata, name);
      expect(result).toBeNull();
    });

    it('should return null if the name is not fully qualified', () => {
      const name = personEntityType.name;
      const result = Utilities.getEdmTypeFromTypeName(metadata, name);
      expect(result).toBeNull();
    });
  });

  describe('adaptComplexType', () => {
    it('should return a ComplexType if exists', () => {
      const result = Utilities.adaptComplexType(metadataStore, addressComplexType);
      expect(result).toBeInstanceOf(ComplexType);
    });

    it('should return null if not exists', () => {
      const result = Utilities.adaptComplexType(metadataStore, unmappedType);
      expect(result).toBeNull();
    });
  });

  describe('adaptEntityType', () => {
    it('should return an EntityType if exists', () => {
      const result = Utilities.adaptEntityType(metadataStore, personEntityType);
      expect(result).toBeInstanceOf(EntityType);
    });

    it('should return null if not exists', () => {
      const result = Utilities.adaptEntityType(metadataStore, unmappedType);
      expect(result).toBeNull();
    });
  });

  describe('adaptStructuralType', () => {
    it('should return the correct entityType if exists', () => {
      const result = Utilities.adaptStructuralType(metadataStore, personEntityType);
      expect(result.shortName).toEqual(personEntityType.name);
    });

    it('should return the correct complexType if exists', () => {
      const result = Utilities.adaptStructuralType(metadataStore, addressComplexType);
      expect(result.shortName).toEqual(addressComplexType.name);
    });

    it('should return null if not exists', () => {
      const result = Utilities.adaptStructuralType(metadataStore, unmappedType);
      expect(result).toBeNull();
    });
  });

  describe('getInvokableEntries', () => {
    it('should return empty if schema contains no items', () => {
      const result = Utilities.getInvokableEntries(metadata, metadataStore, () => []);
      expect(result).toHaveLength(0);
    });

    it('should return one item if schema contains one item', () => {
      const item: Edm.Action = { name: 'TestAction' };
      const result = Utilities.getInvokableEntries(metadata, metadataStore, () => [item]);
      expect(result).toHaveLength(1);
    });

    it('should set config to item', () => {
      const item: Edm.Action = { name: 'TestAction' };
      const result = Utilities.getInvokableEntries(metadata, metadataStore, () => [item]);
      expect(result[0].config).toEqual(item);
    });

    it('should return items from multiple schemas', () => {
      const item: Edm.Action = { name: 'TestAction' };
      metadata.dataServices.schema.push(<Edm.Schema>{});
      const result = Utilities.getInvokableEntries(metadata, metadataStore, () => [item]);
      expect(result).toHaveLength(2);
    });
  });

  describe('getActions', () => {
    it('should return empty if schema contains no items', () => {
      const result = Utilities.getActions(metadata, metadataStore);
      expect(result).toHaveLength(0);
    });

    it('should return one item if schema contains one item', () => {
      const item: Edm.Action = { name: 'TestAction' };
      metadata.dataServices.schema[0].action = [item];
      const result = Utilities.getActions(metadata, metadataStore);
      expect(result).toHaveLength(1);
    });
  });

  describe('getFunctions', () => {
    it('should return empty if schema contains no items', () => {
      const result = Utilities.getFunctions(metadata, metadataStore);
      expect(result).toHaveLength(0);
    });

    it('should return one item if schema contains one item', () => {
      const item: Edm.Function = { name: 'TestFunction' };
      metadata.dataServices.schema[0].function = [item];
      const result = Utilities.getFunctions(metadata, metadataStore);
      expect(result).toHaveLength(1);
    });
  });

  describe('getInvokableUrl', () => {
    it('should return unbound path for unbound action', () => {
      const item: Edm.Action = { name: 'TestAction' };
      const result = Utilities.getInvokableUrl(metadata, metadataStore, item, schema.namespace);
      expect(result).toEqual(`${schema.namespace}.${item.name}`);
    });

    it('should return bound path for bound action', () => {
      const item: Edm.Action = {
        name: 'TestAction',
        isBound: 'true',
        parameter: [<Edm.Parameter>{ type: `${schema.namespace}.${personEntityType.name}` }]
      };
      const result = Utilities.getInvokableUrl(metadata, metadataStore, item, schema.namespace);
      const breezeType = Utilities.adaptEntityType(metadataStore, personEntityType);

      expect(result).toEqual(`${breezeType.defaultResourceName}/${schema.namespace}.${item.name}`);
    });

    it('should return unbound path for bound action with no breeze type', () => {
      const animalEntityType = <Edm.EntityType>{ name: 'Animal' };
      schema.entityType.push(animalEntityType);
      const item: Edm.Action = {
        name: 'TestAction',
        isBound: 'true',
        parameter: [<Edm.Parameter>{ type: `${schema.namespace}.${animalEntityType.name}` }]
      };
      const result = Utilities.getInvokableUrl(metadata, metadataStore, item, schema.namespace);

      expect(result).toEqual(`${schema.namespace}.${item.name}`);
    });
  });
});
