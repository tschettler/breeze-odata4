import { core, DataType } from 'breeze-client';

import { nameof } from '../../utilities';
import { BaseDataTypeSetup } from './base-datatype-setup';

export class GuidDataTypeSetup extends BaseDataTypeSetup {
    public name = nameof<DataType>('Guid');

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
