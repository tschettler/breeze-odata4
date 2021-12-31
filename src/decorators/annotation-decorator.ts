import { Edm } from 'ts-odatajs';

export interface AnnotationDecorator {
    canDecorate(annotation: Edm.Annotation): boolean;
    decorate(expression: Edm.Base.Annotatable, annotation: Edm.Annotation): void;
}
