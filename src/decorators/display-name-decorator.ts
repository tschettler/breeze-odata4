import { AnnotationDecorator } from "./annotation-decorator";
import { Edm } from "ts-odatajs";

export interface ExpressionWithDisplayName extends Edm.Base.NamedExpression {
    displayName?: string;
}

export class DisplayNameDecorator implements AnnotationDecorator {
    annotation = 'DisplayName';

    decorate(expression: ExpressionWithDisplayName, annotation: Edm.Annotation): void {
        var value = annotation.string;
        
        expression.displayName = typeof value === "string" ? value : value.text;
    }
}