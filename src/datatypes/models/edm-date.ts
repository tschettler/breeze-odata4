/**
 * Supports ISO 8601 formatted dates, allowing for year 0000 and negative years.
 * @summary dateValue = year "-" month "-" day
 */
const DateRegex = /^((?:\+|-)?\d{4,})-(\d{2})-(\d{2})/;
const partLengths = [4, 2, 2];

/**
 * @classdesc Date without a time-zone offset.
 */
export class EdmDate {
    private _day: number;
    private _month: number;
    private _year: number;

    private constructor(source: Date | string) {
        source instanceof Date ? this.parseDate(source) : this.parseString(source.toString());
    }

    /**
     * Gets the day fragment.
     */
    public get day(): number {
        return this._day;
    };

    /**
     * Sets the day fragment.
     */
    public set day(value: number) {
        this.updateDate(this._year, this._month, value);
    }

    /**
     * Gets the month fragment.
     */
    public get month(): number {
        return this._month;
    };

    /**
     * Sets the month fragment.
     */
    public set month(value: number) {
        this.updateDate(this._year, value, this._day);
    }

    /**
     * Gets the year fragment.
     */
    public get year(): number {
        return this._year;
    };

    /**
     * Sets the year fragment.
     */
    public set year(value: number) {
        this.updateDate(value, this._month, this._day);
    }

    /**
     * Gets a @see Date representation of the EdmDate.
     * @returns The EdmDate as a date. 
     */
    public toDate(): Date {
        const result = new Date(this.toString(true));

        return result;
    }

    /**
     * Gets the date in ISO 8601 format (`YYYY-MM-DD`).
     * @param includeTime Whether to include the time component. If so, format returned is `YYYY-MM-DDT00:00:00Z`
     * @returns the date string.
     */
    public toString(includeTime: boolean = false): string {
        const result = this.formatDate(this._year, this._month, this._day, includeTime);

        return result;
    }

    /**
     * Creates an instance of @see EdmDate
     * @param source The date source. If source is already an EdmDate, it will be returned. Defaults to current date.
     * @returns An edm date instance.
     */
    public static create(source: EdmDate | Date | string = new Date()): EdmDate {
        const result = source instanceof EdmDate
            ? source
            : source === null
                ? null
                : new EdmDate(source);

        return result;
    }

    /**
     * Min edm date value
     */
    public static readonly MinValue: Readonly<EdmDate> = new EdmDate(new Date(-8640000000000000));

    /**
     * Max edm date value
     */
    public static readonly MaxValue: Readonly<EdmDate> = new EdmDate(new Date(8640000000000000));

    private formatDate(year: number, month: number, day: number, includeTime: boolean = false): string {
        const sign = (year < 0 ? '-' : '');

        let result = sign + [year, month, day]
            .map((x, i) => Math.abs(x).toString().padStart(partLengths[i], '0'))
            .join('-');

        if (includeTime) {
            result += 'T00:00:00Z';
        }

        return result;
    }

    private tryParseWithRegex(source: string): boolean {
        const matchResult = DateRegex.exec(source);
        if (matchResult) {
            const [_, year, month, day] = matchResult;

            this.updateDate(Number(year), Number(month), Number(day));
        }

        const result = !!matchResult;

        return result;
    }

    private parseDate(source: Date): void {
        const [dateString] = source.toISOString().split('T');

        this.tryParseWithRegex(dateString);
    }

    private parseString(source: string): void {
        if (this.tryParseWithRegex(source)) {
            return;
        }

        const dateVal = new Date(source);

        if (isNaN(dateVal as any)) {
            throw new TypeError(`'${source}' is not a valid ${EdmDate.name}`);
        }

        this.parseDate(dateVal);
    }

    private updateDate(year: number, month: number, day: number): void {
        const date = new Date(Date.UTC(year, month - 1, day));

        if (isNaN(date as any)) {
            throw new TypeError(`'${this.formatDate(year, month, day)}' is not a valid ${EdmDate.name}`);
        }

        // for years 0-99, 1900 is added and so we have to remove it manually
        this._year = date.getUTCFullYear() - (year >= 0 && year < 100 ? 1900 : 0);
        this._month = date.getUTCMonth() + 1;
        this._day = date.getUTCDate();
    }
}