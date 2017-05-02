import { AnnotationDecorator } from "./annotation-decorator";

export class DisplayNameDecorator implements AnnotationDecorator {
    annotation = 'DisplayName';

    decorate(property: any, annotation: any): void{
        property.displayName = annotation.string;
    } 
}