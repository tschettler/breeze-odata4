import { DataType, DataTypeSymbol } from 'breeze-client';
import { GeographyPointDataTypeSetup } from '../../../src/datatypes/setups/geographypoint-datatype-setup';
import { Utilities } from '../../../src/utilities';

describe('GeographyPointDataTypeSetup', () => {
    const sut = new GeographyPointDataTypeSetup();

    it('name should be GeographyPoint', () => {
        expect(sut.name).toBe('GeographyPoint');
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

        describe('DataType.GeographyPoint', () => {
            let dataType: DataTypeSymbol;
            beforeAll(() => {
                dataType = DataType['GeographyPoint'];
            });

        });
    });
});
