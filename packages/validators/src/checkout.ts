import { z } from "zod";

export const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  phoneNumber: z
    .string()
    .min(10, { message: "Please enter a valid 10-digit phone number." }),
  email: z
    .string()
    .email({ message: "Please enter a valid email." })
    .optional()
    .or(z.literal("")),
  pincode: z.string().length(6, { message: "Pincode must be 6 digits." }),
  flatAndStreet: z.string().min(5, { message: "Please enter a full address." }),
  landmark: z.string().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
