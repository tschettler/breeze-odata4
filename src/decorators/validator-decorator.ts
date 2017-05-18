import { DataType, DataTypeSymbol } from 'breeze-client';
import { AnnotationDecorator } from './annotation-decorator';
import { Edm } from 'ts-odatajs';

export interface ExpressionWithValidators extends Edm.Base.NamedExpression {
    validators?: any[];
}

export class ValidatorDecorator implements AnnotationDecorator {
    public annotation = 'Validator';

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

    public decorate(expression: ExpressionWithValidators, annotation: Edm.Annotation): void {
        expression.validators = expression.validators || [];

        const keys = Object.keys(annotation);
        const value = annotation[keys[1]]; // assuming value is second key
        const nameAndProp = annotation.term.replace(/^.*Validator\./, '').split('.');
        const name = nameAndProp.shift();
        const prop = nameAndProp.shift();

        let validator = expression.validators.find((val: { name: string; }) => {
            return val.name === name;
        });

        if (!validator) {
            validator = { name: name };
            expression.validators.push(validator);
        }

        const dataType = this.getDataType(keys[1]); // TODO: need to see if this still works with the interface
        validator[prop] = dataType.parse(value, 'string');
    }

    private getDataType(key: string): DataTypeSymbol {
        const dataType = this.dataTypeMap[key] || this.dataTypeMap.string;
        return dataType;
    }
}
