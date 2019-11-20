import { DataType, DataTypeSymbol } from 'breeze-client';
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
            let dataType: DataTypeSymbol;
            beforeAll(() => {
                dataType = DataType['TimeOfDay'];
            });
        });
    });
});
