import { describe, expect, it } from "vitest";
import { normalizePhone } from "../src/helpers/normalizePhone";

describe("normalizePhone", () => {
  it("removes spaces, dashes, parentheses and plus sign", () => {
    expect(normalizePhone(" +33 6-12-34-56-78 ")).toBe("33612345678");
    expect(normalizePhone("+1 (555) 123-4567")).toBe("15551234567");
  });

  it("throws on non-digit values", () => {
    expect(() => normalizePhone("abc123")).toThrow(TypeError);
  });

  it("throws on invalid length", () => {
    expect(() => normalizePhone("123")).toThrow(TypeError);
    expect(() => normalizePhone("1234567890123456")).toThrow(TypeError);
  });
});
