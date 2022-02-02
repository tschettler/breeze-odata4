import { DataType, DataTypeSymbol } from 'breeze-client';

import { DataTypeSetup } from './datatype-setup';

export class BaseDataTypeSetup implements DataTypeSetup {
    public name: string;

    public addSymbol: () => DataTypeSymbol = null;
    public fmtOData: (val: any) => void = null;

    protected handleInvalidValue(val: any): void {
        throw new Error(`${val} is not a valid ${this.name}`);
    }

    public register(): void {
        if (!!this.addSymbol) {
            this.addSymbol();
        }

        if (!!this.fmtOData) {
            DataType[this.name].fmtOData = this.fmtOData;
        }
    }
}
