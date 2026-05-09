import { describe, it, expect } from "vitest";
import { formatEventDate } from "@/lib/utils";
import { resolveUniversityByEmail } from "@/lib/data";

describe("formatEventDate", () => {
  it("returns correct month and day for a known ISO date", () => {
    const result = formatEventDate("2024-11-12");
    expect(result.month).toBe("Nov");
    expect(result.day).toBe("12");
  });

  it("handles month boundary correctly", () => {
    const result = formatEventDate("2024-01-01");
    expect(result.month).toBe("Jan");
    expect(result.day).toBe("1");
  });

  it("handles end of year", () => {
    const result = formatEventDate("2024-12-31");
    expect(result.month).toBe("Dec");
    expect(result.day).toBe("31");
  });
});

describe("resolveUniversityByEmail", () => {
  it("matches UCL email domain", () => {
    const result = resolveUniversityByEmail("student@ucl.ac.uk");
    expect(result?.id).toBe("ucl");
  });

  it("matches Imperial email domain", () => {
    const result = resolveUniversityByEmail("student@imperial.ac.uk");
    expect(result?.id).toBe("imperial");
  });

  it("matches Manchester student domain", () => {
    const result = resolveUniversityByEmail("student@student.manchester.ac.uk");
    expect(result?.id).toBe("manchester");
  });

  it("returns undefined for unknown domain", () => {
    const result = resolveUniversityByEmail("student@unknown.ac.uk");
    expect(result).toBeUndefined();
  });

  it("is case-insensitive on domain", () => {
    const result = resolveUniversityByEmail("student@UCL.AC.UK");
    expect(result?.id).toBe("ucl");
  });
});
