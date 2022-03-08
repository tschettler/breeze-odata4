import { EdmDuration } from "../../../src/datatypes/models";

describe('EdmDuration', () => {
    describe('create', () => {
        it('should return instance with no parameter', () => {
            const result = EdmDuration.create();

            expect(result).toBeInstanceOf(EdmDuration);
        });

        it('should return instance with string', () => {
            const input = 'P1DT43H24M33S';
            const result = EdmDuration.create(input);

            expect(result).toBeInstanceOf(EdmDuration);
        });

        it('should return instance with EdmDuration', () => {
            const input = EdmDuration.create();
            const result = EdmDuration.create(input);

            expect(result).toBeInstanceOf(EdmDuration);
        });


        it('should return null with null', () => {
            const input: string = null;

            const result = EdmDuration.create(input);
            
            expect(result).toBeNull();
        });

        const testCases = [
            {
                input: 'P1DT2H',
                comment: '1 day, 2 hours',
                isValid: true
            },
            {
                input: '-PT20M',
                comment: '20 minutes',
                isValid: true
            },
            {
                input: 'PT120M',
                comment: '120 minutes (the number of months can be more than 60)',
                isValid: true
            },
            {
                input: 'P0DT1H',
                comment: '1 hour (0 is permitted as a number, but is not required)',
                isValid: true
            },
            {
                input: 'P0D',
                comment: '0 days',
                isValid: true
            },
            {
                input: '-P60D',
                comment: 'minus 60 days',
                isValid: true
            },
            {
                input: 'PT1M30.5S',
                comment: '1 minute, 30.5 seconds',
                isValid: true
            },
            {
                input: 'P2Y6M5DT12H35M30S',
                comment: 'year and month components are not allowed',
                isValid: false
            },
            {
                input: 'P-20D',
                comment: 'the minus sign must appear first',
                isValid: false
            },
            {
                input: 'P20DT',
                comment: 'removes "T", since no time items are present, so "T" must not be present',
                isValid: true
            },
            {
                input: 'PT1HM3S',
                comment: 'no value is specified for minutes, so "M" must not be present',
                isValid: false
            },
            {
                input: 'P15.5D',
                comment: 'only the seconds can be expressed as a decimal',
                isValid: false
            },
            {
                input: 'P1D2H',
                comment: '"T" must be present to separate days and hours',
                isValid: false
            },
            {
                input: '1DT2H',
                comment: '"P" must always be present',
                isValid: false
            },
            {
                input: 'PT15M5H',
                comment: 'hours must appear before minutes',
                isValid: false
            },
            {
                input: 'P',
                comment: 'uses default because at least one number and designator are required',
                isValid: true
            },
            {
                input: 'PT15.SP',
                comment: 'at least one digit must follow the decimal point if it appears',
                isValid: false
            }
        ];
        testCases.forEach(test => {
            it(`${test.isValid ? 'should not' : 'should'} throw error with ${test.input}: ${test.comment}`, () => {
                const assertion = expect(() => EdmDuration.create(test.input));

                test.isValid
                    ? assertion.not.toThrow()
                    : assertion.toThrowError(`'${test.input}' is not a valid EdmDuration`);
            });
        });
    });

    describe('days', () => {
        const testCases = [
            {
                input: 'P10D',
                expected: 10
            },
            {
                input: '-P10D',
                expected: -10
            },
            {
                input: 'PT10S',
                expected: 0
            },
            {
                input: 'P1DT43H24M33S',
                expected: 2
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmDuration.create(test.input);

                const result = sut.days;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmDuration.create();

            sut.days = 4;

            expect(sut.days).toBe(4);
        });
    });

    describe('hours', () => {
        const testCases = [
            {
                input: 'P10D',
                expected: 0
            },
            {
                input: 'PT10H',
                expected: 10
            },
            {
                input: '-PT10H',
                expected: -10
            },
            {
                input: 'P1DT43H24M33S',
                expected: 19
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmDuration.create(test.input);

                const result = sut.hours;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmDuration.create();

            sut.hours = 4;

            expect(sut.hours).toBe(4);
        });
    });

    describe('minutes', () => {
        const testCases = [
            {
                input: 'P10D',
                expected: 0
            },
            {
                input: 'PT10M',
                expected: 10
            },
            {
                input: '-PT10M',
                expected: -10
            },
            {
                input: 'P1DT43H24M33S',
                expected: 24
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmDuration.create(test.input);

                const result = sut.minutes;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmDuration.create();

            sut.minutes = 4;

            expect(sut.minutes).toBe(4);
        });
    });

    describe('seconds', () => {
        const testCases = [
            {
                input: 'P10D',
                expected: 0
            },
            {
                input: 'PT10S',
                expected: 10
            },
            {
                input: '-PT10S',
                expected: -10
            },
            {
                input: 'P1DT43H24M33S',
                expected: 33
            },
            {
                input: 'P1DT43H24M59.999999999999S',
                expected: 59.999999999999
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmDuration.create(test.input);

                const result = sut.seconds;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmDuration.create();

            sut.seconds = 4;

            expect(sut.seconds).toBe(4);
        });
    });

    describe('totalSeconds', () => {
        const testCases = [
            {
                input: 'P10D',
                expected: 864000
            },
            {
                input: 'PT10S',
                expected: 10
            },
            {
                input: '-P10D',
                expected: -864000
            },
            {
                input: 'P1DT43H24M33S',
                expected: 242673
            },
            {
                input: 'P1DT43H24M59.99999999999S',
                expected: 242700 // can't do 242699.99999999999
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmDuration.create(test.input);

                const result = sut.totalSeconds;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmDuration.create();

            sut.totalSeconds = 445645;

            expect(sut.totalSeconds).toBe(445645);
        });
    });

    describe('toString', () => {
        const testCases = [
            {
                input: 'P1DT2H',
                expected: 'P1DT2H'
            },
            {
                input: '-PT20M',
                expected: '-PT20M'
            },
            {
                input: 'PT120M',
                expected: 'PT2H'
            },
            {
                input: 'P0DT1H',
                expected: 'PT1H'
            },
            {
                input: 'P0D',
                expected: 'P0D'
            },
            {
                input: '-P60D',
                expected: '-P60D'
            },
            {
                input: 'PT1M30.5S',
                expected: 'PT1M30.5S'
            },
            {
                input: 'P20DT',
                expected: 'P20D'
            },
            {
                input: 'P',
                expected: 'P0D'
            }
        ];
        testCases.forEach(test => {
            it(`should return '${test.expected}' for '${test.input}'`, () => {
                const sut = EdmDuration.create(test.input);

                const result = sut.toString();

                expect(result).toEqual(test.expected);
            });
        });
    });
});
