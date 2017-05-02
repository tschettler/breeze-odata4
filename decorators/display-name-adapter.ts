import { AnnotationAdapter } from "./annotation-adapter";

export class DisplayNameAdapter implements AnnotationAdapter {
    annotation = 'DisplayName';

    adapt(property: any, annotation: any): void{
        property.displayName = annotation.string;
    } 
}