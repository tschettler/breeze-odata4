import { Predicate, PredicateContext, PredicateVisitor } from 'breeze-client';

/**
 * The OData4 predicate visitor.
 */
export class OData4PredicateVisitor implements PredicateVisitor {
    /**
     * Initializes the predicate visitor.
     */
    public static initialize(): void {
        const visitor = new OData4PredicateVisitor();
        Predicate.prototype.toODataFragment = function (context) {
            return this.visit(context, visitor);
        };
    }

    /**
     * Handles the pass-thru predicate.
     * @param this The PassthruPredicate instance.
     * @returns The predicate string.
     */
    public passthruPredicate(this: any): string {
        return this.value;
    }

    /**
     * Handles the unary predicate.
     * @param this The UnaryPredicate instance.
     * @param context The predicate context.
     * @returns The predicate string.
     */
    public unaryPredicate(this: any, context: PredicateContext): string {
        const predVal = this.pred.visit(context);
        const op = this.op.key;
        return `${op} (${predVal})`;
    }

    /**
     * Handles the binary predicate.
     * @param this The BinaryPredicate instance.
     * @param context The predicate context.
     * @returns The predicate string.
     */
    public binaryPredicate(this: any, context: PredicateContext): string {
        let expr1Val = this.expr1.visit(context);
        const expr2Val = this.expr2.visit(context);
        const prefix = context.prefix;
        if (prefix) {
            expr1Val = `${prefix}/${expr1Val}`;
        }

        const op = this.op.key;

        if (op === 'in') {
            const result = expr2Val
                .map(v => `(${expr1Val} eq ${v})`)
                .join(' or ');

            return result;
        } else if (this.op.isFunction) {
            return `${op}(${expr1Val},${expr2Val})`;
        } else {
            return `${expr1Val} ${op} ${expr2Val}`;
        }
    }

    /**
     * Handles the and/or predicate.
     * @param this The AndOrPredicate instance.
     * @param context The predicate context.
     * @returns The predicate string.
     */
    public andOrPredicate(this: any, context: PredicateContext): string {
        const op = this.op.key;
        const result = this.preds
            .map(pred => `(${pred.visit(context)})`)
            .join(` ${op} `);
        return result;
    }

    /**
     * Handles the any/all predicate.
     * @param this The AnyAllPredicate instance.
     * @param context The predicate context.
     * @returns The predicate string.
     */
    public anyAllPredicate(this: any, context: PredicateContext): string {
        const op = this.op.key;
        let exprVal = this.expr.visit(context);
        if (!this.pred.op) {
            return `${exprVal}/${op}()`;
        }
        let prefix = context.prefix;
        let idx = 1;
        if (prefix) {
            exprVal = `${prefix}/${exprVal}`;
            idx = Number(prefix.substring(1)) + 1;
        }

        prefix = `x${idx}`;

        // need to create a new context because of 'prefix'
        const newContext: PredicateContext = Object.assign({}, context, { entityType: this.expr.dataType, prefix: prefix });

        const newPredVal = this.pred.visit(newContext);
        return `${exprVal}/${op}(${prefix}: ${newPredVal})`;
    }

    /**
     * Handles the literal predicate expression.
     * @param this The LitExpr instance.
     * @returns The OData formatted value.
     */
    public litExpr(this: any) {
        if (Array.isArray(this.value)) {
            return this.value
                .map(v => this.dataType.fmtOData(v));
        } else {
            return this.dataType.fmtOData(this.value);
        }
    }

    /**
     * Handles the property expression predicate.
     * @param this The PropExpr instance.
     * @param context The predicate context.
     * @returns The predicate string.
     */
    public propExpr(this: any, context: PredicateContext): string {
        const entityType = context.entityType;
        // '/' is the OData path delimiter
        return entityType
            ? entityType.clientPropertyPathToServer(this.propertyPath, '/')
            : this.propertyPath;
    }

    /**
     * Handles the function expression predicate expression.
     * @param this The FnExpr instance.
     * @param context The predicate context.
     * @returns The predicate string.
     */
    public fnExpr(this: any, context: PredicateContext): string {
        const exprVals = this.exprs
            .map(expr => expr.visit(context));

        return `${this.fnName}(${exprVals})`;
    }
}
