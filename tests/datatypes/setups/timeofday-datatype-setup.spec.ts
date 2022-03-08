import { DataType } from 'breeze-client';

import { TimeOfDayDataTypeSetup } from '../../../src/datatypes/setups/timeofday-datatype-setup';
import { Utilities } from '../../../src/utilities';

describe('TimeOfDayDataTypeSetup', () => {
    const sut = new TimeOfDayDataTypeSetup();

    it('name should be TimeOfDay', () => {
        expect(sut.name).toBe('TimeOfDay');
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

        describe('DataType.TimeOfDay', () => {
            let dataType: DataType;
            beforeAll(() => {
                dataType = DataType['TimeOfDay'];
            });

            it('should not be null', () => {
                expect(dataType).not.toBeNull();
            });

            it('should return null when calling fmtOData for null', () => {
                const result = dataType.fmtOData(null);

                expect(result).toBeNull();
            });

            it('should return null when calling fmtOData for undefined', () => {
                const result = dataType.fmtOData(undefined);

                expect(result).toBeNull();
            });

            it('should return value when calling fmtOData for time', () => {
                const input = '10:30:20.400';

                const result = dataType.fmtOData(input);

                expect(result).toEqual(input);
            });
        });
    });
});
