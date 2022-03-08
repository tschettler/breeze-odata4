import { EdmDateTimeOffset } from '../models';
import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.DateTimeOffset enum symbol.
 * @see {DataType.DateTimeOffset}
 */
export class DateTimeOffsetDataTypeSetup extends BaseDataTypeSetup {
    public name = 'DateTimeOffset';

    public fmtOData = (val: any) => {
        const result = val ? EdmDateTimeOffset.create(val).toString() : null;

        return result;
    }
}
