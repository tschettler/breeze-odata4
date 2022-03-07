import { EdmDate } from "../../../src/datatypes/models";

describe('EdmDate', () => {

    describe('create', () => {
        it('should return instance with no parameter', () => {
            const result = EdmDate.create();

            expect(result).toBeInstanceOf(EdmDate);
        });

        it('should return instance with EdmDate', () => {
            const input = EdmDate.create();

            const result = EdmDate.create(input);

            expect(result).toBe(input);
        });

        it('should create with date', () => {
            const input = new Date();

            const result = EdmDate.create(input);

            expect(result).toBeInstanceOf(EdmDate);
        });

        it('should create with date string', () => {
            const input = '2022-02-17';

            const result = EdmDate.create(input);

            expect(result).toBeInstanceOf(EdmDate);
        });

        it('should create with long date string', () => {
            const input = '2/22/2022 22:22:22';

            const result = EdmDate.create(input);

            expect(result).toBeInstanceOf(EdmDate);
        });

        it('should throw error with invalid date string', () => {
            const input = 'abc';

            expect(() => EdmDate.create(input)).toThrowError(`'${input}' is not a valid EdmDate`);
        });
    });

    describe('year', () => {
        const testCases = [
            {
                name: 'should return year',
                input: '2022-11-23',
                expected: 2022
            },
            {
                name: 'should allow negative values',
                input: '-5876-11-23',
                expected: -5876
            },
            {
                name: 'should allow zero',
                input: '0000-11-23',
                expected: 0
            },
            {
                name: 'should increment year correctly',
                input: '2022-14-23',
                expected: 2023
            }
        ];
        testCases.forEach(test => {
            it(test.name, () => {
                const sut = EdmDate.create(test.input);

                const result = sut.year;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmDate.create();

            sut.year = 2022;

            expect(sut.year).toBe(2022);
        });

        it('should not allow setting above max', () => {
            const sut = EdmDate.create(new Date(8640000000000000));

            expect(() => sut.year += 1).toThrowError('\'275761-09-13\' is not a valid EdmDate');
        });
    });

    describe('month', () => {
        const testCases = [
            {
                name: 'should return month',
                input: '2022-11-23',
                expected: 11
            },
            {
                name: 'should decrement month correctly',
                input: '2022-00-23',
                expected: 12
            },
            {
                name: 'should increment month correctly',
                input: '2022-13-23',
                expected: 1
            }
        ];
        testCases.forEach(test => {
            it(test.name, () => {
                const sut = EdmDate.create(test.input);

                const result = sut.month;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmDate.create();

            sut.month = 2;

            expect(sut.month).toBe(2);
        });
    });

    describe('day', () => {
        const testCases = [
            {
                name: 'should return day',
                input: '2022-11-23',
                expected: 23
            },
            {
                name: 'should decrement day correctly',
                input: '2022-11-00',
                expected: 31
            },
            {
                name: 'should increment day correctly',
                input: '2022-11-31',
                expected: 1
            }
        ];
        testCases.forEach(test => {
            it(test.name, () => {
                const sut = EdmDate.create(test.input);

                const result = sut.day;

                expect(result).toEqual(test.expected);
            });
        });

        it('should allow setting value', () => {
            const sut = EdmDate.create();

            sut.day = 3;

            expect(sut.day).toBe(3);
        });
    });

    describe('toString', () => {
        const testCases = [
            {
                name: 'should return correct value with EdmDate',
                input: EdmDate.create('2022-11-23'),
                expected: '2022-11-23'
            },
            {
                name: 'should return correct value with Date',
                input: new Date('2022-11-23'),
                expected: '2022-11-23'
            },
           {
                name: 'should return correct value with string',
                input: '2022-11-23',
                expected: '2022-11-23'
            },
            {
                name: 'should return correct value with negative year',
                input: '-5876-11-23',
                expected: '-5876-11-23'
            },
            {
                name: 'should return correct value for zero year',
                input: '0000-01-01',
                expected: '0000-01-01'
            },
            {
                name: 'should return correct value for incremented year',
                input: '2022-14-23',
                expected: '2023-02-23'
            }
        ];
        testCases.forEach(test => {
            it(test.name, () => {
                const sut = EdmDate.create(test.input);

                const result = sut.toString();

                expect(result).toEqual(test.expected);
            });
        });
    });

    describe('MinValue', () => {
        let sut: Readonly<EdmDate>;

        beforeAll(() => {
            sut = EdmDate.MinValue;
        });

        it('year should be -271821', () => {
            expect(sut.year).toEqual(-271821);
        });

        it('month should be 4', () => {
            expect(sut.month).toEqual(4);
        });

        it('day should be 20', () => {
            expect(sut.day).toEqual(20);
        });

        it('toString should return correct value', () => {
            const result = sut.toString();
            expect(result).toEqual('-271821-04-20');
        });
    });

    describe('MaxValue', () => {
        let sut: Readonly<EdmDate>;

        beforeAll(() => {
            sut = EdmDate.MaxValue;
        });

        it('year should be 275760', () => {
            expect(sut.year).toEqual(275760);
        });

        it('month should be 9', () => {
            expect(sut.month).toEqual(9);
        });

        it('day should be 13', () => {
            expect(sut.day).toEqual(13);
        });

        it('toString should return correct value', () => {
            const result = sut.toString();
            expect(result).toEqual('275760-09-13');
        });
    });
});