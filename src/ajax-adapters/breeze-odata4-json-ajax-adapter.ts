import { config, HttpResponse } from 'breeze-client';
import { AjaxConfig } from 'breeze-client/src/interface-registry';
import { Batch, Edmx, HttpOData, oData } from 'ts-odatajs';

import { ODataHttpClient } from '../odata-http-client';
import { OData4AjaxAdapter } from './breeze-odata4-ajax-adapter';

/**
 * OData4 ajax adapter that saves each change individually.
 */
export class OData4JsonAjaxAdapter extends OData4AjaxAdapter {

  /**
   * The breeze adapter name.
   */
  public static BreezeAdapterName = 'OData4Json';

  public name: string = OData4JsonAjaxAdapter.BreezeAdapterName;

  /**
   * Registers the OData4 data service as a `dataService` breeze interface.
   */
  public static register() {
    config.registerAdapter('ajax', OData4JsonAjaxAdapter);
  }

  public ajax(ajaxConfig: AjaxConfig, httpClient?: ODataHttpClient, metadata?: Edmx.Edmx): void {
    const batchRequest = (ajaxConfig.data || {}) as Batch.BatchRequest;

    const changeRequests = (batchRequest.__batchRequests || [])
      .flatMap(br => br.__changeRequests || []);

    const promises = changeRequests.map(c => {
      const result = new Promise<Batch.ChangeResponse>((resolve, reject) => {
        oData.request(
          {
            method: c.method,
            requestUri: c.requestUri,
            headers: c.headers,
            data: c.data
          },
          (_data: any, response: HttpOData.Response) => resolve(response),
          err => reject(err),
          oData.jsonHandler,
          httpClient,
          metadata
        );
      });

      return result;
    });

    Promise.allSettled(promises)
      .then(responses => {
        const changeResponses = responses.filter(x => x.status === 'fulfilled')
          .map((x: PromiseFulfilledResult<Batch.ChangeResponse>) => x.value);

        const failedResponses = responses.filter(x => x.status === 'rejected')
          .map((x: PromiseRejectedResult) => {
            const error = (x.reason as HttpOData.Error);
            const result: Batch.FailedResponse = {
              message: error.message,
              response: error.response
            };

            return result;
          });

        const batchResponse: Batch.BatchResponse = {
          __batchResponses: [{
            __changeResponses: [...changeResponses, ...failedResponses]
          }]
        };

        const httpResponse: HttpResponse = {
          config: ajaxConfig,
          data: batchResponse,
          error: null,
          getHeaders: (name: string) => this.defaultSettings?.headers[name],
          status: 200
        };

        ajaxConfig.success(httpResponse);
      })
      .catch(reason => ajaxConfig.error(reason));
  }
}
