import { DataType } from 'breeze-client';

import { TimeDataTypeSetup } from '../../../src/datatypes/setups/time-datatype-setup';
import { Utilities } from '../../../src/utilities';

describe('TimeDataTypeSetup', () => {
    const sut = new TimeDataTypeSetup();

    it('name should be Time', () => {
        expect(sut.name).toBe('Time');
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

        describe('DataType.Time', () => {
            let dataType: DataType;
            beforeAll(() => {
                dataType = DataType.Time;
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
