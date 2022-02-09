import { core } from 'breeze-client';

import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.Time enum symbol.
 * @see {DataType.Time}
 */
export class TimeDataTypeSetup extends BaseDataTypeSetup {
    public name = 'Time';

    public fmtOData = (val: any) => {
        if (!val) {
            return null;
        }

        if (!core.isDuration(val)) {
            throw new Error(`${val} is not a valid ISO 8601 duration`);
        }

        return val;
    }
}
