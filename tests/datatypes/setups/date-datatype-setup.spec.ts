import { DataType } from 'breeze-client';
import { EdmDate } from '../../../src/datatypes/models';

import { DateDataTypeSetup } from '../../../src/datatypes/setups/date-datatype-setup';
import { Utilities } from '../../../src/utilities';

describe('DateDataTypeSetup', () => {
    const sut = new DateDataTypeSetup();

    it('name should be Date', () => {
        expect(sut.name).toBe('Date');
    });

    describe('register', () => {
        beforeAll(() => {
            sut.register();
        });

        it('should be available from DataType', () => {
            expect(DataType[sut.name]).toBeTruthy();
        });

        it('should register with Utilities', () => {
            const type = sut.name.toLowerCase();
            const result = Utilities.getDataType(type);
            expect(result).toEqual(DataType[sut.name]);
        });

        describe('DataType.Date', () => {
            let dataType: DataType;
            beforeEach(() => {
                dataType = DataType['Date'];
            });

            describe('fmtOData', () => {
                it('should return null when calling fmtOData for null', () => {
                    const result = dataType.fmtOData(null);

                    expect(result).toBeNull();
                });

                it('should return null when calling fmtOData for undefined', () => {
                    const result = dataType.fmtOData(undefined);

                    expect(result).toBeNull();
                });

                it('should return date string when calling fmtOData for date', () => {
                    const input = new Date();

                    const result = dataType.fmtOData(input);

                    const expected = input.toISOString().split('T')[0];
                    expect(result).toEqual(expected);
                });

                it('should allow 0000 year', () => {
                    const input = '0000-01-01';

                    const result = dataType.fmtOData(input);

                    const expected = input;
                    expect(result).toEqual(expected);
                });

                it('should allow negative year', () => {
                    const input = '-10000-01-01';

                    const result = dataType.fmtOData(input);

                    const expected = input;
                    expect(result).toEqual(expected);
                });

                it('should return date string when calling fmtOData for date string', () => {
                    const input = '2021-01-01';

                    const result = dataType.fmtOData(input);

                    const expected = input;
                    expect(result).toEqual(expected);
                });

                it('should throw exception when calling fmtOData with invalid date string', () => {
                    const input = 'x';
                    expect(() => {
                        dataType.fmtOData(input);
                    }).toThrowError('\'x\' is not a valid EdmDate');
                });

                it('should throw exception when calling fmtOData with non-date', () => {
                    expect(() => {
                        dataType.fmtOData(123.45);
                    }).toThrowError('\'123.45\' is not a valid EdmDate');
                });
            });

            describe('defaultValue', () => {
                it('should return empty date for defaultValue', () => {
                    const result = dataType.defaultValue;
                    expect(result).toMatchObject({ year: 0, month: 1, day: 1 });
                });
            });

            describe('getNext', () => {
                it('should return current date', () => {
                    const result = dataType.getNext();
                    const expected = EdmDate.create(new Date());
                    expect(result).toMatchObject(expected);
                });
            });

            describe('normalize', () => {
                it('should return null for null', () => {
                    const result = dataType.normalize(null);

                    expect(result).toBeNull();
                });

                it('should return null for undefined', () => {
                    const result = dataType.normalize(undefined);

                    expect(result).toBeNull();
                });

                it('should return date string for date', () => {
                    const input = new Date();

                    const result = dataType.normalize(input);

                    const expected = input.toISOString().split('T')[0];
                    expect(result).toEqual(expected);
                });
            });

            describe('parse', () => {
                it('should return null for null', () => {
                    const result = dataType.parse(null, 'object');

                    expect(result).toBeNull();
                });

                it('should return instance for undefined', () => {
                    const result = dataType.parse(undefined, 'undefined');

                    const expected = EdmDate.create(new Date());
                    expect(result).toMatchObject(expected);
                });

                it('should return instance for date', () => {
                    const input = new Date();

                    const result = dataType.parse(input, 'date');

                    const expected = EdmDate.create(new Date());
                    expect(result).toEqual(expected);
                });

                it('should return instance for date string', () => {
                    const input = '2021-01-01';

                    const result = dataType.parse(input, 'string');

                    const expected = EdmDate.create('2021-01-01');
                    expect(result).toEqual(expected);
                });
            });
        });
    });
});
