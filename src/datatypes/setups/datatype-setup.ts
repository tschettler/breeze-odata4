import { DataTypeSymbol } from 'breeze-client';

export interface DataTypeSetup {
    name: string;

    fmtOData?: (val: any) => void;
    addSymbol?: () => DataTypeSymbol;
    register(): void;
}
