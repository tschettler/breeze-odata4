import { DataType } from 'breeze-client';
import { EdmDuration } from '../../../src/datatypes/models';

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
            let dataType: DataType;
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
                const input = 'P10DT2H30M';

                const result = dataType.fmtOData(input);

                expect(result).toEqual(input);
            });

            it('should throw exception when calling fmtOData with non-duration', () => {
                expect(() => {
                    dataType.fmtOData(123.45);
                }).toThrowError('\'123.45\' is not a valid EdmDuration');
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

                it('should return total seconds for duration', () => {
                    const input = "PT24M33S";

                    const result = dataType.normalize(input);

                    const expected = 1473;
                    expect(result).toEqual(expected);
                });
            });
        });
    });
});
