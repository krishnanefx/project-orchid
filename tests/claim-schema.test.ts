import { describe, it, expect } from "vitest";
import { z } from "zod";

const claimSchema = z.object({
  purpose: z.string().trim().min(3, "Purpose must be at least 3 characters"),
  amount: z.coerce.number().positive("Amount must be greater than zero").finite("Enter a valid number")
});

describe("claimSchema", () => {
  it("accepts valid input", () => {
    const result = claimSchema.safeParse({ purpose: "Event supplies", amount: "86.40" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(86.4);
      expect(result.data.purpose).toBe("Event supplies");
    }
  });

  it("rejects empty purpose", () => {
    const result = claimSchema.safeParse({ purpose: "", amount: "10" });
    expect(result.success).toBe(false);
  });

  it("rejects purpose shorter than 3 chars", () => {
    const result = claimSchema.safeParse({ purpose: "AB", amount: "10" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.purpose?.[0]).toBe("Purpose must be at least 3 characters");
    }
  });

  it("rejects zero amount", () => {
    const result = claimSchema.safeParse({ purpose: "Supplies", amount: "0" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.amount?.[0]).toMatch(/greater than zero/i);
    }
  });

  it("rejects negative amount", () => {
    const result = claimSchema.safeParse({ purpose: "Supplies", amount: "-5" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from purpose", () => {
    const result = claimSchema.safeParse({ purpose: "  Food  ", amount: "20" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.purpose).toBe("Food");
  });
});
