import { DataType } from 'breeze-client';
import { EdmDate } from '../models';

import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * Supports ISO 8601 formatted dates, allowing for year 0000 and negative years.
 */
const DateRegex = /(-\d)?\d{4}-\d{2}-\d{2}/;

/**
 * @classdesc Sets up the breeze DataType.Date enum symbol.
 */
export class DateDataTypeSetup extends BaseDataTypeSetup {
    public name = 'Date';

    public addSymbol = () => {
        const result = new DataType({
            defaultValue: EdmDate.create('0000-01-01'),
            fmtOData: (value: any) => value ? EdmDate.create(value).toString() : null,
            getNext: EdmDate.create,
            isDate: true,
            name: this.name,
            normalize: (value: any) => value ? EdmDate.create(value).toString() : null,
            parse: EdmDate.create,
            parseRawValue: EdmDate.create
        });

        DataType[this.name] = result;

        return result;
    }
}
