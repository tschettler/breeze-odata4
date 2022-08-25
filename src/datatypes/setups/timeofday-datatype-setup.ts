import { DataType, Validator } from 'breeze-client';
import { EdmTimeOfDay } from '../models';

import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.TimeOfDay enum symbol.
 */
export class TimeOfDayDataTypeSetup extends BaseDataTypeSetup {
    public name = 'TimeOfDay';

    public addSymbol = () => {
        const result = new DataType({
            defaultValue: '00:00',
            fmtOData: (val: any) => val ? EdmTimeOfDay.create(val).toString() : null,
            name: this.name,
            parse: EdmTimeOfDay.create,
            parseRawValue: EdmTimeOfDay.create,
            validatorCtor: Validator.string
        });

        DataType[this.name] = result;

        return result;
    }
}
