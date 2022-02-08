import { DataType } from 'breeze-client';

/**
 * Provides capability for adding or customizing data types.
 */
export interface DataTypeSetup {
    /**
     * The data type name.
     */
    name: string;

    /**
     * Formats the value for OData.
     * @param  {any} val The value to format.
     */
    fmtOData?: (val: any) => void;

    /**
     * Adds the data type symbol to the breeze DataType enum.
     */
    addSymbol?: () => DataType;

    /**
     * Registers the data type based on the configured setup.
     * @returns void
     */
    register(): void;
}
