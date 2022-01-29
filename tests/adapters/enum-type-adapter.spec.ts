import { DataType } from 'breeze-client';
import { Edm, Edmx } from 'ts-odatajs';

import { EnumTypeAdapter } from '../../src/adapters/enum-type-adapter';

let sut: EnumTypeAdapter;
let metadata: Edmx.Edmx;

const schema: Edm.Schema = <any>{
    namespace: 'UnitTesting',
    entityContainer: {
        name: 'Default',
    },
};

let enumType: Edm.EnumType;

describe('EnumTypeAdapter', () => {

    beforeEach(() => {
        sut = new EnumTypeAdapter();
        metadata = {
            version: '4.0',
            dataServices: {
                schema: [schema]
            }
        };
    });

    it('should create instance of EnumTypeAdapter when constructor is called', () => {
        expect(sut).toBeInstanceOf(EnumTypeAdapter);
    });

    describe('adapt', () => {
        beforeEach(() => {
            schema.enumType = [];

            enumType = <Edm.EnumType>{
                name: 'TestEnum',
                underlyingType: 'Edm.Int64',
                isFlags: 'false',
                member: []
            };
        });

        it('should not throw error when adapt is called with null enumType', () => {
            schema.enumType = null;

            expect(() => sut.adapt(metadata.dataServices)).not.toThrowError();
        });

        it('should set underlyingType to Int32 if not set', () => {
            enumType.underlyingType = null;
            schema.enumType.push(enumType);

            sut.adapt(metadata.dataServices);

            expect(enumType.underlyingType).toBe('Edm.Int32');
        });

        it('should set isFlags to false if not set', () => {
            enumType.isFlags = null;
            schema.enumType.push(enumType);

            sut.adapt(metadata.dataServices);

            expect(enumType.isFlags).toBe('false');
        });

        it('should add to DataType', () => {
            schema.enumType.push(enumType);

            sut.adapt(metadata.dataServices);

            expect(DataType[enumType.name]).toBeTruthy();
        });

        it('should set name on DataTypeSymbol', () => {
            schema.enumType.push(enumType);

            sut.adapt(metadata.dataServices);

            expect(DataType[enumType.name]).toMatchObject({ name: enumType.name });
        });

        it('should set isFlags on DataTypeSymbol', () => {
            schema.enumType.push(enumType);

            sut.adapt(metadata.dataServices);

            expect(DataType[enumType.name]).toMatchObject({ isFlags: false });
        });

        it('should adapt members', () => {
            schema.enumType.push(enumType);

            enumType.member.push({
                name: 'One',
                value: '1'
            },
                {
                    name: 'Two',
                    value: '2'
                });

            sut.adapt(metadata.dataServices);

            expect(DataType[enumType.name]['One']).toBeTruthy();
            expect(DataType[enumType.name]['Two']).toBeTruthy();
        });

        it('should set member name', () => {
            schema.enumType.push(enumType);

            const member = {
                name: 'One',
                value: '1'
            };

            enumType.member.push(member);

            sut.adapt(metadata.dataServices);

            expect(DataType[enumType.name]['One']).toMatchObject({ name: member.name });
        });

        it('should set member rawValue', () => {
            schema.enumType.push(enumType);

            const member = {
                name: 'One',
                value: '1'
            };

            enumType.member.push(member);

            sut.adapt(metadata.dataServices);

            expect(DataType[enumType.name]['One']).toMatchObject({ rawValue: '1' });
        });

        it('should set member value', () => {
            schema.enumType.push(enumType);

            const member = {
                name: 'One',
                value: '1'
            };

            enumType.member.push(member);

            sut.adapt(metadata.dataServices);

            expect(DataType[enumType.name]['One']).toMatchObject({ value: 1 });
        });

        it('should set member displayName', () => {
            schema.enumType.push(enumType);

            const member = {
                name: 'One',
                displayName: 'Number One',
                value: '1'
            };

            enumType.member.push(member);

            sut.adapt(metadata.dataServices);

            expect(DataType[enumType.name]['One']).toMatchObject({ displayName: member.displayName });
        });
    });
});
