const Sign = '-';
const DurationStart = 'P';
const TimeStart = 'T';
const Days = 'D';
const Hours = 'H';
const Minutes = 'M';
const Seconds = 'S';

const DurationRegex = new RegExp(/^(-)?P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+\.?\d*)S)?)?$/);

const Default = `${DurationStart}0${Days}`;
const LiteralSequence = [DurationStart, Days, TimeStart, Hours, Minutes, Seconds];

/**
 * @classdesc Edm duration
 */
export class EdmDuration {
    private _totalSeconds: number;

    private _days: number;
    private _hours: number;
    private _minutes: number;
    private _seconds: number;

    private constructor(source: string) {
        this.parseString(source.toString());
    }

    /**
     * Gets the days component of the duration represented by this instance.
     */
    public get days(): number {
        const result = this._days;

        return result;
    }

    /**
     * Sets the days component of the duration represented by this instance.
     */
    public set days(value: number) {
        this.updateDuration(value, this._hours, this._minutes, this._seconds);
    }

    /**
     * Gets the hours component of the duration represented by this instance.
     */
    public get hours(): number {
        const result = this._hours;

        return result;
    }

    /**
     * Sets the hours component of the duration represented by this instance.
     */
    public set hours(value: number) {
        this.updateDuration(this._days, value, this._minutes, this._seconds);
    }

    /**
     * Gets the minutes component of the duration represented by this instance.
     */
    public get minutes(): number {
        const result = this._minutes;

        return result;
    }

    /**
     * Sets the minutes component of the duration represented by this instance.
     */
    public set minutes(value: number) {
        this.updateDuration(this._days, this._hours, value, this._seconds);
    }

    /**
     * Gets the seconds component of the duration represented by this instance.
     */
    public get seconds(): number {
        const result = this._seconds;

        return result;
    }

    /**
     * Sets the seconds component of the duration represented by this instance.
     */
    public set seconds(value: number) {
        this.updateDuration(this._days, this._hours, this._minutes, value);
    }

    /**
     * Gets the total seconds of the duration represented by this instance.
     */
    public get totalSeconds(): number {
        const result = this._totalSeconds;

        return result;
    }

    /**
     * Sets the total seconds of the duration represented by this instance.
     */
    public set totalSeconds(value: number) {
        this.updateDuration(0, 0, 0, value);
    }


    /**
     * Gets the duration as a string.
     * @returns the duration string.
     */
    public toString(): string {
        const sign = (this._totalSeconds < 0 ? '-' : '');

        const values = [sign, this._days, undefined, this._hours, this._minutes, this._seconds];
        let result = LiteralSequence.map((l, i) => {
            const part = values[i];
            const numericValue = Math.abs(Number(part));
            const value = typeof part === 'undefined' || part === '' || isNaN(numericValue) ? part : numericValue;

            const partResult = value === 0 ? null : `${(value ?? '')}${l}`;

            return partResult;
        }).filter(x => !!x)
            .join('');

        result = result === `${DurationStart}${TimeStart}`
            ? Default
            : result;

        if (result.endsWith(TimeStart)) {
            result = result.slice(0, -1);
        }

        return result;
    }

    /**
     * Creates an instance of @see EdmDuration
     * @param [source] The date source. If the source is already an EdmDuration, it will be returned. Defaults to 0 days.
     * @returns An edm duration instance. 
     */
    public static create(source: EdmDuration | string = Default): EdmDuration {
        const result = source instanceof EdmDuration
            ? source
            : source === null
                ? null
                : new EdmDuration(source);

        return result;
    }

    private parseString(source: string): void {
        const matchResult = source.match(DurationRegex);
        if (!matchResult) {
            throw new TypeError(`'${source}' is not a valid ${EdmDuration.name}`);
        }

        const multi = Number(`${(matchResult[1] ?? '')}1`);
        const [_, __, days, hours, minutes, seconds] = matchResult.map(x => multi * Number(x ?? 0));

        this.updateDuration(days, hours, minutes, seconds);
    }

    private updateDuration(days: number, hours: number, minutes: number, seconds: number): void {
        // adding fractional seconds here could cause implicit rounding to occur if >= 16383.
        const partialSeconds = seconds - Math.trunc(seconds);
        seconds -= partialSeconds;

        this._totalSeconds = (((days * 24 + hours) * 60 + minutes) * 60) + seconds;

        let secondsLeft = this._totalSeconds;
        [days, hours, minutes] = [86400, 3600, 60].map(x => {
            const result = Math.trunc(secondsLeft / x);
            secondsLeft -= result * x;
            return result;
        });

        seconds = secondsLeft + partialSeconds;
        this._totalSeconds += partialSeconds;

        [this._days, this._hours, this._minutes, this._seconds] = [days, hours, minutes, seconds];
    }
}