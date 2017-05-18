
import { Edm } from "ts-odatajs";

export interface AnnotationDecorator {
    annotation: string;
    decorate(expression: Edm.Base.NamedExpression, annotation: Edm.Annotation): void;
}