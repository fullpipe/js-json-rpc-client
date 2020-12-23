import { TransportInterface } from './transport/transport.interface';
import { ResponseError } from './response-error';
import { Request } from './request';

export class RpcClient {
    private beforeStack: ((request: Request) => void)[] = [];

    constructor(private transport: TransportInterface) {}

    async call(method: string, params?: { [key: string]: any }) {
        const request = new Request('1', method, params);

        this.beforeStack.forEach((fn) => fn(request));

        const response = await this.transport.execute(request);
        if (response.error) {
            throw new ResponseError(response.error);
        }

        return response.result;
    }

    before(fn: (request: Request) => void) {
        this.beforeStack.push(fn);
    }
}
