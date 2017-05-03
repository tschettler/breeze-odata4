import { AnnotationDecorator } from "./annotation-decorator";
export declare class DisplayNameDecorator implements AnnotationDecorator {
    annotation: string;
    decorate(property: any, annotation: any): void;
}
