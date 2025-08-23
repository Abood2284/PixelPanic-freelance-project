import { z } from "zod";

export const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  phoneNumber: z.string().min(1, { message: "Phone number is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  alternatePhoneNumber: z
    .string()
    .min(10, { message: "Please enter a valid 10-digit phone number." })
    .optional()
    .or(z.literal("")),
  flatAndStreet: z.string().min(5, { message: "Please enter a full address." }),
  landmark: z
    .string()
    .min(2, { message: "Landmark must be at least 2 characters." }),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
