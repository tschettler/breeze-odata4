import { EdmDate } from './edm-date';
import { EdmOffset } from './edm-offset';
import { EdmTimeOfDay } from './edm-timeofday';

/**
 * ABNF format: 
 * > dateTimeOffsetValue = year "-" month "-" day "T" timeOfDayValue ( "Z" / SIGN hour ":" minute )
 */
const DateTimeOffsetRegex = new RegExp(/^(.+)T(.+)((?:\+|-)\d{2}:\d{2}|Z)$/);

/**
 * @classdesc Edm date time offset
 */
export class EdmDateTimeOffset {
    protected constructor(source: Date | string) {
        const dateString = source instanceof Date ? source.toISOString() : source.toString();
        this.parseDateTime(dateString);
    }

    /**
     * Gets or sets the date fragment.
     */
    public date: EdmDate;


    /**
     * Gets or sets the time fragment.
     */
    public time: EdmTimeOfDay;

    /**
     * Gets or sets the offset fragment.
     */
    public offset: EdmOffset;

    /**
     * Gets a string representation of the date time offset.
     * @returns The date time offset string. 
     */
    public toString(): string {
        const result = `${this.date}T${this.time}${this.offset}`;

        return result;
    }

    /**
     * Creates an instance of @see EdmDateTimeOffset.
     * @summary Treats @see Date instances as UTC. Use a string for a local time value.
     * @param [source] The date source. If source is already an EdmDateTimeOffset, it will be returned. Defaults to current date.
     * @returns An edm date time offset instance.
     */
    public static create(source: EdmDateTimeOffset | Date | string = new Date()): EdmDateTimeOffset {
        const result = source instanceof EdmDateTimeOffset
            ? source
            : source === null
                ? null
                :  new EdmDateTimeOffset(source);

        return result;
    }

    /**
     * Gets the current date time offset.
     */
    public static get now(): EdmDateTimeOffset {
        const result = new EdmDateTimeOffset(new Date());
        return result;
    }

    /**
     * Min edm date time offset value
     */
    public static readonly MinValue: Readonly<EdmDateTimeOffset> = new EdmDateTimeOffset('0001-01-01T00:00:00.000Z');

    /**
     * Max edm date time offset value
     */
    public static readonly MaxValue: Readonly<EdmDateTimeOffset> = new EdmDateTimeOffset('9999-12-31T23:59:59.999999999999Z');

    private parseDateTime(source: string): void {
        const matchResult = source.match(DateTimeOffsetRegex);
        if (!matchResult) {
            throw new TypeError(`'${source}' is not a valid ${EdmDateTimeOffset.name}`);
        }

        const [_, datePart, timePart, offsetPart] = matchResult;

        this.date = EdmDate.create(datePart);
        this.time = EdmTimeOfDay.create(timePart);
        this.offset = EdmOffset.create(offsetPart);
    }
}
