const OffsetRegex = new RegExp(/^(?:Z|(\+|-)?(\d{2}):([03]0|[14]5))$/);
const Zulu = 'Z';
const partLengths = [2, 2];

/**
 * Edm time-zone offset
 */
export class EdmOffset {
    private _totalMinutes = 0;

    private constructor(source: string) {
        this.parseString(source);
    }

    /**
     * Min edm offset value
     */
    public static readonly MinValue: Readonly<EdmOffset> = new EdmOffset('-12:00');

    /**
     * Max edm offset value
     */
    public static readonly MaxValue: Readonly<EdmOffset> = new EdmOffset('+14:00');

    /**
     * Creates edm offset
     * @param [source] The offset source. If source is already an EdmOffset, it will be returned. Defaults to "Z".
     * @returns An edm offset instance. 
     */
    public static create(source: EdmOffset | string = Zulu): EdmOffset {
        const result = source instanceof EdmOffset
            ? source
            : new EdmOffset(source);

        return result;
    }

    public get sign(): string {
        const result = !this._totalMinutes
            ? null
            : this._totalMinutes > 0 ? '+' : '-';

        return result;
    }

    public get hour(): number {
        const result = Math.trunc(this._totalMinutes / 60) + 0;

        return result;
    }

    public get minute(): number {
        const result = this._totalMinutes - this.hour * 60 + 0;

        return result;
    }

    public get totalMinutes(): number {
        return this._totalMinutes;
    }

    public toString(): string {
        if (!this._totalMinutes) {
            return Zulu;
        }

        const result = this.sign + [this.hour, this.minute]
            .map((x, i) => Math.abs(x).toString().padStart(partLengths[i], '0'))
            .join(':');
        
        return result;
    }

    private parseString(source: string): void {
        const isValid = this.tryParseWithRegex(source);
        if (!isValid
            || this._totalMinutes > EdmOffset.MaxValue?.totalMinutes
            || this._totalMinutes < EdmOffset.MinValue?.totalMinutes) {
            throw new TypeError(`'${source}' is not a valid ${EdmOffset.name}`);
        }
    }

    private tryParseWithRegex(source: string): boolean {
        const matchResult = OffsetRegex.exec(source);
        if (matchResult) {
            const [_, sign, hour, minute] = matchResult;

            this.updateOffset(Number(hour ?? 0), Number(minute ?? 0), sign);
        }

        const result = !!matchResult;

        return result;
    }

    private updateOffset(hour: number, minute: number, sign?: string): void {
        let result = hour * 60 + minute;
        result *= (sign === '-' ? -1 : 1);

        this._totalMinutes = result;
    }
}