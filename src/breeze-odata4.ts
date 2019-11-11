import { config } from 'breeze-client';
import * as adapters from './adapters/adapters';
import { OData4DataService } from './breeze-odata4-dataService';
import { OData4UriBuilder } from './breeze-odata4-uriBuilder';
import { ClassRegistry } from './class-registry';
import * as datatypeSetups from './datatypes/setups/datatype-setups';
import * as decorators from './decorators/decorators';

export class BreezeOData4 {
  private static isConfigured = false;

  public static configure(initialize: boolean = true): void {
    if (!this.isConfigured) {
      OData4UriBuilder.register();
      OData4DataService.register();

      BreezeOData4.registerClasses();
      BreezeOData4.setupDataTypes();

      this.isConfigured = true;
    }

    if (initialize) {
      config.initializeAdapterInstance('uriBuilder', OData4UriBuilder.BreezeAdapterName, true);
      config.initializeAdapterInstance('dataService', OData4DataService.BreezeAdapterName, true);
    }
  }

  private static registerClasses() {
    ClassRegistry.AnnotationDecorators.add(...Object.values(decorators));
    ClassRegistry.DataTypeSetups.add(...Object.values(datatypeSetups));
    ClassRegistry.MetadataAdapters.add(...Object.values(adapters));
  }

  private static setupDataTypes(): void {
    const dataTypeSetups = ClassRegistry.DataTypeSetups.get();
    dataTypeSetups.forEach(s => s && s.register());
  }
}
