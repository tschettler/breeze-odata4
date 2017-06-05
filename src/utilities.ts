import { DataTypeSymbol, DataType } from 'breeze-client';

const dataTypeMap: { [key: string]: DataTypeSymbol } = {
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

export function getDataType(key: string): DataTypeSymbol {
    const dataType = this.dataTypeMap[key] || this.dataTypeMap.string;
    return dataType;
}
