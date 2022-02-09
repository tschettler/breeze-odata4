import { core, DataType } from 'breeze-client';

import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.Duration enum symbol.
 */
export class DurationDataTypeSetup extends BaseDataTypeSetup {
    public name = 'Duration';

    public fmtOData = (val: any) => {
        if (!val) {
            return null;
        }

        if (!core.isDuration(val)) {
            throw new Error(`${val} is not a valid ISO 8601 duration`);
        }

        return val;
    }

    public addSymbol = () => {
        const result = new DataType({...DataType.Time,
            
                name: this.name,
                parseRawValue: DataType.parseTimeFromServer});
        DataType[this.name] = result;

        return result;
    }
}
