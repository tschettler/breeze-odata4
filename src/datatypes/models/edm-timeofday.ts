/**
 * timeOfDayValue = hour ":" minute [ ":" second [ "." fractionalSeconds ] ]
 */
const TimeOfDayRegex = new RegExp(/^\d{2}:\d{2}(:\d{2}(\.\d{1,12})?)?$/);
const partLengths = [2, 2, 2];

/**
 *  @classdesc Edm time of day
 */
export class EdmTimeOfDay {
    private _fractionalSeconds: number;
    private _hours: number;
    private _minutes: number;
    private _seconds: number;

    private constructor(source: Date | string) {
        source instanceof Date ? this.parseDate(source) : this.parseString(source);
    }

    /**
     * Min edm time of day value
     */
    public static readonly MinValue: Readonly<EdmTimeOfDay> = new EdmTimeOfDay('00:00');

    /**
     * Max of edm time of day value
     */
    public static readonly MaxValue: Readonly<EdmTimeOfDay> = new EdmTimeOfDay('23:59:59.999999999999');

    /**
     * Creates edm time of day
     * @param [source] The time source. If source is already an EdmTimeOfDay, it will be returned. Defaults to "00:00".
     * @returns An edm time of day instance.  
     */
    public static create(source: EdmTimeOfDay | Date | string = '00:00'): EdmTimeOfDay {
        const result = source instanceof EdmTimeOfDay
            ? source
            : new EdmTimeOfDay(source);

        return result;
    }

    /**
     * Gets the hours component of the time represented by this instance.
     */
    public get hours(): number {
        return this._hours;
    }

    /**
     * Sets the hours component of the time represented by this instance.
     */
    public set hours(value: number) {
        this.updateTimeOfDay(value, this._minutes, this._seconds, this._fractionalSeconds);
    }

    /**
     * Gets the minutes component of the time represented by this instance.
     */
    public get minutes(): number {
        return this._minutes;
    }

    /**
     * Sets the minutes component of the time represented by this instance.
     */
    public set minutes(value: number) {
        this.updateTimeOfDay(this._hours, value, this._seconds, this._fractionalSeconds);
    }

    /**
     * Gets the seconds component of the time represented by this instance.
     */
    public get seconds(): number {
        return this._seconds;
    }

    /**
     * Sets the seconds component of the time represented by this instance.
     */
    public set seconds(value: number) {
        this.updateTimeOfDay(this._hours, this._minutes, value, this._fractionalSeconds);
    }

    /**
     * Gets the fractional seconds component of the time represented by this instance.
     */
    public get fractionalSeconds(): number {
        return this._fractionalSeconds;
    }

    /**
     * Sets the fractional seconds component of the time represented by this instance.
     */
    public set fractionalSeconds(value: number) {
        // have to handle updating seconds separately
        const seconds = Math.trunc(value);
        this._seconds += seconds;
        value -= seconds;

        this.updateTimeOfDay(this._hours, this._minutes, this._seconds, value);
    }

    /**
     * Gets the time in hh:mm:ss.n format.
     * @returns The time string.
     */
    public toString(): string {
        const result = this.formatTimeOfDay(this._hours, this._minutes, this._seconds, this._fractionalSeconds);

        return result;
    }

    private formatTimeOfDay(hours: number, minutes: number, seconds: number, fractionalSeconds: number): string {
        const negative = hours < 0 || minutes < 0 || seconds < 0 || fractionalSeconds < 0;
        const sign = negative ? '-' : '';

        const result = sign + [hours, minutes, seconds]
            .map((x, i) => Math.abs(x).toString().padStart(partLengths[i], '0'))
            .join(':')
            + Math.abs(fractionalSeconds).toString().substring(1);

        return result;
    }

    private parseDate(source: Date): void {
        const hms = source.toTimeString().split(' ').shift();
        const fs = source.getMilliseconds() / 1000;
        this._fractionalSeconds = fs;

        this.parseHourMinuteSecond(hms);
    }

    private parseString(source: string): void {
        if (!TimeOfDayRegex.test(source)) {
            throw new TypeError(`'${source}' is not a valid ${EdmTimeOfDay.name}`);
        }

        const [hms, ms] = source.split('.');
        this._fractionalSeconds = Number('.' + (ms ?? 0));

        this.parseHourMinuteSecond(hms);
    }

    private parseHourMinuteSecond(source: string): void {
        const [hours, minutes, seconds] = source.split(':').map(x => Number(x));
        this.updateTimeOfDay(hours, minutes, seconds ?? 0, this._fractionalSeconds);
    }

    private updateTimeOfDay(hours: number, minutes: number, seconds: number, fractionalSeconds: number): void {
        // adding fractional seconds here could cause implicit rounding to occur if >= 16383.
        const totalSeconds = ((hours * 60 + minutes) * 60) + seconds;

        let secondsLeft = totalSeconds;
        [hours, minutes, seconds] = [3600, 60, 1].map(x => {
            const result = Math.trunc(secondsLeft / x);
            secondsLeft -= result * x;
            return result;
        });

        if (totalSeconds + fractionalSeconds < 0 || hours >= 24) {
            throw new TypeError(`'${this.formatTimeOfDay(hours, minutes, seconds, fractionalSeconds)}' is not a valid ${EdmTimeOfDay.name}`);
        }

        [this._hours, this._minutes, this._seconds, this._fractionalSeconds] = [hours, minutes, seconds, fractionalSeconds];
    }
}