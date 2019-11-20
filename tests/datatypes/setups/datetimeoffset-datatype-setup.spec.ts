import { DataType, DataTypeSymbol } from 'breeze-client';
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
            let dataType: DataTypeSymbol;
            beforeAll(() => {
                dataType = DataType.DateTimeOffset;
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
                }).toThrowError('is not a valid DateTimeOffset');
            });
        });
    });
});
