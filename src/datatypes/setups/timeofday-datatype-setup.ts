import { DataType, Validator } from 'breeze-client';

import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.TimeOfDay enum symbol.
 */
export class TimeOfDayDataTypeSetup extends BaseDataTypeSetup {
    public name = 'TimeOfDay';

    public addSymbol = () => {
        const result = new DataType({
            defaultValue: '00:00',
            fmtOData: DataType.String.fmtOData,
            parse: DataType.String.parse,
            name: this.name,
            validatorCtor: Validator.string
        });

        DataType[this.name] = result;

        return result;
    }
}
