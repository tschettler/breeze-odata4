import { DataType, DataTypeSymbol } from 'breeze-client';
import { Edm, Edmx, oData } from 'ts-odatajs';

import { ExpressionWithDisplayName } from '../decorators/display-name-decorator';
import { EdmEnum, EdmEnumMember } from '../models/edm-enum';
import { Utilities } from '../utilities';
import { MetadataAdapter } from './metadata-adapter';

export class EnumTypeAdapter implements MetadataAdapter {
    public adapt(metadata: Edmx.DataServices): void {
        oData.utils.forEachSchema(metadata.schema, this.adaptSchema.bind(this));
    }
    public adaptSchema(schema: Edm.Schema): void {
        const enumTypes: Edm.EnumType[] = schema.enumType || [];
        enumTypes.forEach(this.adaptEnumType, this);
    }

    private adaptEnumType(enumType: Edm.EnumType): void {
        enumType.underlyingType ??= 'Edm.Int32';
        enumType.isFlags ??= 'false';

        const enumName = enumType.name;
        const underlyingType = enumType.underlyingType.split('.').pop();
        const dataType = Utilities.getDataType(underlyingType);
        const isFlags = enumType.isFlags.toLowerCase() === 'true';
        const enumValue = new EdmEnum({
            isFlags: isFlags,
            name: enumName,
            underlyingDataType: dataType
        });

        enumType.member.forEach(member => this.adaptEnumMember(enumValue, member));

        DataType[enumName] = DataType.addSymbol(enumValue);
    }

    private adaptEnumMember(enumValue: EdmEnum, member: Edm.Member): void {
        enumValue.addSymbol(<Partial<EdmEnumMember>>{
            name: member.name,
            displayName: (<ExpressionWithDisplayName>member).displayName,
            rawValue: member.value
        });
    }
}
