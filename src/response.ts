export interface Response {
    id: string;
    jsonrpc: string;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}
