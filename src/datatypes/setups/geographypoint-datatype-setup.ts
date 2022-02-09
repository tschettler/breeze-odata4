import { DataType, Validator } from 'breeze-client';

import { BaseDataTypeSetup } from './base-datatype-setup';

/**
 * @classdesc Sets up the breeze DataType.GeographyPoint enum symbol.
 */
export class GeographyPointDataTypeSetup extends BaseDataTypeSetup {
    public name = 'GeographyPoint';

    public addSymbol = () => {
        const result = new DataType({
            defaultValue: [0, 0],
            fmtOData: JSON.stringify,
            name: this.name,
            parse: DataType.String.parse,
            validatorCtor: Validator.string
        });

        DataType[this.name] = result;

        return result;
    }
}
