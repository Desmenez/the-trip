import { z } from "zod";

/**
 * Phone number format for Thai phone numbers
 * Supports formats: 0X-XXXX-XXXX, 0XXXXXXXXX, +66XXXXXXXXX
 */
export const phoneNumberFormat = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true; // Optional field
      // Remove spaces, dashes, and plus signs for validation
      const cleaned = val.replace(/[\s\-+]/g, "");
      // Check if it's all digits
      if (!/^\d+$/.test(cleaned)) return false;
      // Thai phone numbers: 9-10 digits (without country code) or 10-11 digits (with country code)
      // Format: 0X-XXXX-XXXX (10 digits) or +66XXXXXXXXX (11 digits without leading 0)
      const length = cleaned.length;
      return length >= 9 && length <= 11;
    },
    {
      message: "Phone number is invalid.",
    }
  );

/**
 * Email format with validation
 */
export const emailFormat = z
  .string()
  .min(1, {
    message: "Please fill in the information.",
  })
  .email({
    message: "Email is invalid.",
  });

/**
 * Optional email format (can be empty or valid email)
 */
export const optionalEmailFormat = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true; // Optional field
      return z.string().email().safeParse(val).success;
    },
    {
      message: "Please enter a valid email address.",
    }
  );
