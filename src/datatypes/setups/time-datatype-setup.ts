import { core, DataType } from 'breeze-client';
import { nameof } from '../../utilities';
import { BaseDataTypeSetup } from './base-datatype-setup';

export class TimeDataTypeSetup extends BaseDataTypeSetup {
    public name = nameof<DataType>('Time');

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
