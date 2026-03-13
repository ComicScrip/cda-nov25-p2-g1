export function normalizeApiKey(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim().replace(/^['"]|['"]$/g, "");
  return trimmedValue || undefined;
}

export function hasUsableApiKey(value?: string): boolean {
  const normalizedValue = normalizeApiKey(value);
  if (!normalizedValue) {
    return false;
  }

  const lowerValue = normalizedValue.toLowerCase();
  return !(
    lowerValue === "changeme" ||
    lowerValue === "your-api-key-here" ||
    lowerValue.startsWith("fake-")
  );
}

export function isInvalidApiKeyError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const lowerMessage = error.message.toLowerCase();
  return (
    lowerMessage.includes("api key not valid") ||
    lowerMessage.includes("api_key_invalid") ||
    lowerMessage.includes("invalid api key") ||
    lowerMessage.includes("incorrect api key") ||
    lowerMessage.includes("is not set")
  );
}
