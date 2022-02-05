import { core, DataTypeSymbol, Validator } from 'breeze-client';

/**
 * @classdesc Edm enum member
 */
export class EdmEnumMember implements core.EnumSymbol {

    /**
     * Parent enum of edm enum member.
     */
    public parentEnum: core.IEnum;

    /**
     * Display name of edm enum member.
     */
    public displayName: string;

    /**
     * Name of edm enum member.
     */
    public name: string;

    /**
     * Raw value from server for edm enum member.
     */
    public rawValue: string;

    /**
     * Value of edm enum member.
     */
    public value: number;

    /**
     * Gets name of edm enum member.
     */
    public getName: () => '';

    /**
     * Returns a string representation of the edm enum member.
     */
    public toString: () => '';
}

/**
 * Edm enum options.
 */
export interface EdmEnumOptions {

    /**
     * True if this is a flags enum, false otherwise.
     */
    isFlags: boolean;

    /**
     * The enum name.
     */
    name: string;

    /**
     * The underlying data type for the enum.
     */
    underlyingDataType: DataTypeSymbol;
}

/**
 * @classdesc Edm enum
 */
export class EdmEnum extends core.Enum {

    /**
     * True if this is a flags enum, false otherwise.
     */
    public readonly isFlags: boolean;

    /**
     * The enum name.
     */
    public readonly name: string;

    /**
     * Validator constructor of the edm enum.
     */
    public validatorCtor = Validator.none;

    private _symbolPrototype: core.EnumSymbol;

    private readonly underlyingDataType: DataTypeSymbol;
    private defaultValue: EdmEnumMember;
    private members: EdmEnumMember[] = [];

    /**
     * Creates an instance of edm enum.
     * @param options The initialization options for the enum.
     */
    public constructor(options: EdmEnumOptions) {
        super(options.name);

        this.isFlags = options.isFlags;
        this.name = options.name;
        this.underlyingDataType = options.underlyingDataType;
    }

    /**
     * Adds symbol to the enum.
     * @param [enumMember] The enum member.
     * @returns The breeze symbol for the enum member.
     */
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

    /**
     * Gets the enum member from the specified value.
     * @param value The value.
     * @returns The enum symbol.
     */
    public fromValue(value: number): core.EnumSymbol {
        let result: core.EnumSymbol;

        if (this.isFlags && value) {
            result = this.fromFlagsEnumValue(value);
        } else {
            result = this.members.find(m => m.value === value);
        }

        return result;
    }

    /**
    * Gets the enum member from the specified name.
    * @param name The name.
    * @returns The enum symbol.
    */
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

    /**
    * Parses the value into the corresponding enum symbol.
    * @param name The value of the enum.
    * @returns The enum symbol.
    */
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

    /**
    * Parses the raw value into the corresponding enum symbol.
    * @param name The value of the enum.
    * @returns The enum symbol.
    */
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
