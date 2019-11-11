import { DataType } from 'breeze-client';
import { nameof } from '../../utilities';
import { BaseDataTypeSetup } from './base-datatype-setup';

export class DateTimeDataTypeSetup extends BaseDataTypeSetup {
    public name = nameof<DataType>('DateTime');

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
