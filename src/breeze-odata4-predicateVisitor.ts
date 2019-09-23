import { Predicate, PredicateContext, PredicateVisitor } from 'breeze-client';


export class OData4PredicateVisitor implements PredicateVisitor {
    public static initialize(): void {
        const visitor = new OData4PredicateVisitor();
        Predicate.prototype.toODataFragment = function (context) {
            return this.visit(context, visitor);
        };
    }

    public passthruPredicate(this: any): string {
        return this.value;
    }

    public unaryPredicate(this: any, context: PredicateContext): string {
        const predVal = this.pred.visit(context);
        const op = this.op.key;
        return `${op} (${predVal})`;
    }

    public binaryPredicate(this: any, context: any): string {
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

    public andOrPredicate(this: any, context: PredicateContext): string {
        const op = this.op.key;
        const result = this.preds
            .map(pred => `(${pred.visit(context)})`)
            .join(` ${op} `);
        return result;
    }

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

    public litExpr(this: any) {
        if (Array.isArray(this.value)) {
            return this.value
                .map(v => this.dataType.fmtOData(v));
        } else {
            return this.dataType.fmtOData(this.value);
        }
    }

    public propExpr(this: any, context: PredicateContext): string {
        const entityType = context.entityType;
        // '/' is the OData path delimiter
        return entityType
            ? entityType.clientPropertyPathToServer(this.propertyPath, '/')
            : this.propertyPath;
    }

    public fnExpr(this: any, context: PredicateContext): string {
        const exprVals = this.exprs
            .map(expr => expr.visit(context));

        return `${this.fnName}(${exprVals})`;
    }
}

