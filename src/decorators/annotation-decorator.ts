
import { Edm } from "ts-odatajs";

export interface AnnotationDecorator {
    annotation: string;
    decorate(property: any, annotation: Edm.Annotation): void;
}