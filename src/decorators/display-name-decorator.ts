import { AnnotationDecorator, StringAnnotation } from "./annotation-decorator";
import { Annotation } from "ts-odatajs";

export class DisplayNameDecorator implements AnnotationDecorator {
    annotation = 'DisplayName';

    decorate(property: any, annotation: StringAnnotation): void {
        property.displayName = annotation.string;
    }
}