import { DataType } from 'breeze-client';

import { DataTypeSetup } from './datatype-setup';

/**
 * @classdesc Base data type setup class
 */
export class BaseDataTypeSetup implements DataTypeSetup {
    public name: string;

    public addSymbol: () => DataType = null;

    public fmtOData: (val: any) => void = null;

    protected handleInvalidValue(val: any): void {
        throw new Error(`${val} is not a valid ${this.name}`);
    }

    /**
     * Executes the addSymbol method and sets the fmtOData method on the data type symbol, if specified, respectively.
     */
    public register(): void {
        if (!!this.addSymbol) {
            this.addSymbol();
        }

        if (!!this.fmtOData) {
            DataType[this.name].fmtOData = this.fmtOData;
        }

        // reset enum resolved status
        (DataType as any)._resolvedNamesAndSymbols = null;
    }
}
