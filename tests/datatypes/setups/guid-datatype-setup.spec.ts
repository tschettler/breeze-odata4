import { DataType, DataTypeSymbol } from 'breeze-client';
import { GuidDataTypeSetup } from '../../../src/datatypes/setups/guid-datatype-setup';
import { Utilities } from '../../../src/utilities';

describe('GuidDataTypeSetup', () => {
    const sut = new GuidDataTypeSetup();

    it('name should be Guid', () => {
        expect(sut.name).toBe('Guid');
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

        describe('DataType.Guid', () => {
            let dataType: DataTypeSymbol;
            beforeAll(() => {
                dataType = DataType.Guid;
            });

            it('should return null when calling fmtOData for null', () => {
                const result = dataType.fmtOData(null);

                expect(result).toBeNull();
            });

            it('should return null when calling fmtOData for undefined', () => {
                const result = dataType.fmtOData(undefined);

                expect(result).toBeNull();
            });

            it('should return value when calling fmtOData for duration', () => {
                const input = 'e6580e89-3f62-4d4f-bf54-5a794391e1bf';

                const result = dataType.fmtOData(input);

                expect(result).toEqual(input);
            });

            it('should throw exception when calling fmtOData with non-duration', () => {
                expect(() => {
                    dataType.fmtOData(123.45);
                }).toThrowError('is not a valid Guid');
            });
        });
    });
});
