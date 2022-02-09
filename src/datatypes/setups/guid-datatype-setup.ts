import { core } from 'breeze-client';

import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.Guid enum symbol.
 * @see {DataType.Guid}
 */
export class GuidDataTypeSetup extends BaseDataTypeSetup {
    public name = 'Guid';

    public fmtOData = (val: any) => {
        if (!val) {
            return null;
        }

        if (!core.isGuid(val)) {
            this.handleInvalidValue(val);
        }

        return val;
    }
}
