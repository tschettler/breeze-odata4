import { DataType, DataTypeSymbol } from 'breeze-client';

import { DateTimeDataTypeSetup } from '../../../src/datatypes/setups/datetime-datatype-setup';
import { Utilities } from '../../../src/utilities';

describe('DateTimeDataTypeSetup', () => {
    const sut = new DateTimeDataTypeSetup();

    it('name should be DateTime', () => {
        expect(sut.name).toBe('DateTime');
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

        describe('DataType.DateTime', () => {
            let dataType: DataTypeSymbol;
            beforeEach(() => {
                dataType = DataType.DateTime;
            });

            it('should return null when calling fmtOData for null', () => {
                const result = dataType.fmtOData(null);

                expect(result).toBeNull();
            });

            it('should return null when calling fmtOData for undefined', () => {
                const result = dataType.fmtOData(undefined);

                expect(result).toBeNull();
            });

            it('should return ISO date string when calling fmtOData for date', () => {
                const input = new Date();

                const result = dataType.fmtOData(input);

                expect(result).toEqual(input.toISOString());
            });

            it('should throw exception when calling fmtOData with non-date', () => {
                expect(() => {
                    dataType.fmtOData(123.45);
                }).toThrowError('is not a valid DateTime');
            });
        });
    });
});
