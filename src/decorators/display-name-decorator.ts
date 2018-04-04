import { Edm } from 'ts-odatajs';

import { AnnotationDecorator } from './annotation-decorator';

export interface ExpressionWithDisplayName extends Edm.Base.Annotatable {
    displayName?: string;
}

export class DisplayNameDecorator implements AnnotationDecorator {
    public canDecorate(annotation: Edm.Annotation): boolean {
        return annotation.term === 'Org.OData.Display.V1.DisplayName' || /.\.DisplayName$/.test(annotation.term);
    }

    public decorate(expression: ExpressionWithDisplayName, annotation: Edm.Annotation): void {
        const value = annotation.string;

        expression.displayName = typeof value === 'string' ? value : value.text;
    }
}
