import z from "zod";
import { ROLE_VALUES } from "@/lib/constants/role";
import { emailFormat, phoneNumberFormat } from "@/utils/zod-format";

export const userFormSchema = z.object({
  firstName: z.string().min(1, {
    message: "Please fill in the information.",
  }),
  lastName: z.string().min(1, {
    message: "Please fill in the information.",
  }),
  email: emailFormat,
  phoneNumber: phoneNumberFormat,
  role: z.enum(ROLE_VALUES, {
    message: "Please select the information.",
  }),
  commissionPerHead: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true; // Optional field
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && /^\d+(\.\d{1,2})?$/.test(val);
      },
      {
        message: "Commission must be a valid number with up to 2 decimal places.",
      }
    ),
  isActive: z.boolean().optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
