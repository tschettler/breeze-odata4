import { Edm } from 'ts-odatajs';

import { AnnotationDecorator } from './annotation-decorator';

export interface ExpressionWithDisplayName extends Edm.Base.Annotatable {
    displayName?: string;
}

export class DisplayNameDecorator implements AnnotationDecorator {
    public annotation = 'DisplayName';

    public decorate(expression: ExpressionWithDisplayName, annotation: Edm.Annotation): void {
        const value = annotation.string;

        expression.displayName = typeof value === 'string' ? value : value.text;
    }
}
