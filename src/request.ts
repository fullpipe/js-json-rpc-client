export class Request {
  public headers: { [key: string]: any } = {};

  constructor(
    public id: string,
    public method: string,
    public params?: { [key: string]: any }
  ) {}
}
