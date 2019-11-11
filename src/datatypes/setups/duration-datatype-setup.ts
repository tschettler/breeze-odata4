import { DataType, core } from 'breeze-client';
import { BaseDataTypeSetup } from './base-datatype-setup';

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
        const result = DataType.addSymbol(Object.assign({ name: this.name }, DataType.Time));
        DataType[this.name] =  result;

        return result;
    }
}
