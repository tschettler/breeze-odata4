import { core } from 'breeze-client';
import { Edm } from 'ts-odatajs';

import { getDataType } from '../utilities';
import { AnnotationDecorator } from './annotation-decorator';

export interface Publication {
    attributionUrl?: string;
    documentationUrl?: string;
    imageUrl?: string;
    keywords?: string[]; // | string
    lastModified?: string;
    privacyPolicyUrl?: string;
    publisherId?: string;
    publisherName?: string;
    termsOfUseUrl?: string;
}

export interface ExpressionWithPublication extends Edm.Base.Annotatable {
    publication?: { [key: string]: any };
}

const PublicationTerm = 'Org.OData.Publication.V1.';

export class PublicationDecorator implements AnnotationDecorator {
    public canDecorate(annotation: Edm.Annotation): boolean {
        return annotation.term.startsWith(PublicationTerm);
    }

    public decorate(expression: ExpressionWithPublication, annotation: Edm.Annotation): void {
        const keys = Object.keys(annotation);
        core.arrayRemoveItem(keys, 'term', false);

        const valueKey = keys[0];
        const value = annotation[valueKey];

        const propName = annotation.term.replace(PublicationTerm, '');

        const dataType = getDataType(valueKey);
        const parsedValue = dataType.parse(value, 'string');

        expression.publication = expression.publication instanceof Object ? expression.publication : {};
        expression.publication[propName] = parsedValue;
    }
}
