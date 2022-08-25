import { DataType } from 'breeze-client';
import { EdmDateTimeOffset } from '../../../src/datatypes/models';

import { DateTimeOffsetDataTypeSetup } from '../../../src/datatypes/setups/datetimeoffset-datatype-setup';
import { Utilities } from '../../../src/utilities';

describe('DateTimeOffsetDataTypeSetup', () => {
    const sut = new DateTimeOffsetDataTypeSetup();

    it('name should be DateTimeOffset', () => {
        expect(sut.name).toBe('DateTimeOffset');
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

        describe('DataType.DateTimeOffset', () => {
            let dataType: DataType;
            beforeAll(() => {
                dataType = DataType.DateTimeOffset;
            });

            describe('fmtOData', () => {
                it('should return null for null', () => {
                    const result = dataType.fmtOData(null);

                    expect(result).toBeNull();
                });

                it('should return null for undefined', () => {
                    const result = dataType.fmtOData(undefined);

                    expect(result).toBeNull();
                });

                it('should return ISO date string for date', () => {
                    const input = new Date();
                    input.setMilliseconds(0);

                    const result = dataType.fmtOData(input);

                    expect(result).toBe(input.toISOString());
                });

                it('should throw exception for non-date', () => {
                    expect(() => {
                        dataType.fmtOData(123.45);
                    }).toThrowError('\'123.45\' is not a valid EdmDateTimeOffset');
                });
            });

            describe('getConcurrencyValue', () => {
                it('should return the next date time offset', () => {
                    const current = EdmDateTimeOffset.create();

                    const result = dataType.getConcurrencyValue();

                    expect(current.toDate().getTime()).toBeLessThan(result.toDate().getTime());
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

                it('should return date for date', () => {
                    const input = new Date();

                    const result = dataType.normalize(input);

                    expect(result).toEqual(input);
                });
            });

        });
    });
});
