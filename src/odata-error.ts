export class ODataError extends Error {
    public body: any;
    public statusText: string;
    public status: number;
    public url: string;

    constructor(message?: string) {
        super(message);

        // set the prototype explicitly
        Object.setPrototypeOf(this, ODataError.prototype);
    }

    public toString = (): string => {
        return `${this.name}: ${this.message}`;
    }
}
