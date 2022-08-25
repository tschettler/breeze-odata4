import { DataType } from 'breeze-client';
import { EdmDateTimeOffset } from '../models';
import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.DateTimeOffset enum symbol.
 * @see {DataType.DateTimeOffset}
 */
export class DateTimeOffsetDataTypeSetup extends BaseDataTypeSetup {
    public name = 'DateTimeOffset';

    public addSymbol = () => {
        const result = new DataType({
            defaultValue: EdmDateTimeOffset.MinValue,
            fmtOData: (val: any) => val ? EdmDateTimeOffset.create(val).toString() : null,
            getConcurrencyValue: this.getConcurrencyValue,
            getNext: EdmDateTimeOffset.create,
            isDate: true,
            name: this.name,
            normalize: (value: any) => value ? EdmDateTimeOffset.create(value).toDate() : null,
            parse: EdmDateTimeOffset.create,
            parseRawValue: EdmDateTimeOffset.create
        });

        DataType[this.name] = result;

        return result;
    }

    private getConcurrencyValue(): EdmDateTimeOffset {
        // use the current datetime but insure that it is different from previous call.
        const dt = new Date();
        let dt2 = new Date();
        while (dt.getTime() === dt2.getTime()) {
            dt2 = new Date();
        }

        const result = EdmDateTimeOffset.create(dt2);

        return result;
    }
}
