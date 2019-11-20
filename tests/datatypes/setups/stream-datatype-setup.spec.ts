import { DataType, DataTypeSymbol } from 'breeze-client';
import { StreamDataTypeSetup } from '../../../src/datatypes/setups/stream-datatype-setup';
import { Utilities } from '../../../src/utilities';

describe('StreamDataTypeSetup', () => {
    const sut = new StreamDataTypeSetup();

    it('name should be Stream', () => {
        expect(sut.name).toBe('Stream');
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

        describe('DataType.Stream', () => {
            let dataType: DataTypeSymbol;
            beforeAll(() => {
                dataType = DataType['Stream'];
            });
        });
    });
});
