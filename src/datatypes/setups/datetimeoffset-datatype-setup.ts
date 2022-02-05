import { DataType } from 'breeze-client';

import { nameof } from '../../utilities';
import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.DateTimeOffset enum symbol.
 * @see {DataType.DateTimeOffset}
 */
export class DateTimeOffsetDataTypeSetup extends BaseDataTypeSetup {
    public name = nameof<DataType>('DateTimeOffset');

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
