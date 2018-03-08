import { Edm } from 'ts-odatajs';

import { AnnotationDecorator } from './annotation-decorator';

export interface ExpressionWithStoreGeneratedPattern extends Edm.Base.Annotatable {
    'annotation:StoreGeneratedPattern'?: string;
}

export class StoreGeneratedPatternDecorator implements AnnotationDecorator {
    public annotation = 'StoreGeneratedPattern';

    public decorate(expression: ExpressionWithStoreGeneratedPattern, annotation: Edm.Annotation): void {
        const value = annotation.string;

        expression['annotation:StoreGeneratedPattern'] = typeof value === 'string' ? value : value.text;
    }
}
