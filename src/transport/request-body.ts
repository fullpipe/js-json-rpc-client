export interface RequestBody {
    jsonrpc: string;
    method: string;
    id?: string;
    params?: { [key: string]: any };
}
