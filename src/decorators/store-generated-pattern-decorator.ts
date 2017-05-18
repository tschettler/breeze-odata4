import { AnnotationDecorator } from './annotation-decorator';
import { Edm } from 'ts-odatajs';

export interface ExpressionWithStoreGeneratedPattern extends Edm.Base.NamedExpression {
    'annotation:StoreGeneratedPattern'?: string;
}

export class StoreGeneratedPatternDecorator implements AnnotationDecorator {
    public annotation = 'StoreGeneratedPattern';

    public decorate(expression: ExpressionWithStoreGeneratedPattern, annotation: Edm.Annotation): void {
        const value = annotation.string;

        expression['annotation:StoreGeneratedPattern'] = typeof value === 'string' ? value : value.text;
    }
}
