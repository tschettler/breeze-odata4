
import { Edm } from 'ts-odatajs';

export interface AnnotationDecorator {
    annotation: string;
    decorate(expression: Edm.Base.Annotatable, annotation: Edm.Annotation): void;
}
