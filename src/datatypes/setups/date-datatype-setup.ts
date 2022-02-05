import { DataType } from 'breeze-client';

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

    private parseValue = (val: any) => {
        if (!val) {
            return null;
        }

        let result = val;
        if (typeof val === 'string') {
            const matchResult = DateRegex.exec(val);
            if (matchResult) {
                return matchResult[0];
            }
        }

        const dateVal = val instanceof Date ? val : new Date(`${val} `);
        if (isNaN(<any>dateVal)) {
            this.handleInvalidValue(val);
        }

        result = dateVal.toISOString().split('T')[0];

        return result;
    }

    public addSymbol = () => {
        const result = DataType.addSymbol({
            defaultValue: '0000-01-01',
            name: this.name,
            isDate: true,
            fmtOData: this.parseValue,
            parseRawValue: this.parseValue
        });

        DataType[this.name] = result;

        return result;
    }
}
