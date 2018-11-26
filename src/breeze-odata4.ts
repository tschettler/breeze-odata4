import { config, core, DataType, Validator } from 'breeze-client';
import { OData4UriBuilder } from './breeze-odata4-uriBuilder';
import { OData4DataService } from './breeze-odata4-dataService';
import { ClassRegistry } from './class-registry';
import { AnnotationAdapter, NavigationAdapter } from './adapters/adapters';
import {
  CustomDecorator,
  DescriptionDecorator,
  DisplayNameDecorator,
  PublicationDecorator,
  StoreGeneratedPatternDecorator,
  ValidatorDecorator
} from './decorators/decorators';
import { Utilities } from './utilities';

export class BreezeOData4 {
  private static isConfigured = false;

  public static configure(initialize: boolean = true): void {
    if (!this.isConfigured) {
      OData4UriBuilder.register();
      OData4DataService.register();

      BreezeOData4.fixODataFormats();
      BreezeOData4.registerClasses();

      this.isConfigured = true;
    }

    if (initialize) {
      config.initializeAdapterInstance('uriBuilder', OData4UriBuilder.BreezeAdapterName, true);
      config.initializeAdapterInstance('dataService', OData4DataService.BreezeAdapterName, true);
    }
  }

  private static registerClasses() {
    ClassRegistry.MetadataAdapters.add(AnnotationAdapter, NavigationAdapter);
    ClassRegistry.AnnotationDecorators.add(
      CustomDecorator,
      DescriptionDecorator,
      DisplayNameDecorator,
      PublicationDecorator,
      StoreGeneratedPatternDecorator,
      ValidatorDecorator
    );
  }

  private static fixODataFormats() {
    DataType.Int64.fmtOData = fmtFloat;
    DataType.Decimal.fmtOData = fmtFloat;
    DataType.Double.fmtOData = fmtFloat;
    DataType.DateTime.fmtOData = fmtDateTime;
    DataType.DateTimeOffset.fmtOData = fmtDateTimeOffset;
    DataType.Time.fmtOData = fmtTime;
    DataType.Guid.fmtOData = fmtGuid;

    DataType.Duration = DataType.Time;
    Utilities.dataTypeMap.duration = DataType.Duration;

    // TODO: This may need to be cleaned up later
    DataType.Stream = DataType.addSymbol({
      defaultValue: '',
      parse: DataType.String.parse,
      fmtOData: DataType.String.fmtOData,
      validatorCtor: Validator.string
    });
    Utilities.dataTypeMap.stream = DataType.Stream;

    // TODO: This may need to be cleaned up later
    DataType.TimeOfDay = DataType.addSymbol({
      defaultValue: '00:00',
      parse: DataType.String.parse,
      fmtOData: DataType.String.fmtOData,
      validatorCtor: Validator.string
    });
    Utilities.dataTypeMap.timeofday = DataType.TimeOfDay;

    function fmtFloat(val: any): any {
      if (val === null) {
        return null;
      }

      if (typeof val === 'string') {
        val = parseFloat(val);
      }

      return val;
    }

    function fmtDateTime(val: any): any {
      if (!val) {
        return null;
      }

      try {
        return val.toISOString();
      } catch (e) {
        throwError('\'%1\' is not a valid dateTime', val);
      }
    }

    function fmtDateTimeOffset(val: any): any {
      if (!val) {
        return null;
      }

      try {
        return val.toISOString();
      } catch (e) {
        throwError('\'%1\' is not a valid dateTimeOffset', val);
      }
    }

    function fmtTime(val: any): any {
      if (!val) {
        return null;
      }

      if (!core.isDuration(val)) {
        throwError('\'%1\' is not a valid ISO 8601 duration', val);
      }

      return val;
    }

    function fmtGuid(val: any): any {
      if (!val) {
        return null;
      }

      if (!core.isGuid(val)) {
        throwError('\'%1\' is not a valid guid', val);
      }

      return val;
    }

    function throwError(msg: string, val: any): void {
      msg = core.formatString(msg, val);
      throw new Error(msg);
    }
  }
}
