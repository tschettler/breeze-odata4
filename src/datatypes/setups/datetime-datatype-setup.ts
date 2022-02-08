import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.DateTime enum symbol.
 * @see {DataType.DateTime}
 */
export class DateTimeDataTypeSetup extends BaseDataTypeSetup {
    public name = 'DateTime';

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
