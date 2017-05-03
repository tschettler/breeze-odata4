export interface AnnotationDecorator {
    annotation: string;
    decorate(property: any, annotation: any): void;
}
