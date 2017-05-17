import { AnnotationDecorator } from "./annotation-decorator";
import { Edm } from "ts-odatajs";

export class DisplayNameDecorator implements AnnotationDecorator {
    annotation = 'DisplayName';

    decorate(property: any, annotation: Edm.Annotation): void {
        property.displayName = annotation.string instanceof String ? annotation.string : annotation.string.text;
    }
}