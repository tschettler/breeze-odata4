import { Edm } from 'ts-odatajs';

import { AnnotationDecorator } from './annotation-decorator';

export interface ExpressionWithDescription extends Edm.Base.Annotatable {
    description?: string;
}

export class DescriptionDecorator implements AnnotationDecorator {
    public terms = ['Org.OData.Display.V1.Description', 'Org.OData.Core.V1.Description'];

    public canDecorate(annotation: Edm.Annotation): boolean {
        return this.terms.includes(annotation.term);
    }

    public decorate(expression: ExpressionWithDescription, annotation: Edm.Annotation): void {
        const value = annotation.string;

        expression.description = typeof value === 'string' ? value : value.text;
    }
}
