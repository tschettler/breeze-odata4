import { AnnotationAdapter } from "./annotation-adapter";

export class StoreGeneratedPatternAdapter implements AnnotationAdapter {
    annotation = 'StoreGeneratedPattern';

    adapt(property: any, annotation: any): void {
        property['annotation:StoreGeneratedPattern'] = annotation.string;
    } 
}