import { DataType } from 'breeze-client';

import { EdmEnum, EdmEnumMember, EdmEnumOptions } from '../../src/models/models';

describe('EdmEnum', () => {
    let sut: EdmEnum;

    const opts = <EdmEnumOptions>{
        name: 'Test',
        isFlags: false,
        underlyingDataType: DataType.Int32
    };

    describe('isFlags=false', () => {
        beforeEach(() => {
            opts.isFlags = false;
            sut = new EdmEnum(opts);
        });

        it('should set name', () => {
            expect(sut.name).toBe('Test');
        });

        it('should set isFlags to false', () => {
            expect(sut.isFlags).toBe(false);
        });

        describe('addSymbol', () => {
            it('should add symbol', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';

                const result = sut.addSymbol(enumMember);

                expect(sut.getSymbols()).toContain(result);
            });

            it('should add multiple symbols', () => {
                let enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';

                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'First';
                enumMember.rawValue = '1';
                const result = sut.addSymbol(enumMember);

                expect(sut.getSymbols()).toContain(result);
            });

            it('should set property', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';

                const result = sut.addSymbol(enumMember);

                expect(sut[enumMember.name]).toEqual(result);
            });

            it('should set member name', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';

                const result = sut.addSymbol(enumMember);

                expect(result['name']).toEqual(enumMember.name);
            });

            it('should set rawValue', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';

                const result = sut.addSymbol(enumMember);

                expect(result['rawValue']).toEqual(enumMember.rawValue);
            });

            it('should set value', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';

                const result = sut.addSymbol(enumMember);

                expect(result['value']).toEqual(enumMember.value);
            });

            it('should set displayName', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                enumMember.displayName = 'Not Set';

                const result = sut.addSymbol(enumMember);

                expect(result['displayName']).toEqual(enumMember.displayName);
            });
        });

        describe('fromValue', () => {
            it('should return correct symbol', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.fromValue(enumMember.value);

                expect(result).toBe(symbol);
            });

            it('should return undefined if not found', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                const result = sut.fromValue(1);

                expect(result).toBeUndefined();
            });
        });

        describe('fromName', () => {
            it('should return correct symbol with name', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.fromName(enumMember.name);

                expect(result).toBe(symbol);
            });

            it('should return correct symbol with value', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.fromName(enumMember.rawValue);

                expect(result).toBe(symbol);
            });

            it('should return undefined if not found with name', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                const result = sut.fromName('NotPresent');

                expect(result).toBeUndefined();
            });

            it('should return undefined if not found with value', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                const result = sut.fromName('1');

                expect(result).toBeUndefined();
            });
        });

        describe('parse', () => {
            it('should return null for undefined', () => {
                const result = sut.parse(undefined);
                expect(result).toBeNull();
            });

            it('should return null for null', () => {
                const result = sut.parse(null);
                expect(result).toBeNull();
            });

            it('should return null for object', () => {
                const result = sut.parse({});
                expect(result).toBeNull();
            });

            it('should return correct symbol with symbol', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.parse(symbol, 'object');

                expect(result).toBe(symbol);
            });

            it('should return correct symbol with name', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.parse(enumMember.name, 'string');

                expect(result).toBe(symbol);
            });

            it('should return correct symbol with value', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.parse(enumMember.value, 'number');

                expect(result).toBe(symbol);
            });

            it('should return null if sourceTypeName is not provided', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                const result = sut.parse(enumMember.name);

                expect(result).toBeNull();
            });
        });

        describe('parseRawValue', () => {
            it('should return null for undefined', () => {
                const result = sut.parseRawValue(undefined);
                expect(result).toBeNull();
            });

            it('should return null for null', () => {
                const result = sut.parseRawValue(null);
                expect(result).toBeNull();
            });

            it('should return correct symbol with name', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.parseRawValue(enumMember.name);

                expect(result).toBe(symbol);
            });

            it('should return correct symbol with value', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.parseRawValue(enumMember.value);

                expect(result).toBe(symbol);
            });
        });
    });

    describe('isFlags=true', () => {
        beforeEach(() => {
            opts.isFlags = true;
            sut = new EdmEnum(opts);
        });

        it('should set isFlags to true', () => {
            expect(sut.isFlags).toBe(true);
        });

        describe('fromValue', () => {
            it('should return correct default symbol', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.fromValue(enumMember.value);

                expect(result).toBe(symbol);
            });

            it('should return composite value', () => {
                let enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'One';
                enumMember.rawValue = '1';
                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'Two';
                enumMember.rawValue = '2';
                sut.addSymbol(enumMember);

                const result = sut.fromValue(3);

                expect(result['value']).toEqual(3);
                expect(result['name']).toEqual('One,Two');
            });

            it('should return undefined if not found', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                const result = sut.fromValue(1);

                expect(result).toBeUndefined();
            });
        });

        describe('fromName', () => {
            it('should return correct symbol with name', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.fromName(enumMember.name);

                expect(result).toBe(symbol);
            });

            it('should return composite with name', () => {
                let enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'One';
                enumMember.rawValue = '1';
                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'Two';
                enumMember.displayName = 'Second';
                enumMember.rawValue = '2';
                sut.addSymbol(enumMember);

                const result = sut.fromName('One,Two');

                expect(result['value']).toEqual(3);
                expect(result['name']).toEqual('One,Two');
                expect(result['displayName']).toEqual('One, Second');
            });

            it('should return correct symbol with value', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.fromName(enumMember.rawValue);

                expect(result).toBe(symbol);
            });

            it('should return composite with value', () => {
                let enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'One';
                enumMember.displayName = 'First';
                enumMember.rawValue = '1';
                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'Two';
                enumMember.rawValue = '2';
                sut.addSymbol(enumMember);

                const result = sut.fromName('3');

                expect(result['value']).toEqual(3);
                expect(result['name']).toEqual('One,Two');
                expect(result['displayName']).toEqual('First, Two');
            });

            it('should return undefined if not found with name', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                const result = sut.fromName('NotPresent');

                expect(result).toBeUndefined();
            });

            it('should return undefined if not found with value', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                const result = sut.fromName('1');

                expect(result).toBeUndefined();
            });
        });

        describe('parse', () => {
            it('should return null for undefined', () => {
                const result = sut.parse(undefined);
                expect(result).toBeNull();
            });

            it('should return null for null', () => {
                const result = sut.parse(null);
                expect(result).toBeNull();
            });

            it('should return correct symbol with name', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.parse(enumMember.name, 'string');

                expect(result).toBe(symbol);
            });

            it('should return correct symbol with value', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.parse(enumMember.value, 'number');

                expect(result).toBe(symbol);
            });

            it('should return composite value', () => {
                let enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'One';
                enumMember.rawValue = '1';
                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'Two';
                enumMember.rawValue = '2';
                sut.addSymbol(enumMember);

                const result = sut.parse(3, 'number');

                expect(result['value']).toEqual(3);
                expect(result['name']).toEqual('One,Two');
            });

            it('should return null if sourceTypeName is not provided', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                const result = sut.parse(enumMember.name);

                expect(result).toBeNull();
            });
        });

        describe('parseRawValue', () => {
            it('should return null for undefined', () => {
                const result = sut.parseRawValue(undefined);
                expect(result).toBeNull();
            });

            it('should return null for null', () => {
                const result = sut.parseRawValue(null);
                expect(result).toBeNull();
            });

            it('should return correct symbol with name', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.parseRawValue(enumMember.name);

                expect(result).toBe(symbol);
            });

            it('should return correct symbol with value', () => {
                const enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                const symbol = sut.addSymbol(enumMember);

                const result = sut.parseRawValue(enumMember.value);

                expect(result).toBe(symbol);
            });

            it('should return composite value', () => {
                let enumMember = new EdmEnumMember();
                enumMember.name = 'None';
                enumMember.rawValue = '0';
                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'One';
                enumMember.rawValue = '1';
                sut.addSymbol(enumMember);

                enumMember = new EdmEnumMember();
                enumMember.name = 'Two';
                enumMember.rawValue = '2';
                sut.addSymbol(enumMember);

                const result = sut.parseRawValue(3);

                expect(result['value']).toEqual(3);
                expect(result['name']).toEqual('One,Two');
            });
        });
    });
});
