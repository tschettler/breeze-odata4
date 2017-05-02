import { DataType, DataTypeSymbol } from "breeze-client";
import { AnnotationAdapter } from "./annotation-adapter";
import { DataTypeSymbolEx } from "interfaces";

export class StoreGeneratedPatternAdapter implements AnnotationAdapter {
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

    adapt(property: any, annotation: any): void {
        property.validators = property.validators || [];

        var keys = Object.keys(annotation);
        var value = annotation[keys[1]]; // assuming value is second key
        var nameAndProp = annotation['term'].replace(/^.*Validator\./, '').split('.');
        var name = nameAndProp.shift();
        var prop = nameAndProp.shift();

        var validator = property.validators.find((val) => {
            return val.name === name;
        });

        if (!validator) {
            validator = { name: name };
            property.validators.push(validator);
        }

        // TODO: cleanup after typings get updated
        var dataType = <DataTypeSymbolEx>this.getDataType(keys[1]);
        validator[prop] = dataType.parse(value, 'string');
    }

    private getDataType(key): DataTypeSymbol {
        var dataType = this.dataTypeMap[key] || this.dataTypeMap.string;
        return dataType;
    }
}