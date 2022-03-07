import { EdmDate, EdmDateTimeOffset, EdmOffset, EdmTimeOfDay } from "../../../src/datatypes/models";

describe('EdmDateTimeOffset', () => {
    describe('create', () => {
        it('should return instance with no parameter', () => {
            const result = EdmDateTimeOffset.create();

            expect(result).toBeInstanceOf(EdmDateTimeOffset);
        });

        it('should return instance with EdmDateTimeOffset', () => {
            const input = EdmDateTimeOffset.create();

            const result = EdmDateTimeOffset.create(input);

            expect(result).toBe(input);
        });

        it('should create with date', () => {
            const input = new Date();

            const result = EdmDateTimeOffset.create(input);

            expect(result).toBeInstanceOf(EdmDateTimeOffset);
        });

        it('should create with date string', () => {
            const input = '2022-02-22T22:22:22Z';

            const result = EdmDateTimeOffset.create(input);

            expect(result).toBeInstanceOf(EdmDateTimeOffset);
        });

        it('should throw error with invalid date string', () => {
            const input = 'abc';

            expect(() => EdmDateTimeOffset.create(input)).toThrowError(`'${input}' is not a valid EdmDateTimeOffset`);
        });
    });

    describe('date', () => {
        it('should return date value', () => {
            const input = '2022-02-22T22:22:22Z';

            const result = EdmDateTimeOffset.create(input).date;

            const expected = EdmDate.create('2022-02-22');
            expect(result).toEqual(expected);
        });
    });

    describe('time', () => {
        it('should return time value', () => {
            const input = '2022-02-22T22:22:22Z';

            const result = EdmDateTimeOffset.create(input).time;

            const expected = EdmTimeOfDay.create('22:22:22');
            expect(result).toEqual(expected);
        });
    });

    
    describe('offset', () => {
        it('should return offset value', () => {
            const input = '2022-02-22T22:22:22Z';

            const result = EdmDateTimeOffset.create(input).offset;

            const expected = EdmOffset.create('Z');
            expect(result).toEqual(expected);
        });
    });

    describe('toString', () => {
        const testCases = [
            {
                input: '0001-01-01T00:00:00.000Z',
                expected: '0001-01-01T00:00:00Z'
            },
            {
                input: '9999-12-31T23:59:59.999999999999Z',
                expected: '9999-12-31T23:59:59.999999999999Z'
            },
            {
                input: new Date(Date.UTC(2022, 1, 22, 22, 22, 22, 222)),
                expected: '2022-02-22T22:22:22.222Z'
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmDateTimeOffset.create(test.input);

                const result = sut.toString();

                expect(result).toEqual(test.expected);
            });
        });
    });


    describe('MinValue', () => {
        let sut: Readonly<EdmDateTimeOffset>;

        beforeAll(() => {
            sut = EdmDateTimeOffset.MinValue;
        });

        it('year should be 1', () => {
            expect(sut.date.year).toEqual(1);
        });

        it('month should be 1', () => {
            expect(sut.date.month).toEqual(1);
        });

        it('day should be 1', () => {
            expect(sut.date.day).toEqual(1);
        });
        
        it('hours should be 0', () => {
            expect(sut.time.hours).toEqual(0);
        });

        it('minutes should be 0', () => {
            expect(sut.time.minutes).toEqual(0);
        });

        it('seconds should be 0', () => {
            expect(sut.time.seconds).toEqual(0);
        });

        it('fractionalSeconds should be 0', () => {
            expect(sut.time.seconds).toEqual(0);
        });

        it('offset should be Z', () => {
            expect(sut.offset.toString()).toEqual('Z');
        });

        it('toString should return correct value', () => {
            const result = sut.toString();
            expect(result).toEqual('0001-01-01T00:00:00Z');
        });
    });

    describe('MaxValue', () => {
        let sut: Readonly<EdmDateTimeOffset>;

        beforeAll(() => {
            sut = EdmDateTimeOffset.MaxValue;
        });

        it('year should be 9999', () => {
            expect(sut.date.year).toEqual(9999);
        });

        it('month should be 12', () => {
            expect(sut.date.month).toEqual(12);
        });

        it('day should be 31', () => {
            expect(sut.date.day).toEqual(31);
        });

        it('hours should be 23', () => {
            expect(sut.time.hours).toEqual(23);
        });

        it('minutes should be 59', () => {
            expect(sut.time.minutes).toEqual(59);
        });

        it('seconds should be 59', () => {
            expect(sut.time.seconds).toEqual(59);
        });

        it('fractionalSeconds should be .999999999999', () => {
            expect(sut.time.fractionalSeconds).toEqual(.999999999999);
        });

        it('offset should be Z', () => {
            expect(sut.offset.toString()).toEqual('Z');
        });

        it('toString should return correct value', () => {
            const result = sut.toString();
            expect(result).toEqual('9999-12-31T23:59:59.999999999999Z');
        });
    });

    describe('now', () => {
        let sut: Readonly<EdmDateTimeOffset>;
        let date: Date;

        beforeAll(() => {
            date  = new Date();
            sut = EdmDateTimeOffset.now;
        });

        it('year should be correct', () => {
            expect(sut.date.year).toEqual(date.getUTCFullYear());
        });

        it('month should be correct', () => {
            expect(sut.date.month).toEqual(date.getUTCMonth() + 1);
        });

        it('day should be correct', () => {
            expect(sut.date.day).toEqual(date.getUTCDate());
        });

        it('hours should be correct', () => {
            expect(sut.time.hours).toEqual(date.getUTCHours());
        });

        it('minutes should be correct', () => {
            expect(sut.time.minutes).toEqual(date.getUTCMinutes());
        });
    });
});