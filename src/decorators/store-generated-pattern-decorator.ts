import { AnnotationDecorator, StringAnnotation } from "./annotation-decorator";

export class StoreGeneratedPatternDecorator implements AnnotationDecorator {
    annotation = 'StoreGeneratedPattern';

    decorate(property: any, annotation: StringAnnotation): void {
        property['annotation:StoreGeneratedPattern'] = annotation.string;
    }
}