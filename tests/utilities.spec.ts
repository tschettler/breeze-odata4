import { DataType } from 'breeze-client';
import { Edmx, Edm } from 'ts-odatajs';
import { Utilities } from '../src/utilities';

describe('Utilities', () => {
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


    const personEntityType: Edm.EntityType = {
      name: 'Person'
    };
    const addressComplexType: Edm.ComplexType = {
      name: 'Address'
    };
    const schema: Edm.Schema = {
      namespace: 'UnitTesting',
      entityContainer: {
        name: 'Default',
        entitySet: []
      },
      entityType: [
        personEntityType
      ],
      complexType: [
        addressComplexType
      ]
    };
    const metadata: Edmx.Edmx = {
      version: '4.0',
      dataServices: {
        schema: [schema]
      }
    };

    it('should return the entityType for an entity type name', () => {
      const result = Utilities.getEdmTypeFromTypeName(metadata, `${schema.namespace}.${personEntityType.name}`);
      expect(result).toEqual(personEntityType);
    });

    it('should return the correct complexType for a complex type name', () => {
      const result = Utilities.getEdmTypeFromTypeName(metadata, `${schema.namespace}.${addressComplexType.name}`);
      expect(result).toEqual(addressComplexType);
    });

    it('should return null if the type is not found', () => {
      const result = Utilities.getEdmTypeFromTypeName(metadata, `${schema.namespace}.unknown`);
      expect(result).toBeNull();
    });

    it('should return null if the name is not fully qualified', () => {
      const result = Utilities.getEdmTypeFromTypeName(metadata, personEntityType.name);
      expect(result).toBeNull();
    });

  });
});
