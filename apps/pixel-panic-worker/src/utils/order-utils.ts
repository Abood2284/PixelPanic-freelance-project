import { sql } from "drizzle-orm";
import { orders } from "@repo/db/schema";

/**
 * Generates a formatted order number in the format PP-YYYY-NNNN
 * @param sequenceNumber - The sequential number for the order
 * @returns Formatted order number string
 */
export function generateOrderNumber(sequenceNumber: number): string {
  const currentYear = new Date().getFullYear();
  const paddedSequence = sequenceNumber.toString().padStart(4, "0");
  return `PP-${currentYear}-${paddedSequence}`;
}

/**
 * Generates a more complex order number with date and random suffix
 * Format: PP-YYYYMMDD-NNN-XXXX
 * @param sequenceNumber - The sequential number for the order
 * @returns Formatted order number string
 */
export function generateComplexOrderNumber(sequenceNumber: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const paddedSequence = sequenceNumber.toString().padStart(3, "0");
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `PP-${year}${month}${day}-${paddedSequence}-${randomSuffix}`;
}

/**
 * Gets the next sequence number for order generation
 * This should be called within a transaction to avoid race conditions
 * @param db - Database instance
 * @returns Next sequence number
 */
export async function getNextOrderSequence(db: any): Promise<number> {
  // Get the count of orders for the current year
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  const orderCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(sql`created_at >= ${yearStart} AND created_at <= ${yearEnd}`);

  return (orderCount[0]?.count || 0) + 1;
}
