import { TransportInterface } from "./transport.interface";
import { Request } from "../request";
import { Response as JsonResponse } from "../response";
import { genericRetryStrategy } from "./generic-retry-strategy";
import { fromFetch } from "rxjs/fetch";
import { of, throwError } from "rxjs";
import { mergeMap, switchMap, retryWhen } from "rxjs/operators";
import { RequestBody } from "./request-body";
import { RetryConfig } from "./generic-retry-strategy";

interface FetchTransportConfig {
  url: string;
  retryConfig?: RetryConfig;
}

export class FetchTransport implements TransportInterface {
  constructor(private config: FetchTransportConfig) {}

  execute(request: Request): Promise<JsonResponse> {
    let body: RequestBody = {
      jsonrpc: "2.0",
      method: request.method
    };

    if (request.id) {
      body.id = request.id;
    }

    if (request.params) {
      body.params = request.params;
    }

    request.headers["Content-Type"] = "application/json";

    return fromFetch(this.config.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(body),
      credentials: "omit"
    })
      .pipe(
        switchMap(response => {
          if (!response.ok) {
            return throwError(`Server error`);
          }

          return response.json();
        }),
        mergeMap((json: JsonResponse) => {
          if (!json) {
            return throwError(`No results from server`);
          }

          if (!json.hasOwnProperty("error") && !json.hasOwnProperty("result")) {
            return throwError(`Empty result from server`);
          }

          if (json.error && json.error["code"] === -32603) {
            return throwError(json.error["message"]);
          }

          return of(json);
        }),
        retryWhen(genericRetryStrategy(this.config.retryConfig))
      )
      .toPromise();
  }
}
