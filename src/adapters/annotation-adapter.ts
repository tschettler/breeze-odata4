import { MetadataAdapter } from "./metadata-adapter";
import { AnnotationDecorator } from "../decorators/annotation-decorator";
import { Edm, oData, Edmx } from "ts-odatajs";
import { ClassRegistry } from "../class-registry";

export class AnnotationAdapter implements MetadataAdapter {
    private metadata: Edmx.DataServices;
    decorators: AnnotationDecorator[] = [];

    constructor() {
        this.decorators = ClassRegistry.AnnotationDecorators.get();
    }

    adapt(metadata: Edmx.DataServices): void {
        this.metadata = metadata;

        oData.utils.forEachSchema(this.metadata.schema, this.adaptSchema.bind(this));
    }

    adaptSchema(schema: Edm.Schema): void {
        const annotations: Edm.Annotations[] = schema.annotations || [];

        annotations.forEach((itemAnnotation: Edm.Annotations) => {
            var targetSplit = itemAnnotation.target.split('/');
            var entityTypeName = targetSplit[0];
            var propertyName = targetSplit[1];
            var entityType = oData.utils.lookupEntityType(entityTypeName, this.metadata.schema);

            if (entityType === null) {
                throw new Error(`Could not find entity with type name ${entityTypeName}`);
            }

            var property = this.getProperty(entityType, propertyName);

            itemAnnotation.annotation
                .forEach((annotation: Edm.Annotation) => { // term
                    var decorator = this.decorators
                        .find(p => {
                            return annotation.term.indexOf(`.${p.annotation}`) > -1;
                        });

                    decorator.decorate(property || entityType, annotation);
                });
        });
    }

    private getProperty(entityType: Edm.EntityType, propertyName: string): Edm.BaseProperty {
        if (!propertyName) {
            return null;
        }

        var properties: Edm.BaseProperty[] = entityType.property.concat(entityType.navigationProperty);
        var property = properties.find((prop: any) => {
            return prop.name == propertyName;
        });

        return property;
    }
}
