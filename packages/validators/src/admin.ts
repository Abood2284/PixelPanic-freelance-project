// packages/validators/src/admin.ts

import { z } from "zod";

/**
 * Zod schema for validating price information for a single issue.
 * Prices are received as strings from the form and coerced to numbers.
 */
export const issuePriceSchema = z.object({
  issueId: z.coerce.number(),
  priceOriginal: z.coerce.number().min(0).optional(),
  priceAftermarketTier1: z.coerce.number().min(0).optional(),
});

/**
 * Zod schema for the entire "Add Phone Model" form.
 * This is the single source of truth for the backend.
 */
export const addPhoneModelSchema = z.object({
  brandId: z.coerce
    .number({ invalid_type_error: "Please select a brand." })
    .min(1, "Please select a brand."),
  modelName: z
    .string()
    .min(2, "Model name must be at least 2 characters.")
    .max(100, "Model name cannot exceed 100 characters."),
  imageUrl: z.string().url().optional(),
  selectedIssues: z
    .array(issuePriceSchema)
    .min(1, "Please select and enable at least one service."),
});

// NEW: Schema for updating an existing model.
export const updatePhoneModelSchema = addPhoneModelSchema.extend({
  modelName: z
    .string()
    .min(2, "Model name must be at least 2 characters.")
    .max(100)
    .optional(), // Name is optional during an update
  imageUrl: z.string().url().optional(),
});
