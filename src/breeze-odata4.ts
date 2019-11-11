import { config } from 'breeze-client';
import * as metadataAdapters from './adapters/adapters';
import { OData4DataService } from './breeze-odata4-dataService';
import { BreezeOData4Options, DefaultOptions } from './breeze-odata4-options';
import { OData4UriBuilder } from './breeze-odata4-uriBuilder';
import { ClassRegistry } from './class-registry';
import * as datatypeSetups from './datatypes/setups/datatype-setups';
import * as annotationDecorators from './decorators/decorators';

export class BreezeOData4 {
  private static isConfigured = false;

  public static configure(options?: Partial<BreezeOData4Options>): void {
    const opts: BreezeOData4Options = Object.assign({}, DefaultOptions, options || {});

    if (!this.isConfigured) {
      OData4UriBuilder.register();
      OData4DataService.register();

      metadataAdapters.NavigationAdapter.inferPartner = opts.inferNavigationPropertyPartner;
      metadataAdapters.NavigationAdapter.inferConstraints = opts.inferReferentialConstraints;

      BreezeOData4.registerClasses(opts);
      BreezeOData4.setupDataTypes();

      this.isConfigured = true;
    }

    if (opts.initializeAdapters) {
      config.initializeAdapterInstance('uriBuilder', OData4UriBuilder.BreezeAdapterName, true);
      config.initializeAdapterInstance('dataService', OData4DataService.BreezeAdapterName, true);
    }
  }

  public static reset(): void {
    this.isConfigured = false;
  }

  private static registerClasses(options: BreezeOData4Options) {
    ClassRegistry.AnnotationDecorators.add(...Object.values(annotationDecorators), ...options.annotationDecorators);
    ClassRegistry.DataTypeSetups.add(...Object.values(datatypeSetups), ...options.dataTypeSetups);
    ClassRegistry.MetadataAdapters.add(...Object.values(metadataAdapters), ...options.metadataAdapters);
  }

  private static setupDataTypes(): void {
    const dataTypeSetups = ClassRegistry.DataTypeSetups.get();
    dataTypeSetups.forEach(s => s && s.register());
  }
}
