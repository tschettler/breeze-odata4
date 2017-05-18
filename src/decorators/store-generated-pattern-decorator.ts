import { AnnotationDecorator } from "./annotation-decorator";
import { Edm } from "ts-odatajs";

export interface ExpressionWithStoreGeneratedPattern extends Edm.Base.NamedExpression {
    "annotation:StoreGeneratedPattern"?: string;
}

export class StoreGeneratedPatternDecorator implements AnnotationDecorator {
    annotation = 'StoreGeneratedPattern';

    decorate(expression: ExpressionWithStoreGeneratedPattern, annotation: Edm.Annotation): void {
        var value = annotation.string;

        expression['annotation:StoreGeneratedPattern'] = typeof value === "string" ? value : value.text;
    }
}