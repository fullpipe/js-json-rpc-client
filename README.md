# js-json-rpc-client

Json rpc client


## Installation 
```sh
npm install js-json-rpc-client --save
```

## Usage

### TypeScript

```typescript
import { Injectable } from "@angular/core";
import { RpcClient } from "js-json-rpc-client";
import { FetchTransport } from "js-json-rpc-client";

@Injectable({
  providedIn: "root"
})
export class RpcService {
  private token: string;
  private client: RpcClient;

  constructor() {
    this.client = new RpcClient(
      new FetchTransport({
        url: "http://127.0.0.1:8000/api",
        retryConfig: {
          maxRetryAttempts: 10,
          scalingDuration: 500
        }
      })
    );

    this.client.before(request => {
      if (this.token) {
        request.headers["Authorization"] = "Bearer " + this.token;
      }
    });
  }

  call(method: string, params?: { [key: string]: any }) {
    return this.client.call(method, params);
  }

  setToken(token: string) {
    this.token = token;
  }
}
```
