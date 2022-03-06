import { config } from 'breeze-client';

import * as metadataAdapters from './adapters';
import { OData4BatchAjaxAdapter, OData4JsonAjaxAdapter } from './ajax-adapters';
import { OData4DataServiceAdapter } from './breeze-odata4-dataService-adapter';
import { BreezeOData4Options, DefaultOptions } from './breeze-odata4-options';
import { OData4UriBuilder } from './breeze-odata4-uriBuilder';
import { ClassRegistry } from './class-registry';
import * as datatypeSetups from './datatypes/setups';
import * as annotationDecorators from './decorators';

/**
 * @classdesc Intializes the breeze OData4 configuration.
 */
export class BreezeOData4 {
  private static isConfigured = false;

  /**
   * Configures breeze OData4.
   * @param [options] The OData4 initialization options.
   */
  public static configure(options?: Partial<BreezeOData4Options>): void {
    const opts: BreezeOData4Options = { ...DefaultOptions, ...(options || {}) };

    if (!this.isConfigured) {
      OData4UriBuilder.register();
      OData4DataServiceAdapter.register();
      opts.useBatchSave ? OData4BatchAjaxAdapter.register() : OData4JsonAjaxAdapter.register();

      metadataAdapters.NavigationAdapter.allowManyToMany = opts.allowManyToManyRelationships;
      metadataAdapters.NavigationAdapter.foreignKeyConventions = [
        ...opts.foreignKeyConventions,
        ...metadataAdapters.NavigationAdapter.foreignKeyConventions
      ];
      metadataAdapters.NavigationAdapter.inferPartner = opts.inferNavigationPropertyPartner;
      metadataAdapters.NavigationAdapter.inferConstraints = opts.inferReferentialConstraints;

      BreezeOData4.registerClasses(opts);
      BreezeOData4.setupDataTypes();

      this.isConfigured = true;
    }

    if (opts.initializeAdapters) {
      const ajaxAdapterName = opts.useBatchSave ? OData4BatchAjaxAdapter.BreezeAdapterName : OData4JsonAjaxAdapter.BreezeAdapterName;
      config.initializeAdapterInstance('ajax', ajaxAdapterName, true);
      config.initializeAdapterInstance('uriBuilder', OData4UriBuilder.BreezeAdapterName, true);
      const ds = config.initializeAdapterInstance('dataService', OData4DataServiceAdapter.BreezeAdapterName, true) as OData4DataServiceAdapter;
      ds.failOnSaveError = opts.failOnSaveError;
      ds.metadataAcceptHeader = opts.metadataAcceptHeader;
    }
  }

  /**
   * Allows reconfiguring breeze OData4.
   */
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
