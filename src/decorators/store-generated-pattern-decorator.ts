import { AnnotationDecorator } from "./annotation-decorator";

export class StoreGeneratedPatternDecorator implements AnnotationDecorator {
    annotation = 'StoreGeneratedPattern';

    decorate(property: any, annotation: any): void {
        property['annotation:StoreGeneratedPattern'] = annotation.string;
    } 
}