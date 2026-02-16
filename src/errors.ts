export class WhatsAppApiError extends Error {
  readonly status: number;
  readonly responseBody: unknown;

  constructor(message: string, status: number, responseBody: unknown) {
    super(message);
    this.name = "WhatsAppApiError";
    this.status = status;
    this.responseBody = responseBody;
  }
}
