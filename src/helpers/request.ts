import { WhatsAppApiError } from "../errors";

interface PostJsonOptions {
  url: string;
  accessToken: string;
  body: Record<string, unknown>;
}

function extractErrorMessage(responseBody: unknown): string | undefined {
  if (!responseBody || typeof responseBody !== "object") {
    return undefined;
  }

  const maybeError = (responseBody as { error?: { message?: unknown } }).error;
  if (maybeError && typeof maybeError.message === "string") {
    return maybeError.message;
  }

  return undefined;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  try {
    if (isJson) {
      return await response.json();
    }

    const text = await response.text();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

export async function postJson<TResponse>({
  url,
  accessToken,
  body
}: PostJsonOptions): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    throw new WhatsAppApiError(
      "Network error while calling WhatsApp Cloud API.",
      0,
      {
        cause: error instanceof Error ? error.message : String(error)
      }
    );
  }

  const responseBody = await parseResponseBody(response);
  if (!response.ok) {
    const message =
      extractErrorMessage(responseBody) ??
      `WhatsApp Cloud API returned HTTP ${response.status}.`;

    throw new WhatsAppApiError(message, response.status, responseBody);
  }

  return responseBody as TResponse;
}
