import { DataType, DataTypeSymbol } from 'breeze-client';
import { NumericDataTypeSetup } from '../../../src/datatypes/setups/numeric-datatype-setup';
import { Utilities } from '../../../src/utilities';

describe('NumericDataTypeSetup', () => {
    const sut = new NumericDataTypeSetup();

    describe('register', () => {
        const types = ['Decimal', 'Double', 'Int64'];

        beforeAll(() => {
            sut.register();
        });

        it('should be available from DataType', () => {
            types.forEach(type => expect(DataType[type]).toBeTruthy());
        });

        it('should register with Utilities', () => {
            types.forEach(type => {
                const result = Utilities.getDataType(type.toLowerCase());
                expect(result).toEqual(DataType[type]);
            });
        });

        describe('DataType.Decimal', () => {
            let dataType: DataTypeSymbol;
            beforeAll(() => {
                dataType = DataType.Decimal;
            });

            it('should return null when calling fmtOData for null number', () => {
                const result = dataType.fmtOData(null);

                expect(result).toBeNull();
            });

            it('should return null when calling fmtOData for undefined', () => {
                const result = dataType.fmtOData(undefined);

                expect(result).toBeNull();
            });

            it('should return number when calling fmtOData for numeric string', () => {
                const result = dataType.fmtOData('123.45');

                expect(result).toEqual(123.45);
            });


            it('should return value when calling fmtOData for non-string', () => {
                const result = dataType.fmtOData(123.45);

                expect(result).toBe(123.45);
            });
        });

        describe('DataType.Double', () => {
            const dataType = DataType.Double;

            it('should return null when calling fmtOData for null number', () => {
                const result = dataType.fmtOData(null);

                expect(result).toBeNull();
            });

            it('should return null when calling fmtOData for undefined', () => {
                const result = dataType.fmtOData(undefined);

                expect(result).toBeNull();
            });

            it('should return number when calling fmtOData for numeric string', () => {
                const result = dataType.fmtOData('123.45');

                expect(result).toEqual(123.45);
            });


            it('should return value when calling fmtOData for non-string', () => {
                const result = dataType.fmtOData(123.45);

                expect(result).toBe(123.45);
            });
        });

        describe('DataType.Int64', () => {
            const dataType = DataType.Int64;

            it('should return null when calling fmtOData for null number', () => {
                const result = dataType.fmtOData(null);

                expect(result).toBeNull();
            });

            it('should return null when calling fmtOData for undefined', () => {
                const result = dataType.fmtOData(undefined);

                expect(result).toBeNull();
            });

            it('should return number when calling fmtOData for numeric string', () => {
                const result = dataType.fmtOData('123.45');

                expect(result).toEqual(123.45);
            });


            it('should return value when calling fmtOData for non-string', () => {
                const result = dataType.fmtOData(123.45);

                expect(result).toBe(123.45);
            });
        });
    });
});
