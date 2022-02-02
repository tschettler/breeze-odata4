import { DataType, DataTypeSymbol } from 'breeze-client';

import { DateDataTypeSetup } from '../../../src/datatypes/setups/Date-datatype-setup';
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
            let dataType: DataTypeSymbol;
            beforeEach(() => {
                dataType = DataType['Date'];
            });

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
                }).toThrowError('is not a valid Date');
            });

            it('should throw exception when calling fmtOData with non-date', () => {
                expect(() => {
                    dataType.fmtOData(123.45);
                }).toThrowError('is not a valid Date');
            });
        });
    });
});
