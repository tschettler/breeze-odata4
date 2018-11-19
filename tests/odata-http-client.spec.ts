import { oData, HttpOData } from 'ts-odatajs';
import { ODataHttpClient } from '../src/odata-http-client';
jest.mock('ts-odatajs');

describe('ODataHttpClient', () => {
  beforeAll(() => {
    const mockRequest = jest.fn();
    jest.mock('ts-odatajs', () => {
      return jest.fn().mockImplementation(() => {
        return {
          oData: {
            net: {
              defaultHttpClient: {
                request: mockRequest
              }
            }
          }
        };
      });
    });
  });
  it('should call defaultHttpClient request when request is called', () => {
    const sut = new ODataHttpClient();

    sut.request(null, null, null);
    expect(oData.net.defaultHttpClient.request).toHaveBeenCalled();
  });
});
