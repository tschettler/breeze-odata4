import { DataType, DataTypeSymbol } from 'breeze-client';

import { DurationDataTypeSetup } from '../../../src/datatypes/setups/duration-datatype-setup';
import { Utilities } from '../../../src/utilities';

describe('DurationDataTypeSetup', () => {
    const sut = new DurationDataTypeSetup();

    it('name should be Duration', () => {
        expect(sut.name).toBe('Duration');
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

        describe('DataType.Duration', () => {
            let dataType: DataTypeSymbol;
            beforeAll(() => {
                dataType = DataType['Duration'];
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
                const input = 'P1Y2M10DT2H30M';

                const result = dataType.fmtOData(input);

                expect(result).toEqual(input);
            });

            it('should throw exception when calling fmtOData with non-duration', () => {
                expect(() => {
                    dataType.fmtOData(123.45);
                }).toThrowError('is not a valid ISO 8601 duration');
            });
        });
    });
});
