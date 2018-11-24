import {
  DataType,
  EntityType,
  MetadataStore,
  AutoGeneratedKeyType,
  ComplexType
} from 'breeze-client';
import { Edmx, Edm } from 'ts-odatajs';
import { Utilities } from '../src/utilities';

describe('Utilities', () => {
  const jsonMetadata = require('./metadata.json');
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
  const metadata: Edmx.Edmx = {
    version: '4.0',
    dataServices: {
      schema: [schema]
    }
  };

  describe('getDataType', () => {
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
      // TODO: expect(result).toEqual(DataType.Duration);
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

    it('should return DataType.String for "string".', () => {
      const type = 'string';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.String);
    });

    it('should return DataType.Single for "single".', () => {
      const type = 'single';

      const result = Utilities.getDataType(type);
      expect(result).toEqual(DataType.Single);
    });

    it('should return DataType.TimeOfDay for "timeofday".', () => {
      const type = 'timeofday';

      const result = Utilities.getDataType(type);
      // TODO: expect(result).toEqual(DataType.TimeOfDay);
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
      const result = Utilities.adaptComplexType(
        metadataStore,
        addressComplexType
      );
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
      const result = Utilities.adaptStructuralType(
        metadataStore,
        personEntityType
      );
      expect(result.shortName).toEqual(personEntityType.name);
    });

    it('should return the correct complexType if exists', () => {
      const result = Utilities.adaptStructuralType(
        metadataStore,
        addressComplexType
      );
      expect(result.shortName).toEqual(addressComplexType.name);
    });

    it('should return null if not exists', () => {
      const result = Utilities.adaptStructuralType(metadataStore, unmappedType);
      expect(result).toBeNull();
    });
  });
});