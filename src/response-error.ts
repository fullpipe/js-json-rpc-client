export class ResponseError extends Error {
    constructor(private error: { code: number; message: string; data?: any }) {
        super(error.message);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ResponseError.prototype);
    }

    code() {
        return this.error.code;
    }

    data() {
        return this.error.data;
    }
}
