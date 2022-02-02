import { core, DataTypeSymbol, Validator } from 'breeze-client';

export class EdmEnumMember implements core.EnumSymbol {
    public parentEnum: core.IEnum;
    public displayName: string;
    public name: string;
    public rawValue: string;
    public value: number;
    public getName: () => '';
    public toString: () => '';
}

export interface EdmEnumOptions {
    isFlags: boolean;
    name: string;
    underlyingDataType: DataTypeSymbol;
}

export class EdmEnum extends core.Enum {
    public readonly isFlags: boolean;
    public readonly name: string;
    public validatorCtor = Validator.none;

    private _symbolPrototype: core.EnumSymbol;

    private readonly underlyingDataType: DataTypeSymbol;
    private defaultValue: EdmEnumMember;
    private members: EdmEnumMember[] = [];

    public constructor(options: EdmEnumOptions) {
        super(options.name);

        this.isFlags = options.isFlags;
        this.name = options.name;
        this.underlyingDataType = options.underlyingDataType;
    }

    public addSymbol(enumMember?: Partial<EdmEnumMember>): core.EnumSymbol {
        enumMember.displayName ??= enumMember.name;
        enumMember.value = this.underlyingDataType.parse(enumMember.rawValue, 'string');
        const result = super.addSymbol(enumMember);

        // a little gross, but core.EnumSymbol is not actually exposed in breeze
        const memberResult = <unknown>result as EdmEnumMember;
        this.members.push(memberResult);

        if (!this.defaultValue) {
            this.defaultValue = memberResult;
        }

        this[enumMember.name] = result;

        return result;
    }

    public fromValue(value: number): core.EnumSymbol {
        let result: core.EnumSymbol;

        if (this.isFlags && value) {
            result = this.fromFlagsEnumValue(value);
        } else {
            result = this.members.find(m => m.value === value);
        }

        return result;
    }

    public fromName(name: string): core.EnumSymbol {
        const value = Number(name);
        if (!isNaN(value)) {
            return this.fromValue(value);
        }

        const result = this.isFlags && name.includes(',')
            ? this.fromFlagsEnumName(name)
            : super.fromName(name);

        return result;
    }

    public parse = (val: any, sourceTypeName?: string): any => {
        if (typeof val === 'undefined' || val === null) {
            return null;
        }

        if (sourceTypeName === 'object' && val['parentEnum'] === this) {
            return val;
        }

        if (sourceTypeName === 'string') {
            return this.fromName(val);
        }

        if (sourceTypeName === 'number') {
            return this.fromValue(val);
        }

        return null;
    }

    public parseRawValue = (val: any): any => {
        return this.parse(val, 'string');
    }

    private fromFlagsEnumValue(value: number): core.EnumSymbol {
        const result: EdmEnumMember = this.createEdmEnumMember();

        // tslint:disable:no-bitwise
        const flags = this.members
            .filter(m => m.value > 0 && (m.value | value) === value);
        // tslint:enable:no-bitwise

        if (!flags.length) {
            return undefined;
        }

        result.displayName = flags.map(f => f.displayName).join(', ');
        result.name = flags.map(f => f.name).join(',');
        result.value = flags.reduce((tot, cur) => tot + cur.value, 0);

        return result;
    }

    private fromFlagsEnumName(name: string): core.EnumSymbol {
        let result: EdmEnumMember;

        name.split(',')
            .filter(n => this.members.some(m => m.name === n))
            .forEach(memberName => {
                const symbol = super.fromName(memberName.trim()) as EdmEnumMember;
                if (!result) {
                    result = Object.assign(this.createEdmEnumMember(), symbol);
                    result.name = name;
                } else {
                    result.displayName += `, ${symbol.displayName}`;
                    result.value += symbol.value;
                }
            }, 0);

        return result;
    }

    private createEdmEnumMember(): EdmEnumMember {
        const result = <unknown>Object.create(this._symbolPrototype) as EdmEnumMember;
        return result;
    }
}
