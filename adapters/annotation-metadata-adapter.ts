import { MetadataAdapter } from "./metadata-adapter";
import { AnnotationAdapter } from "../annotation/annotation-adapter";
import { oData } from "ts-odatajs";

export class AnnotationMetadataAdapter implements MetadataAdapter {
    constructor(public adapters: AnnotationAdapter[]) { }

    adapt(schema: any): void {
        var annotations = schema.annotations || [];
        annotations.forEach(function (itemAnnotation) {
            var targetSplit = itemAnnotation.target.split('/');
            var entityTypeName = targetSplit[0];
            var propertyName = targetSplit[1];
            var shortTypeName = entityTypeName.split('.').pop();
            var entityType = oData.utils.lookupEntityType(shortTypeName, schema); // TODO: verify working
            var property = this.getProperty(entityType, propertyName);

            itemAnnotation.annotation
                .forEach(annotation => { // term
                    var adapter = this.adapters
                        .find(p => {
                            return annotation.term.indexOf(`.${p.annotation}`) > -1;
                        });

                    adapter.adapt(property || entityType, annotation);
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