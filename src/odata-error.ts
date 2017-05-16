export class ODataError extends Error {
    body: any;
    statusText: string;
    status: number;
    url: string;

    constructor(message?: string) {
        super(message);
    }

    toString() {
        return this.name + ': ' + this.message;
    }
}
