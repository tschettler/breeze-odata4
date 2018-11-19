import { ODataError } from '../src/odata-error';

describe('ODataError', () => {
  it('should set message when constructor is called with message', () => {
    const message = 'test error message';
    const sut = new ODataError(message);
    expect(sut.message).toEqual(message);
  });

  it('should create instance of ODataError when constructor is called', () => {
    const sut = new ODataError();
    expect(sut).toBeInstanceOf(ODataError);
  });

  it('should return name when toString is called', () => {
    const name = 'ODataError';
    const sut = new ODataError();
    sut.name = name;
    const result = sut.toString();
    expect(result).toEqual(`${name}: `);
  });

  it('should return name and message when toString is called and message is set', () => {
    const name = 'ODataError';
    const message = 'test error message';
    const sut = new ODataError(message);
    sut.name = name;
    const result = sut.toString();
    expect(result).toEqual(`${name}: ${message}`);
  });

  it('should allow setting message', () => {
    const sut = new ODataError();
    const message = 'test error message';
    sut.message = message;
    expect(sut.message).toEqual(message);
  });

  it('should allow setting body', () => {
    const sut = new ODataError();
    const body = 'test body';
    sut.body = body;
    expect(sut.body).toEqual(body);
  });

  it('should allow setting stackTrace', () => {
    const sut = new ODataError();
    const stack = 'test stack trace';
    sut.stack = stack;
    expect(sut.stack).toEqual(stack);
  });

  it('should allow setting statusText', () => {
    const sut = new ODataError();
    const statusText = 'OK';
    sut.statusText = statusText;
    expect(sut.statusText).toEqual(statusText);
  });

  it('should allow setting status', () => {
    const sut = new ODataError();
    const status = 400;
    sut.status = status;
    expect(sut.status).toEqual(status);
  });

  it('should allow setting url', () => {
    const sut = new ODataError();
    const url = 'http://test.com';
    sut.url = url;
    expect(sut.url).toEqual(url);
  });
});
