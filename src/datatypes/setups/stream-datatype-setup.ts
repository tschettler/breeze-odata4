import { DataType, Validator } from 'breeze-client';

import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.Stream enum symbol.
 */
export class StreamDataTypeSetup extends BaseDataTypeSetup {
    public name = 'Stream';

    public addSymbol = () => {
        const result = new DataType({
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
