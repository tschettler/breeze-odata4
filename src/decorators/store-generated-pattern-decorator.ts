import { Edm } from 'ts-odatajs';

import { AnnotationDecorator } from './annotation-decorator';

export interface ExpressionWithStoreGeneratedPattern extends Edm.Base.Annotatable {
    StoreGeneratedPattern?: string; // case matters here
}

export class StoreGeneratedPatternDecorator implements AnnotationDecorator {
    public canDecorate(annotation: Edm.Annotation): boolean {
        return /.\.StoreGeneratedPattern$/.test(annotation.term);
    }

    public decorate(expression: ExpressionWithStoreGeneratedPattern, annotation: Edm.Annotation): void {
        const value = annotation.string;

        expression.StoreGeneratedPattern = typeof value === 'string' ? value : value.text;
    }
}
