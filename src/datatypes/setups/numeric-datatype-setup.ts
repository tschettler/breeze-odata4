import { DataType } from 'breeze-client';

import { BaseDataTypeSetup } from './base-datatype-setup';

export class NumericDataTypeSetup extends BaseDataTypeSetup {
    public fmtOData = (val: any) => {
        if (typeof val === 'undefined' || val === null) {
            return null;
        }

        if (typeof val === 'string') {
            val = parseFloat(val);
        }

        return val;
    }

    public register(): void {
        DataType.Decimal.fmtOData = this.fmtOData;
        DataType.Double.fmtOData = this.fmtOData;
        DataType.Int64.fmtOData = this.fmtOData;
    }
}
