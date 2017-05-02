
export interface AnnotationAdapter {
    annotation: string;
    adapt(property: any, annotation: any): void; 
}