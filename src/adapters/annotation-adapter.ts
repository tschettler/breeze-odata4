import { MetadataAdapter } from "./metadata-adapter";
import { AnnotationDecorator } from "../decorators/annotation-decorator";
import { oData } from "ts-odatajs";
import { ClassRegistry } from "../class-registry";

export class AnnotationAdapter implements MetadataAdapter {
    decorators: AnnotationDecorator[] = [];

    constructor() {
        this.decorators = ClassRegistry.AnnotationDecorators.get();
     }

    adapt(schema: any): void {
        var annotations = schema.annotations || [];
        annotations.forEach(function (itemAnnotation) {
            var targetSplit = itemAnnotation.target.split('/');
            var entityTypeName = targetSplit[0];
            var propertyName = targetSplit[1];
            var shortTypeName = entityTypeName.split('.').pop();
            var entityType = oData.utils.lookupEntityType(shortTypeName, schema); // TODO: verify working, replaces getEntityType
            var property = this.getProperty(entityType, propertyName);

            itemAnnotation.annotation
                .forEach(annotation => { // term
                    var decorator = this.decorators
                        .find(p => {
                            return annotation.term.indexOf(`.${p.annotation}`) > -1;
                        });

                    decorator.decorate(property || entityType, annotation);
                });
        });
    }

    private getProperty(entityType, propertyName) {
        if (!propertyName) {
            return null;
        }

        var properties = entityType.property.concat(entityType.navigationProperty);
        var property = properties.find(prop => {
            return prop.name == propertyName;
        });

        return property;
    }
}
