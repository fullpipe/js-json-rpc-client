import { Request } from "../request";
import { Response } from "../response";

export interface TransportInterface {
  execute(request: Request): Promise<Response>;
}
