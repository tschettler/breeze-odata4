import { MetadataAdapter } from './metadata-adapter';
import { AnnotationDecorator } from '../decorators/annotation-decorator';
import { Edm, oData, Edmx } from 'ts-odatajs';
import { ClassRegistry } from '../class-registry';

export class AnnotationAdapter implements MetadataAdapter {
    private metadata: Edmx.DataServices;
    public decorators: AnnotationDecorator[] = [];

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
            const targetSplit = itemAnnotation.target.split('/');
            const entityTypeName = targetSplit[0];
            const propertyName = targetSplit[1];
            const entityType = oData.utils.lookupEntityType(entityTypeName, this.metadata.schema);

            if (entityType === null) {
                throw new Error(`Could not find entity with type name ${entityTypeName}`);
            }

            const property = this.getProperty(entityType, propertyName);

            itemAnnotation.annotation
                .forEach((annotation: Edm.Annotation) => { // term
                    const decorator = this.decorators
                        .find(d => {
                            return annotation.term.indexOf(`.${d.annotation}`) > -1;
                        });

                    decorator.decorate(property || entityType, annotation);
                });
        });
    }

    private getProperty(entityType: Edm.EntityType, propertyName: string): Edm.Base.NamedExpression {
        if (!propertyName) {
            return null;
        }

        const properties: Edm.Base.NamedExpression[] = entityType.property.concat(entityType.navigationProperty);
        const property = properties.find((prop: any) => {
            return prop.name === propertyName;
        });

        return property;
    }
}
