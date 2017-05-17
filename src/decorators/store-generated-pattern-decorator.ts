import { AnnotationDecorator } from "./annotation-decorator";
import { Edm } from "ts-odatajs";

export class StoreGeneratedPatternDecorator implements AnnotationDecorator {
    annotation = 'StoreGeneratedPattern';

    decorate(property: any, annotation: Edm.Annotation): void {
        property['annotation:StoreGeneratedPattern'] = annotation.string instanceof String ? annotation.string : annotation.string.text;
    }
}