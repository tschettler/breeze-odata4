import { DataTypeSymbol, DataType } from 'breeze-client';
import { oData, Edm } from 'ts-odatajs';

const dataTypeMap: { [key: string]: DataTypeSymbol } = {
    binary: DataType.Binary,
    bool: DataType.Boolean,
    date: DataType.DateTime,
    datetimeoffset: DataType.DateTimeOffset,
    decimal: DataType.Decimal,
    // duration?
    // enumMember?
    float: DataType.Double,
    guid: DataType.Guid,
    int: DataType.Int64,
    string: DataType.String
    // timeOfDay?
};

export function getDataType(key: string): DataTypeSymbol {
    const dataType = dataTypeMap[key] || dataTypeMap.string;
    return dataType;
}

export function lookupAction(name: string, metadata: any): Edm.Action {
    return oData.utils.lookupInMetadata(name, metadata, 'action');
}

export function lookupFunction(name: string, metadata: any): Edm.Function {
    return oData.utils.lookupInMetadata(name, metadata, 'function');
}
