export class ODataError extends Error {
    public body: any;
    public statusText: string;
    public status: number;
    public url: string;

    constructor(message?: string) {
        super(message);
    }

    public toString () {
        return `${this.name}: ${this.message}`;
    }
}
