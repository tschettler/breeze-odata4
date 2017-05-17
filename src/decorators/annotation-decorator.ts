
import { Property, NavigationProperty, Annotation } from "ts-odatajs";

export interface StringAnnotation extends Annotation {
    string: string;
}

export interface AnnotationDecorator {
    annotation: string;
    decorate(property: NavigationProperty | Property, annotation: Annotation): void;
}