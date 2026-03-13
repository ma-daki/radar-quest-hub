/** Strip HTML tags from a string to prevent XSS */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/** Validate that a URL is well-formed and uses https */
export function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Sanitize a generic text input: strip HTML, trim, limit length */
export function sanitizeText(input: string, maxLength = 500): string {
  return stripHtml(input).slice(0, maxLength);
}
