import { EdmTimeOfDay } from "../../../src/datatypes/models";

describe('EdmTimeOfDay', () => {
    describe('create', () => {
        it('should return instance with no parameter', () => {
            const result = EdmTimeOfDay.create();

            expect(result).toBeInstanceOf(EdmTimeOfDay);
        });

        it('should return instance with string', () => {
            const input = '01:30';
            const result = EdmTimeOfDay.create(input);

            expect(result).toBeInstanceOf(EdmTimeOfDay);
        });

        it('should return instance with EdmTimeOfDay', () => {
            const input = EdmTimeOfDay.create();
            const result = EdmTimeOfDay.create(input);

            expect(result).toBeInstanceOf(EdmTimeOfDay);
        });

        it('should return instance with Date', () => {
            const input = new Date();
            const result = EdmTimeOfDay.create(input);

            expect(result).toBeInstanceOf(EdmTimeOfDay);
        });

        it('should throw error with value greater than max', () => {
            const input = '25:00';

            expect(() => EdmTimeOfDay.create(input)).toThrowError('\'25:00:00.000\' is not a valid EdmTimeOfDay');
        });

        it('should return null with null', () => {
            const input: string = null;

            const result = EdmTimeOfDay.create(input);

            expect(result).toBeNull();
        });

        it('should throw error with invalid string', () => {
            const input = 'abc';

            expect(() => EdmTimeOfDay.create(input)).toThrowError(`'${input}' is not a valid EdmTimeOfDay`);
        });
    });

    describe('hours', () => {
        const testCases = [
            {
                input: '00:00',
                expected: 0
            },
            {
                input: '12:30',
                expected: 12
            },
            {
                input: new Date(2022, 2, 2, 22, 22, 22, 222),
                expected: 22
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmTimeOfDay.create(test.input);

                const result = sut.hours;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmTimeOfDay.create();

            sut.hours = 4;

            expect(sut.hours).toBe(4);
        });

        it('should not allow setting below min', () => {
            const sut = EdmTimeOfDay.create();

            expect(() => sut.hours -= 1).toThrowError('\'-01:00:00.000\' is not a valid EdmTimeOfDay');
        });

        it('should not allow setting above max', () => {
            const sut = EdmTimeOfDay.create('23:59');

            expect(() => sut.hours += 1).toThrowError('\'24:59:00.000\' is not a valid EdmTimeOfDay');
        });
    });


    describe('minutes', () => {
        const testCases = [
            {
                input: '00:00',
                expected: 0
            },
            {
                input: '12:30',
                expected: 30
            },
            {
                input: new Date(2022, 2, 2, 22, 22, 22, 222),
                expected: 22
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmTimeOfDay.create(test.input);

                const result = sut.minutes;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmTimeOfDay.create();

            sut.minutes = 4;

            expect(sut.minutes).toBe(4);
        });

        it('should not allow setting below min', () => {
            const sut = EdmTimeOfDay.create();

            expect(() => sut.minutes -= 1).toThrowError('\'-00:01:00.000\' is not a valid EdmTimeOfDay');
        });

        it('should not allow setting above max', () => {
            const sut = EdmTimeOfDay.create('23:59');

            expect(() => sut.minutes += 1).toThrowError('\'24:00:00.000\' is not a valid EdmTimeOfDay');
        });
    });

    describe('seconds', () => {
        const testCases = [
            {
                input: '00:00',
                expected: 0
            },
            {
                input: '12:30:06',
                expected: 6
            },
            {
                input: new Date(2022, 2, 2, 22, 22, 22, 222),
                expected: 22
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmTimeOfDay.create(test.input);

                const result = sut.seconds;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmTimeOfDay.create();

            sut.seconds = 4;

            expect(sut.seconds).toBe(4);
        });

        it('should not allow setting below min', () => {
            const sut = EdmTimeOfDay.create();

            expect(() => sut.seconds -= 1).toThrowError('\'-00:00:01.000\' is not a valid EdmTimeOfDay');
        });

        it('should not allow setting above max', () => {
            const sut = EdmTimeOfDay.create('23:59:59');

            expect(() => sut.seconds += 1).toThrowError('\'24:00:00.000\' is not a valid EdmTimeOfDay');
        });
    });

    describe('fractionalSeconds', () => {
        const testCases = [
            {
                input: '00:00',
                expected: 0
            },
            {
                input: '12:30:06.999999999999',
                expected: .999999999999
            },
            {
                input: new Date(2022, 2, 2, 22, 22, 22, 222),
                expected: .222
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmTimeOfDay.create(test.input);

                const result = sut.fractionalSeconds;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmTimeOfDay.create();

            sut.fractionalSeconds = .4;

            expect(sut.fractionalSeconds).toBe(.4);
        });

        it('should not allow setting below min', () => {
            const sut = EdmTimeOfDay.create();

            expect(() => sut.fractionalSeconds -= .001).toThrowError('\'-00:00:00.001\' is not a valid EdmTimeOfDay');
        });

        it('should not allow setting above max', () => {
            const sut = EdmTimeOfDay.create('23:59:59.999');

            expect(() => sut.fractionalSeconds += .001).toThrowError('\'24:00:00.000\' is not a valid EdmTimeOfDay');
        });
    });

    describe('toString', () => {
        const testCases = [
            {
                input: '00:00',
                expected: '00:00:00.000'
            },
            {
                input: '12:30:06.999999999999',
                expected: '12:30:06.999999999999'
            },
            {
                input: new Date(2022, 2, 2, 22, 22, 22, 222),
                expected: '22:22:22.222'
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmTimeOfDay.create(test.input);

                const result = sut.toString();

                expect(result).toEqual(test.expected);
            });
        });
    });


    describe('MinValue', () => {
        let sut: Readonly<EdmTimeOfDay>;

        beforeAll(() => {
            sut = EdmTimeOfDay.MinValue;
        });

        it('hours should be 0', () => {
            expect(sut.hours).toEqual(0);
        });

        it('minutes should be 0', () => {
            expect(sut.minutes).toEqual(0);
        });

        it('seconds should be 0', () => {
            expect(sut.seconds).toEqual(0);
        });

        it('fractionalSeconds should be 0', () => {
            expect(sut.seconds).toEqual(0);
        });

        it('toString should return correct value', () => {
            const result = sut.toString();
            expect(result).toEqual('00:00:00.000');
        });
    });

    describe('MaxValue', () => {
        let sut: Readonly<EdmTimeOfDay>;

        beforeAll(() => {
            sut = EdmTimeOfDay.MaxValue;
        });

        it('hours should be 23', () => {
            expect(sut.hours).toEqual(23);
        });

        it('minutes should be 59', () => {
            expect(sut.minutes).toEqual(59);
        });

        it('seconds should be 59', () => {
            expect(sut.seconds).toEqual(59);
        });

        it('fractionalSeconds should be .999999999999', () => {
            expect(sut.fractionalSeconds).toEqual(.999999999999);
        });

        it('toString should return correct value', () => {
            const result = sut.toString();
            expect(result).toEqual('23:59:59.999999999999');
        });
    });
});