import { core, DataType } from 'breeze-client';
import { EdmDuration } from '../models';

import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.Duration enum symbol.
 */
export class DurationDataTypeSetup extends BaseDataTypeSetup {
    public name = 'Duration';

    public addSymbol = () => {
        const result = new DataType({
            ...DataType.Time,
            fmtOData: (val: any) => val ? EdmDuration.create(val).toString() : null,
            name: this.name,
            parseRawValue: EdmDuration.create
        });

        DataType[this.name] = result;

        return result;
    }
}
