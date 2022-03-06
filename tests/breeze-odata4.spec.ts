import { config, DataType } from 'breeze-client';

import { OData4BatchAjaxAdapter, OData4JsonAjaxAdapter } from '../src';
import { NavigationAdapter } from '../src/adapters';
import { BreezeOData4 } from '../src/breeze-odata4';
import { OData4DataServiceAdapter } from '../src/breeze-odata4-dataService-adapter';
import { BreezeOData4Options, DefaultOptions } from '../src/breeze-odata4-options';
import { OData4UriBuilder } from '../src/breeze-odata4-uriBuilder';
import { ClassRegistry } from '../src/class-registry';
import { AssociationEndpoint } from '../src/models';

describe('BreezeOData4', () => {
  let options: Partial<BreezeOData4Options>;

  beforeEach(() => {
    BreezeOData4.reset();
    options = { ...DefaultOptions, initializeAdapters: false };
  });

  it('should register UriBuilder when configure is called', () => {
    options.initializeAdapters = true;
    BreezeOData4.configure(options);
    const adapter = config.getAdapterInstance('uriBuilder');
    expect(adapter).toBeInstanceOf(OData4UriBuilder);
  });

  it('should register DataService when configure is called', () => {
    BreezeOData4.configure();
    const adapter = config.getAdapterInstance('dataService');
    expect(adapter).toBeInstanceOf(OData4DataServiceAdapter);
  });

  it('should register batch AjaxAdapter when configure is called', () => {
    BreezeOData4.configure();
    const adapter = config.getAdapterInstance('ajax');
    expect(adapter).toBeInstanceOf(OData4BatchAjaxAdapter);
  });

  it('should register json AjaxAdapter when configure is called with useBatchSave false', () => {
    BreezeOData4.configure({ useBatchSave: false });
    const adapter = config.getAdapterInstance('ajax');
    expect(adapter).toBeInstanceOf(OData4JsonAjaxAdapter);
  });

  it('should allow initializing after configuring', () => {
    BreezeOData4.configure(options);
    options.initializeAdapters = true;
    BreezeOData4.configure(options);
    const ubAdapter = config.getAdapterInstance('uriBuilder');
    expect(ubAdapter).toBeInstanceOf(OData4UriBuilder);
    const dsAdapter = config.getAdapterInstance('dataService');
    expect(dsAdapter).toBeInstanceOf(OData4DataServiceAdapter);
  });

  it('should add DataType.Date when configure is called', () => {
    jest.useFakeTimers();
    BreezeOData4.configure(options);
    jest.runAllTimers();
    const dataType = DataType['Date'];
    expect(dataType).toBeTruthy();
  });

  it('should add DataType.Duration when configure is called', () => {
    jest.useFakeTimers();
    BreezeOData4.configure(options);
    jest.runAllTimers();
    const dataType = DataType['Duration'];
    expect(dataType).toBeTruthy();
  });

  it('should add DataType.Stream when configure is called', () => {
    jest.useFakeTimers();
    BreezeOData4.configure(options);
    jest.runAllTimers();
    const dataType = DataType['Stream'];
    expect(dataType).toBeTruthy();
  });

  it('should add DataType.TimeOfDay when configure is called', () => {
    jest.useFakeTimers();
    BreezeOData4.configure(options);
    jest.runAllTimers();
    const dataType = DataType['TimeOfDay'];
    expect(dataType).toBeTruthy();
  });

  it('should register classes when configure is called', () => {
    BreezeOData4.configure(options);
    expect(ClassRegistry.AnnotationDecorators.types.length).toBeGreaterThan(0);
    expect(ClassRegistry.MetadataAdapters.types.length).toBeGreaterThan(0);
  });

  it('should return null when calling Int64.fmtOData for null number', () => {
    BreezeOData4.configure(options);

    const result = DataType.Int64.fmtOData(null);

    expect(result).toBeNull();
  });

  it('should return null when calling Int64.fmtOData for undefined', () => {
    BreezeOData4.configure(options);

    const result = DataType.Int64.fmtOData(undefined);

    expect(result).toBeNull();
  });

  it('should return number when calling Int64.fmtOData for numeric string', () => {
    BreezeOData4.configure(options);

    const result = DataType.Int64.fmtOData('123.45');

    expect(result).toEqual(123.45);
  });


  it('should return value when calling Int64.fmtOData for non-string', () => {
    BreezeOData4.configure(options);

    const result = DataType.Int64.fmtOData(123.45);

    expect(result).toBe(123.45);
  });

  it('should return null when calling DateTime.fmtOData for null', () => {
    BreezeOData4.configure(options);

    const result = DataType.DateTime.fmtOData(null);

    expect(result).toBeNull();
  });

  it('should return null when calling DateTime.fmtOData for undefined', () => {
    BreezeOData4.configure(options);

    const result = DataType.DateTime.fmtOData(undefined);

    expect(result).toBeNull();
  });

  it('should return ISO date string when calling DateTime.fmtOData for date', () => {
    BreezeOData4.configure(options);

    const input = new Date();

    const result = DataType.DateTime.fmtOData(input);

    expect(result).toEqual(input.toISOString());
  });

  it('should throw exception when calling DateTime.fmtOData with non-date', () => {
    BreezeOData4.configure(options);

    expect(() => {
      DataType.DateTime.fmtOData(123.45);
    }).toThrowError('is not a valid DateTime');
  });

  it('should return null when calling DateTimeOffset.fmtOData for null', () => {
    BreezeOData4.configure(options);

    const result = DataType.DateTimeOffset.fmtOData(null);

    expect(result).toBeNull();
  });

  it('should return null when calling DateTimeOffset.fmtOData for undefined', () => {
    BreezeOData4.configure(options);

    const result = DataType.DateTimeOffset.fmtOData(undefined);

    expect(result).toBeNull();
  });

  it('should return ISO date string when calling DateTimeOffset.fmtOData for date', () => {
    BreezeOData4.configure(options);

    const input = new Date();

    const result = DataType.DateTimeOffset.fmtOData(input);

    expect(result).toEqual(input.toISOString());
  });

  it('should throw exception when calling DateTimeOffset.fmtOData with non-date', () => {
    BreezeOData4.configure(options);

    expect(() => {
      DataType.DateTimeOffset.fmtOData(123.45);
    }).toThrowError('is not a valid DateTimeOffset');
  });

  it('should return null when calling Time.fmtOData for null', () => {
    BreezeOData4.configure(options);

    const result = DataType.Time.fmtOData(null);

    expect(result).toBeNull();
  });

  it('should return null when calling Time.fmtOData for undefined', () => {
    BreezeOData4.configure(options);

    const result = DataType.Time.fmtOData(undefined);

    expect(result).toBeNull();
  });

  it('should return value when calling Time.fmtOData for duration', () => {
    BreezeOData4.configure(options);

    const input = 'P1Y2M10DT2H30M';

    const result = DataType.Time.fmtOData(input);

    expect(result).toEqual(input);
  });

  it('should throw exception when calling Time.fmtOData with non-duration', () => {
    BreezeOData4.configure(options);

    expect(() => {
      DataType.Time.fmtOData(123.45);
    }).toThrowError('is not a valid ISO 8601 duration');
  });

  it('should return null when calling Guid.fmtOData for null', () => {
    BreezeOData4.configure(options);

    const result = DataType.Guid.fmtOData(null);

    expect(result).toBeNull();
  });

  it('should return null when calling Guid.fmtOData for undefined', () => {
    BreezeOData4.configure(options);

    const result = DataType.Guid.fmtOData(undefined);

    expect(result).toBeNull();
  });

  it('should return value when calling Guid.fmtOData for duration', () => {
    BreezeOData4.configure(options);

    const input = 'e6580e89-3f62-4d4f-bf54-5a794391e1bf';

    const result = DataType.Guid.fmtOData(input);

    expect(result).toEqual(input);
  });

  it('should throw exception when calling Guid.fmtOData with non-duration', () => {
    BreezeOData4.configure(options);

    expect(() => {
      DataType.Guid.fmtOData(123.45);
    }).toThrowError('is not a valid Guid');
  });

  describe('foreignKeyConventions', () => {
    it('should add foreign key conventions', () => {
      const convention = (endpoint: AssociationEndpoint, suffix: string) => `${endpoint.propertyName}Test`;
      options.foreignKeyConventions.push(convention);
      BreezeOData4.configure(options);
      expect(NavigationAdapter.foreignKeyConventions).toContain(convention);
    });
  });

  describe('inferNavigationPropertyPartner', () => {
    it('should set NavigationAdapter.inferParter to true', () => {
      BreezeOData4.configure(options);
      expect(NavigationAdapter.inferPartner).toBeTruthy();
    });

    it('should set NavigationAdapter.inferParter to false', () => {
      options.inferNavigationPropertyPartner = false;
      BreezeOData4.configure(options);
      expect(NavigationAdapter.inferPartner).toBeFalsy();
    });
  });

  describe('inferReferentialConstraints', () => {
    it('should set NavigationAdapter.inferConstraints to true', () => {
      BreezeOData4.configure(options);
      expect(NavigationAdapter.inferConstraints).toBeTruthy();
    });

    it('should set NavigationAdapter.inferConstraints to false', () => {
      options.inferReferentialConstraints = false;
      BreezeOData4.configure(options);
      expect(NavigationAdapter.inferConstraints).toBeFalsy();
    });
  });

});
