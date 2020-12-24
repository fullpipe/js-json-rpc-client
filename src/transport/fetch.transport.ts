import { TransportInterface } from './transport.interface';
import { Request } from '../request';
import { Response as JsonResponse } from '../response';
import { genericRetryStrategy } from './generic-retry-strategy';
import { from, of, throwError } from 'rxjs';
import { switchMap, retryWhen, catchError } from 'rxjs/operators';
import { RequestBody } from './request-body';
import { RetryConfig } from './generic-retry-strategy';
import fetch from 'cross-fetch';

interface FetchTransportConfig {
    url: string;
    retryConfig?: RetryConfig;
}

export class FetchTransport implements TransportInterface {
    constructor(private config: FetchTransportConfig) {}

    execute(request: Request): Promise<JsonResponse> {
        let body: RequestBody = {
            jsonrpc: '2.0',
            method: request.method,
        };

        if (request.id) {
            body.id = request.id;
        }

        if (request.hasOwnProperty('params')) {
            body.params = request.params;
        }

        request.headers['Content-Type'] = 'application/json';

        return from(
            fetch(this.config.url, {
                method: 'POST',
                headers: request.headers,
                body: JSON.stringify(body),
                credentials: 'omit',
            }),
        )
            .pipe(
                switchMap((response) => {
                    if (!response.ok) {
                        return throwError(`Server error`);
                    }

                    return response.json();
                }),
                retryWhen(genericRetryStrategy(this.config.retryConfig)),
                catchError((e) => of(errorResponse(request.id, -32768, e))),
                switchMap((json: JsonResponse) => {
                    if (!json) {
                        return of(errorResponse(request.id, -32768, 'No results from server'));
                    }

                    if (!json.hasOwnProperty('error') && !json.hasOwnProperty('result')) {
                        return of(errorResponse(request.id, -32768, 'No results from server'));
                    }

                    return of(json);
                }),
            )
            .toPromise();
    }
}

function errorResponse(id: string | number | null, code: number, message: string): JsonResponse {
    return {
        id: id,
        jsonrpc: '2.0',
        error: {
            code: code,
            message: message,
        },
    };
}
