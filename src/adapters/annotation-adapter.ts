import { Edm, Edmx, oData } from 'ts-odatajs';

import { ClassRegistry } from '../class-registry';
import { AnnotationDecorator } from '../decorators/annotation-decorator';
import { MetadataAdapter } from './metadata-adapter';

export class AnnotationAdapter implements MetadataAdapter {
    private metadata: Edmx.DataServices;
    public decorators: AnnotationDecorator[] = [];

    private edmTypes: { [key: string]: string[] } = {
        action: ['parameter'],
        complexType: ['property', 'navigationProperty'],
        entityContainer: ['actionImport', 'entitySet', 'functionImport', 'singleton'],
        entityType: ['property', 'navigationProperty'],
        enumType: ['member'],
        function: ['parameter'],
        term: [],
        typeDefinition: []
    };

    constructor() {
        this.decorators = ClassRegistry.AnnotationDecorators.get();
    }

    public adapt(metadata: Edmx.DataServices): void {
        this.metadata = metadata;

        oData.utils.forEachSchema(this.metadata.schema, this.adaptSchema.bind(this));
    }

    public adaptSchema(schema: Edm.Schema): void {
        const annotations: Edm.Annotations[] = schema.annotations || [];

        annotations.forEach((itemAnnotation: Edm.Annotations) => {
            const annotatableType = this.getAnnotatableType(schema, itemAnnotation.target);

            if (annotatableType === null) {
                throw new Error(`Could not find element with type name ${itemAnnotation.target}`);
            }

            itemAnnotation.annotation
                .forEach((annotation: Edm.Annotation) => { // term
                    const decorator = this.decorators
                        .find(d => d.canDecorate(annotation));

                    if (!decorator) {
                        return;
                    }

                    decorator.decorate(annotatableType, annotation);
                });
        });
    }

    private getAnnotatableType(schema: Edm.Schema, target: string): Edm.Base.Annotatable {
        const targetSplit = target.split('/');
        const typeName = targetSplit[0];
        const propertyName = targetSplit[1];

        let result: Edm.Base.Annotatable;
        let kind: string;
        // tslint:disable-next-line:forin
        for (const edmType in this.edmTypes) {
            kind = edmType;

            const schemaProperty = schema[kind];

            if (!schemaProperty) {
                continue;
            } else if (schemaProperty instanceof Array) {
                result = oData.utils.lookupInMetadata(typeName, this.metadata.schema, kind);
            } else if (`${schema.namespace}.${(<Edm.Base.NamedExpression>schemaProperty).name}` === typeName) {
                result = schemaProperty;
            }
            if (result) {
                break;
            }
        }

        if (!propertyName) {
            return result;
        }

        const baseType = result;
        result = null;
        const properties = this.edmTypes[kind];

        properties.forEach(p => {
            if (result) {
                return;
            }
            let item: Edm.Base.NamedExpression;
            const typeProperty = baseType[p];

            if (!typeProperty) {
                return;
            }

            if (typeProperty instanceof Array) {
                item = (<Edm.Base.NamedExpression[]>typeProperty).find(e => e.name === propertyName);
            } else if (item.name === propertyName) {
                item = typeProperty;
            }

            if (item) {
                result = <Edm.Base.Annotatable>item;
            }
        });

        return result;
    }
}
