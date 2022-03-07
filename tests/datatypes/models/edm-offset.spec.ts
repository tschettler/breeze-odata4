import { EdmOffset } from "../../../src/datatypes/models";

describe('EdmOffset', () => {
    describe('create', () => {
        it('should return instance with no parameter', () => {
            const result = EdmOffset.create();

            expect(result).toBeInstanceOf(EdmOffset);
        });

        it('should return instance with string', () => {
            const input = 'Z';
            const result = EdmOffset.create(input);

            expect(result).toBeInstanceOf(EdmOffset);
        });

        it('should return instance with EdmOffset', () => {
            const input = EdmOffset.create();
            const result = EdmOffset.create(input);

            expect(result).toBeInstanceOf(EdmOffset);
        });

        it('should throw error with offset greater than max', () => {
            const input = '+15:00';

            expect(() => EdmOffset.create(input)).toThrowError(`'${input}' is not a valid EdmOffset`);
        });

        it('should throw error with offset less than min', () => {
            const input = '-13:00';

            expect(() => EdmOffset.create(input)).toThrowError(`'${input}' is not a valid EdmOffset`);
        });

        it('should throw error with invalid string', () => {
            const input = 'abc';

            expect(() => EdmOffset.create(input)).toThrowError(`'${input}' is not a valid EdmOffset`);
        });
    });

    describe('totalMinutes', () => {
        const testCases = [
            {
                input: 'Z',
                expected: 0
            },
            {
                input: '00:00',
                expected: 0
            },
            {
                input: '-00:30',
                expected: -30
            },
            {
                input: '+06:00',
                expected: 360
            }
        ];
        testCases.forEach(test => {
            it(`should return ${test.expected} for '${test.input}'`, () => {
                const sut = EdmOffset.create(test.input);

                const result = sut.totalMinutes;

                expect(result).toEqual(test.expected);
            });
        });
    });

    describe('toString', () => {
        const testCases = [
            {
                input: 'Z',
                expected: 'Z'
            },
            {
                input: '00:00',
                expected: 'Z'
            },
            {
                input: '-00:30',
                expected: '-00:30'
            },
            {
                input: '06:00',
                expected: '+06:00'
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmOffset.create(test.input);

                const result = sut.toString();

                expect(result).toEqual(test.expected);
            });
        });
    });

    describe('sign', () => {
        const testCases = [
            {
                input: 'Z',
                expected: null
            },
            {
                input: '00:00',
                expected: null
            },
            {
                input: '-00:30',
                expected: '-'
            },
            {
                input: '06:00',
                expected: '+'
            },
            {
                input: '+06:00',
                expected: '+'
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmOffset.create(test.input);

                const result = sut.sign;

                expect(result).toEqual(test.expected);
            });
        });
    });

    describe('hour', () => {
        const testCases = [
            {
                input: 'Z',
                expected: 0
            },
            {
                input: '00:00',
                expected: 0
            },
            {
                input: '-00:30',
                expected: 0
            },
            {
                input: '-02:30',
                expected: -2
            },
            {
                input: '06:00',
                expected: 6
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmOffset.create(test.input);

                const result = sut.hour;

                expect(result).toEqual(test.expected);
            });
        });
    });

    describe('minute', () => {
        const testCases = [
            {
                input: 'Z',
                expected: 0
            },
            {
                input: '00:00',
                expected: 0
            },
            {
                input: '-00:30',
                expected: -30
            },
            {
                input: '+12:45',
                expected: 45
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmOffset.create(test.input);

                const result = sut.minute;

                expect(result).toEqual(test.expected);
            });
        });
    });

    describe('MinValue', () => {
        let sut: Readonly<EdmOffset>;

        beforeAll(() => {
            sut = EdmOffset.MinValue;
        });

        it('sign should be negative', () => {
            expect(sut.sign).toBe('-');
        });

        it('hour should be -12', () => {
            expect(sut.hour).toEqual(-12);
        });

        it('minute should be zero', () => {
            expect(sut.minute).toEqual(0);
        });

        it('toString should return correct value', () => {
            const result = sut.toString();
            expect(result).toEqual('-12:00');
        });
    });

    describe('MaxValue', () => {
        let sut: Readonly<EdmOffset>;

        beforeAll(() => {
            sut = EdmOffset.MaxValue;
        });

        it('sign should be negative', () => {
            expect(sut.sign).toBe('+');
        });

        it('hour should be 14', () => {
            expect(sut.hour).toEqual(14);
        });

        it('minute should be zero', () => {
            expect(sut.minute).toEqual(0);
        });

        it('toString should return correct value', () => {
            const result = sut.toString();
            expect(result).toEqual('+14:00');
        });
    });
});
