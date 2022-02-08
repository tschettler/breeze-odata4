import { DataType, EntityType, MetadataStore, Predicate, VisitContext } from 'breeze-client';

import { OData4PredicateVisitor } from './../src/breeze-odata4-predicateVisitor';

describe('OData4PredicateVisitor', () => {

    const sut = new OData4PredicateVisitor();

    describe('initialize', () => {
        it('should set toODataFragment', () => {
            const predicateProto: any = Predicate.prototype;
            const existingFunc = predicateProto.toODataFragment;
            OData4PredicateVisitor.initialize();
            const newFunc = predicateProto.toODataFragment;
            expect(newFunc).not.toBe(existingFunc);
        });

        it('should pass predicate visitor to visit when toODataFragment is called', () => {
            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore())
            };

            const mock = {
                visit: jest.fn()
            };

            OData4PredicateVisitor.initialize();
            (Predicate.prototype as any).toODataFragment.bind(mock)(context);
            expect(mock.visit).toHaveBeenCalledWith(context, expect.any(OData4PredicateVisitor));
        });

    });

    describe('passthruPredicate', () => {
        it('should return value', () => {
            const input = { value: 'test' };
            const result = sut.passthruPredicate.bind(input)();

            expect(result).toEqual(input.value);
        });
    });

    describe('unaryPredicate', () => {
        const input = {
            op: { key: 'testOp' },
            pred: { visit: jest.fn() }
        };


        beforeEach(() => {
            input.pred.visit.mockReset();
        });

        it('should call pred.visit', () => {
            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore())
            };

            const result = sut.unaryPredicate.bind(input)(context);

            expect(input.pred.visit).toHaveBeenCalledTimes(1);
        });

        it('should return formatted unary string', () => {
            const predicateValue = 'testValue';
            input.pred.visit.mockReturnValue(predicateValue);

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore())
            };

            const result = sut.unaryPredicate.bind(input)(context);

            expect(result).toEqual(`${input.op.key} (${predicateValue})`);
        });
    });

    describe('binaryPredicate', () => {
        const defaultOp = {
            key: 'in',
            isFunction: true
        };

        const mockVisitor1 = jest.fn();
        const mockVisitor2 = jest.fn();

        const input = {
            op: Object.assign({}, defaultOp),
            expr1: { visit: mockVisitor1 },
            expr2: { visit: mockVisitor2 }
        };

        beforeEach(() => {
            input.op = Object.assign({}, defaultOp);
            mockVisitor1.mockReset();
            mockVisitor2.mockReset();
        });

        it('should call expr1.visit', () => {
            input.op.key = 'max';
            const predValue1 = 'testValue';
            const predValue2 = 42;
            mockVisitor1.mockReturnValue(predValue1);
            mockVisitor2.mockReturnValue(predValue2);

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.binaryPredicate.bind(input)(context);

            expect(input.expr1.visit).toHaveBeenCalledTimes(1);
        });

        it('should call expr2.visit', () => {
            input.op.key = 'max';
            const predValue1 = 'testValue';
            const predValue2 = 42;
            mockVisitor1.mockReturnValue(predValue1);
            mockVisitor2.mockReturnValue(predValue2);

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.binaryPredicate.bind(input)(context);

            expect(input.expr2.visit).toHaveBeenCalledTimes(1);
        });

        it('should append prefix to first expression', () => {
            input.op.key = 'max';
            const predValue1 = 'testValue';
            const predValue2 = 42;
            mockVisitor1.mockReturnValue(predValue1);
            mockVisitor2.mockReturnValue(predValue2);

            const context = {
                entityType: new EntityType(new MetadataStore()),
                prefix: 'testPrefix'
            };

            const result = sut.binaryPredicate.bind(input)(context);

            expect(result).toEqual(`${input.op.key}(${context.prefix}/${predValue1},${predValue2})`);
        });

        it('should format in expression', () => {
            const predValue1 = 'testValue';
            const predValue2 = [1, 2];
            mockVisitor1.mockReturnValue(predValue1);
            mockVisitor2.mockReturnValue(predValue2);

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.binaryPredicate.bind(input)(context);

            expect(result).toEqual(predValue2.map(v => `(${predValue1} eq ${v})`).join(' or '));
        });

        it('should format function expression', () => {
            input.op.key = 'max';
            const predValue1 = 'testValue';
            const predValue2 = 42;
            mockVisitor1.mockReturnValue(predValue1);
            mockVisitor2.mockReturnValue(predValue2);

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.binaryPredicate.bind(input)(context);

            expect(result).toEqual(`${input.op.key}(${predValue1},${predValue2})`);
        });

        it('should format inequality expression', () => {
            input.op.key = 'gt';
            input.op.isFunction = false;
            const predValue1 = 'testValue';
            const predValue2 = 42;
            mockVisitor1.mockReturnValue(predValue1);
            mockVisitor2.mockReturnValue(predValue2);

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.binaryPredicate.bind(input)(context);

            expect(result).toEqual(`${predValue1} ${input.op.key} ${predValue2}`);
        });
    });

    describe('andOrPredicate', () => {
        const mockPred1 = { visit: jest.fn() };
        const mockPred2 = { visit: jest.fn() };

        const input = {
            op: { key: 'and' },
            preds: [mockPred1, mockPred2]
        };

        beforeEach(() => {
            mockPred1.visit.mockReset();
            mockPred2.visit.mockReset();
        });

        it('should call visit on each predicate', () => {
            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.andOrPredicate.bind(input)(context);
            input.preds.forEach(pred => expect(pred.visit).toHaveBeenCalledTimes(1));
        });

        it('should format and/or predicate', () => {
            const predValue1 = 'test1 eq 1';
            const predValue2 = 'test2 eq 2';
            mockPred1.visit.mockReturnValue(predValue1);
            mockPred2.visit.mockReturnValue(predValue2);

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.andOrPredicate.bind(input)(context);
            expect(result).toEqual(`(${predValue1}) ${input.op.key} (${predValue2})`);
        });
    });

    describe('anyAllPredicate', () => {
        const mockExpr = { visit: jest.fn() };
        const mockPred = {
            op: { key: 'any' },
            visit: jest.fn()
        };

        const input = {
            expr: mockExpr,
            op: { key: 'and' },
            pred: Object.assign({}, mockPred)
        };

        beforeEach(() => {
            input.pred = Object.assign({}, mockPred);
            mockExpr.visit.mockReset();
            mockPred.visit.mockReset();
        });

        it('should call expr.visit', () => {
            input.pred.op = null;

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.anyAllPredicate.bind(input)(context);
            expect(input.expr.visit).toHaveBeenCalledTimes(1);
        });

        it('should format expression with null pred.op', () => {
            input.pred.op = null;
            const predValue = 'testValue';
            mockExpr.visit.mockReturnValue(predValue);

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.anyAllPredicate.bind(input)(context);
            expect(result).toEqual(`${predValue}/${input.op.key}()`);
        });

        it('should call pred.visit', () => {
            const exprValue = 'testExpression';
            const predValue = 'testValue';
            mockExpr.visit.mockReturnValue(exprValue);
            mockPred.visit.mockReturnValue(predValue);

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.anyAllPredicate.bind(input)(context);
            expect(input.pred.visit).toHaveBeenCalledTimes(1);
        });

        it('should format expression with predicate operator', () => {
            const exprValue = 'testExpression';
            const predValue = 'testValue';
            mockExpr.visit.mockReturnValue(exprValue);
            mockPred.visit.mockReturnValue(predValue);

            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.anyAllPredicate.bind(input)(context);
            expect(result).toEqual(`${exprValue}/${input.op.key}(x1: ${predValue})`);
        });

        it('should format expression with predicate operator and prefix', () => {
            const exprValue = 'testExpression';
            const predValue = 'testValue';
            mockExpr.visit.mockReturnValue(exprValue);
            mockPred.visit.mockReturnValue(predValue);

            const context = {
                prefix: 'x1',
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.anyAllPredicate.bind(input)(context);
            expect(result)
                .toEqual(`${context.prefix}/${exprValue}/${input.op.key}(x${Number(context.prefix.substring(1)) + 1}: ${predValue})`);
        });
    });

    describe('litExpr', () => {
        it('should format value', () => {
            const input = {
                dataType: DataType.Boolean,
                value: 'true'
            };

            const result = sut.litExpr.bind(input)();
            const expected = Boolean(input.value);
            expect(result).toEqual(expected);
        });

        it('should format array values', () => {
            const input = {
                dataType: DataType.Boolean,
                value: ['true', 'false', 'true']
            };

            const result: boolean[] = sut.litExpr.bind(input)();
            const expected = Boolean(input.value);

            result.forEach(res => expect(res).toEqual(expect.any(Boolean)));
        });
    });

    describe('propExpr', () => {
        it('should format property expression with entity type', () => {

            const input = {
                propertyPath: 'Test.Property.Path'
            };
            const context: VisitContext = {
                entityType: new EntityType(new MetadataStore()),
            };

            const result = sut.propExpr.bind(input)(context);

            expect(result).toEqual(input.propertyPath.replace(/\./g, '/'));
        });

        it('should return property path without entity type', () => {
            const input = {
                propertyPath: 'Test.Property.Path'
            };
            const context: VisitContext = {
                entityType: <EntityType>null
            };

            const result = sut.propExpr.bind(input)(context);

            expect(result).toEqual(input.propertyPath);
        });
    });

    describe('fnExpr', () => {
        const expr1 = { visit: jest.fn() };
        const expr2 = { visit: jest.fn() };

        const input = {
            fnName: 'GetValues',
            exprs: [expr1, expr2]
        };

        beforeEach(() => {
            expr1.visit.mockReset();
            expr2.visit.mockReset();
        });

        it('should call visit for each expression', () => {
            const context: VisitContext = {
                entityType: <EntityType>null
            };

            const result = sut.fnExpr.bind(input)(context);

            input.exprs.forEach(expr => expect(expr.visit).toHaveBeenCalledTimes(1));
        });

        it('should format function expression', () => {
            const expr1Value = 1;
            const expr2Value = 2;
            expr1.visit.mockReturnValue(expr1Value);
            expr2.visit.mockReturnValue(expr2Value);
            const context: VisitContext = {
                entityType: <EntityType>null
            };

            const result = sut.fnExpr.bind(input)(context);
            expect(result).toEqual(`${input.fnName}(${expr1Value},${expr2Value})`);
        });
    });
});
