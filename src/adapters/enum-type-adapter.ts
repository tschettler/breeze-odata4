import { DataType } from 'breeze-client';
import { Edm, Edmx, oData } from 'ts-odatajs';

import { ExpressionWithDisplayName } from '../decorators/display-name-decorator';
import { EdmEnum, EdmEnumMember } from '../models';
import { Utilities } from '../utilities';
import { MetadataAdapter } from './metadata-adapter';

const DefaultIsFlags = 'false';
const DefaultUnderlyingType = 'Edm.Int32';
const TrueValue = 'true';

/**
 * @classdesc Metadata adapter used to configure entityType elements as breeze data type symbols.
 * @see {Edm.EnumType}
 */
 export class EnumTypeAdapter implements MetadataAdapter {

    public adapt(metadata: Edmx.DataServices): void {
        oData.utils.forEachSchema(metadata.schema, this.adaptSchema.bind(this));
    }
    public adaptSchema(schema: Edm.Schema): void {
        const enumTypes: Edm.EnumType[] = schema.enumType || [];
        enumTypes.forEach(this.adaptEnumType, this);
    }

    private adaptEnumType(enumType: Edm.EnumType): void {
        enumType.isFlags ??= DefaultIsFlags;
        enumType.underlyingType ??= DefaultUnderlyingType;

        const enumName = enumType.name;
        const underlyingType = enumType.underlyingType.split('.').pop();
        const dataType = Utilities.getDataType(underlyingType);
        const isFlags = enumType.isFlags.toLowerCase() === TrueValue;
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
