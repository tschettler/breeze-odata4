/**
 * Odata error implementation.
 */
export class ODataError extends Error {
    /**
     * Body of the OData error.
     */
    public body: any;

    /**
     * Status text of the OData error.
     */
    public statusText: string;

    /**
     * Status of the OData error
     */
    public status: number;

    /**
     * Url of the OData error.
     */
    public url: string;

    /**
     * @constructor Creates an instance of odata error.
     * @param [message] The message.
     */
    constructor(message?: string) {
        super(message);

        // set the prototype explicitly
        Object.setPrototypeOf(this, ODataError.prototype);
    }

    /**
     * Returns a string representation of the OData error.
     */
    public toString = (): string => {
        return `${this.name}: ${this.message}`;
    }
}
