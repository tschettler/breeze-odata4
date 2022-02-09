import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.DateTimeOffset enum symbol.
 * @see {DataType.DateTimeOffset}
 */
export class DateTimeOffsetDataTypeSetup extends BaseDataTypeSetup {
    public name = 'DateTimeOffset';

    public fmtOData = (val: any) => {
        if (!val) {
            return null;
        }

        try {
            return val.toISOString();
        } catch (e) {
            this.handleInvalidValue(val);
        }
    }
}
