import { MetadataAdapter } from "./metadata-adapter";
import { AnnotationDecorator } from "../decorators/annotation-decorator";
import { oData } from "ts-odatajs";
import { ClassRegistry } from "../class-registry";

export class AnnotationAdapter implements MetadataAdapter {
    private metadata: any;
    decorators: AnnotationDecorator[] = [];

    constructor() {
        this.decorators = ClassRegistry.AnnotationDecorators.get();
    }

    adapt(metadata: any): void {
        this.metadata = metadata;

        oData.utils.forEachSchema(this.metadata.schema, this.adaptSchema.bind(this));
    }

    adaptSchema(schema: any): void {
        const annotations: any[] = schema.annotations || [];

        annotations.forEach((itemAnnotation: any) => {
            var targetSplit = itemAnnotation.target.split('/');
            var entityTypeName = targetSplit[0];
            var propertyName = targetSplit[1];
            var entityType = oData.utils.lookupEntityType(entityTypeName, this.metadata.schema);

            if (entityType === null) {
                throw new Error(`Could not find entity with type name ${entityTypeName}`);
            }

            var property = this.getProperty(entityType, propertyName);

            itemAnnotation.annotation
                .forEach((annotation: any) => { // term
                    var decorator = this.decorators
                        .find(p => {
                            return annotation.term.indexOf(`.${p.annotation}`) > -1;
                        });

                    decorator.decorate(property || entityType, annotation);
                });
        });
    }

    private getProperty(entityType: any, propertyName: string): any {
        if (!propertyName) {
            return null;
        }

        var properties = entityType.property.concat(entityType.navigationProperty);
        var property = properties.find((prop: any) => {
            return prop.name == propertyName;
        });

        return property;
    }
}
