import { Utilities } from './../src/utilities';
import { config, DataType, DataTypeSymbol } from 'breeze-client';
import { BreezeOData4 } from './../src/breeze-odata4';
import { ClassRegistry } from '../src/class-registry';
import { AnnotationAdapter } from '../src/adapters/adapters';
import { OData4UriBuilder } from '../src/breeze-odata4-uriBuilder';
import { OData4DataService } from '../src/breeze-odata4-dataService';
import { AnnotationDecorator } from '../src/decorators/decorators';

describe('BreezeOData4', () => {
  it('should register UriBuilder when configure is called', () => {
    BreezeOData4.configure(true);
    const adapter = config.getAdapterInstance('uriBuilder');
    expect(adapter).toBeInstanceOf(OData4UriBuilder);
  });

  it('should register DataService when configure is called', () => {
    BreezeOData4.configure();
    const adapter = config.getAdapterInstance('dataService');
    expect(adapter).toBeInstanceOf(OData4DataService);
  });

  it('should add DataType.Duration when configure is called', () => {
    jest.useFakeTimers();
    BreezeOData4.configure(false);
    jest.runAllTimers();
    const dataType = DataType['Duration'];
    expect(dataType).toEqual(DataType.Time);
    expect(Utilities.dataTypeMap.duration).toEqual(dataType);
  });

  it('should add DataType.Stream when configure is called', () => {
    jest.useFakeTimers();
    BreezeOData4.configure(false);
    jest.runAllTimers();
    const dataType = DataType['Stream'];
    expect(dataType).toBeTruthy();
    expect(Utilities.dataTypeMap.stream).toEqual(dataType);
  });

  it('should add DataType.TimeOfDay when configure is called', () => {
    jest.useFakeTimers();
    BreezeOData4.configure(false);
    jest.runAllTimers();
    const dataType = DataType['TimeOfDay'];
    expect(dataType).toBeTruthy();
    expect(Utilities.dataTypeMap.timeofday).toEqual(dataType);
  });

  it('should register classes when configure is called', () => {
    BreezeOData4.configure(false);
    expect(ClassRegistry.AnnotationDecorators.types.length).toBeGreaterThan(0);
    expect(ClassRegistry.MetadataAdapters.types.length).toBeGreaterThan(0);
  });

  it('should return null when calling Int64.fmtOData for null number', () => {
    BreezeOData4.configure(false);

    const result = DataType.Int64.fmtOData(null);

    expect(result).toBeNull();
  });

  it('should return null when calling Int64.fmtOData for undefined', () => {
    BreezeOData4.configure(false);

    const result = DataType.Int64.fmtOData(undefined);

    expect(result).toBeNull();
  });

  it('should return number when calling Int64.fmtOData for numeric string', () => {
    BreezeOData4.configure(false);

    const result = DataType.Int64.fmtOData('123.45');

    expect(result).toEqual(123.45);
  });


  it('should return value when calling Int64.fmtOData for non-string', () => {
    BreezeOData4.configure(false);

    const result = DataType.Int64.fmtOData(123.45);

    expect(result).toBe(123.45);
  });

  it('should return null when calling DateTime.fmtOData for null', () => {
    BreezeOData4.configure(false);

    const result = DataType.DateTime.fmtOData(null);

    expect(result).toBeNull();
  });

  it('should return null when calling DateTime.fmtOData for undefined', () => {
    BreezeOData4.configure(false);

    const result = DataType.DateTime.fmtOData(undefined);

    expect(result).toBeNull();
  });

  it('should return ISO date string when calling DateTime.fmtOData for date', () => {
    BreezeOData4.configure(false);

    const input = new Date();

    const result = DataType.DateTime.fmtOData(input);

    expect(result).toEqual(input.toISOString());
  });

  it('should throw exception when calling DateTime.fmtOData with non-date', () => {
    BreezeOData4.configure(false);

    expect(() => {
      DataType.DateTime.fmtOData(123.45);
    }).toThrowError('is not a valid dateTime');
  });

  it('should return null when calling DateTimeOffset.fmtOData for null', () => {
    BreezeOData4.configure(false);

    const result = DataType.DateTimeOffset.fmtOData(null);

    expect(result).toBeNull();
  });

  it('should return null when calling DateTimeOffset.fmtOData for undefined', () => {
    BreezeOData4.configure(false);

    const result = DataType.DateTimeOffset.fmtOData(undefined);

    expect(result).toBeNull();
  });

  it('should return ISO date string when calling DateTimeOffset.fmtOData for date', () => {
    BreezeOData4.configure(false);

    const input = new Date();

    const result = DataType.DateTimeOffset.fmtOData(input);

    expect(result).toEqual(input.toISOString());
  });

  it('should throw exception when calling DateTimeOffset.fmtOData with non-date', () => {
    BreezeOData4.configure(false);

    expect(() => {
      DataType.DateTimeOffset.fmtOData(123.45);
    }).toThrowError('is not a valid dateTimeOffset');
  });

  it('should return null when calling Time.fmtOData for null', () => {
    BreezeOData4.configure(false);

    const result = DataType.Time.fmtOData(null);

    expect(result).toBeNull();
  });

  it('should return null when calling Time.fmtOData for undefined', () => {
    BreezeOData4.configure(false);

    const result = DataType.Time.fmtOData(undefined);

    expect(result).toBeNull();
  });

  it('should return value when calling Time.fmtOData for duration', () => {
    BreezeOData4.configure(false);

    const input = 'P1Y2M10DT2H30M';

    const result = DataType.Time.fmtOData(input);

    expect(result).toEqual(input);
  });

  it('should throw exception when calling Time.fmtOData with non-duration', () => {
    BreezeOData4.configure(false);

    expect(() => {
      DataType.Time.fmtOData(123.45);
    }).toThrowError('is not a valid ISO 8601 duration');
  });

  it('should return null when calling Guid.fmtOData for null', () => {
    BreezeOData4.configure(false);

    const result = DataType.Guid.fmtOData(null);

    expect(result).toBeNull();
  });

  it('should return null when calling Guid.fmtOData for undefined', () => {
    BreezeOData4.configure(false);

    const result = DataType.Guid.fmtOData(undefined);

    expect(result).toBeNull();
  });

  it('should return value when calling Guid.fmtOData for duration', () => {
    BreezeOData4.configure(false);

    const input = 'e6580e89-3f62-4d4f-bf54-5a794391e1bf';

    const result = DataType.Guid.fmtOData(input);

    expect(result).toEqual(input);
  });

  it('should throw exception when calling Guid.fmtOData with non-duration', () => {
    BreezeOData4.configure(false);

    expect(() => {
      DataType.Guid.fmtOData(123.45);
    }).toThrowError('is not a valid guid');
  });

});
