const E164_DIGITS_REGEX = /^\d{8,15}$/;

export function normalizePhone(rawPhone: string): string {
  if (typeof rawPhone !== "string") {
    throw new TypeError("Phone number must be a string.");
  }

  const compact = rawPhone.trim().replace(/[\s\-()]/g, "");
  const withoutPlus = compact.startsWith("+") ? compact.slice(1) : compact;

  if (!E164_DIGITS_REGEX.test(withoutPlus)) {
    throw new TypeError(
      "Invalid phone number. Expected E.164 digits only (8 to 15 digits), with optional leading '+'."
    );
  }

  return withoutPlus;
}
