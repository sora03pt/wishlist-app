function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getApiErrorMessage(value: unknown, fallbackMessage: string) {
  return isRecord(value) && typeof value.error === "string"
    ? value.error
    : fallbackMessage;
}

export async function readJsonResponse(
  response: Response,
  fallbackMessage: string,
): Promise<unknown> {
  let result: unknown = null;

  try {
    result = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(fallbackMessage);
    }
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result, fallbackMessage));
  }

  return result;
}
