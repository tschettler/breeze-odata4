import { config, HttpResponse } from 'breeze-client';
import { AjaxConfig } from 'breeze-client/src/interface-registry';
import { Batch, Edmx, HttpOData, oData } from 'ts-odatajs';

import { ODataHttpClient } from '../odata-http-client';
import { OData4AjaxAdapter } from './breeze-odata4-ajax-adapter';

/**
 * OData4 ajax adapter that allows batch saving. This is the default implementation.
 */
export class OData4BatchAjaxAdapter extends OData4AjaxAdapter {

  /**
   * The breeze adapter name.
   */
  public static BreezeAdapterName = 'OData4Batch';

  public name: string = OData4BatchAjaxAdapter.BreezeAdapterName;

  /**
   * Registers the OData4 data service as a `dataService` breeze interface.
   */
  public static register() {
    config.registerAdapter('ajax', OData4BatchAjaxAdapter);
  }

  public ajax(ajaxConfig: AjaxConfig, httpClient?: ODataHttpClient, metadata?: Edmx.Edmx): void {

    const headers = { ...this.defaultSettings?.headers, ...ajaxConfig.headers };
    const batchRequest = ajaxConfig.data as Batch.BatchRequest;

    oData.request(
      {
        method: ajaxConfig.type,
        requestUri: ajaxConfig.url,
        headers,
        data: batchRequest
      },
      (data: Batch.BatchResponse, response: HttpOData.Response) => {
        const httpResponse: HttpResponse = {
          error: null,
          ...response,
          config: ajaxConfig,
          data,
          getHeaders: (name: string) => response.headers[name],
          status: Number(response.statusCode)
        };

        ajaxConfig.success(httpResponse);
      },
      err => ajaxConfig.error(err as any),
      oData.batch.batchHandler,
      httpClient,
      metadata
    );
  }
}
