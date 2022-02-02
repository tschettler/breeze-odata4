import { DataType, Validator } from 'breeze-client';

import { BaseDataTypeSetup } from './base-datatype-setup';

export class StreamDataTypeSetup extends BaseDataTypeSetup {
    public name = 'Stream';

    public addSymbol = () => {
        const result = DataType.addSymbol({
            defaultValue: '',
            fmtOData: DataType.String.fmtOData,
            name: this.name,
            parse: DataType.String.parse,
            validatorCtor: Validator.string
        });

        DataType[this.name] = result;

        return result;
    }
}
