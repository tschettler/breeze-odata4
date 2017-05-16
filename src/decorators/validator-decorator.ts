import { DataType, DataTypeSymbol } from "breeze-client";
import { AnnotationDecorator } from "./annotation-decorator";

export class ValidatorDecorator implements AnnotationDecorator {
    annotation = 'Validator';

    private dataTypeMap: { [key: string]: DataTypeSymbol } = {
        'binary': DataType.Binary,
        'bool': DataType.Boolean,
        'date': DataType.DateTime,
        'datetimeoffset': DataType.DateTimeOffset,
        'decimal': DataType.Decimal,
        // duration?
        // enumMember?
        'float': DataType.Double,
        'guid': DataType.Guid,
        'int': DataType.Int64,
        'string': DataType.String
        // timeOfDay?
    };

    decorate(property: any, annotation: any): void {
        property.validators = property.validators || [];

        var keys = Object.keys(annotation);
        var value = annotation[keys[1]]; // assuming value is second key
        var nameAndProp = annotation['term'].replace(/^.*Validator\./, '').split('.');
        var name = nameAndProp.shift();
        var prop = nameAndProp.shift();

        var validator = property.validators.find((val: { name: string; }) => {
            return val.name === name;
        });

        if (!validator) {
            validator = { name: name };
            property.validators.push(validator);
        }

        var dataType = this.getDataType(keys[1]);
        validator[prop] = dataType.parse(value, 'string');
    }

    private getDataType(key: string): DataTypeSymbol {
        var dataType = this.dataTypeMap[key] || this.dataTypeMap.string;
        return dataType;
    }
}