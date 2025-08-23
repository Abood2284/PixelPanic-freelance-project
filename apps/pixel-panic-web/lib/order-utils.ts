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
 * Extracts the sequence number from an order number
 * @param orderNumber - The order number to parse
 * @returns The sequence number or null if invalid format
 */
export function parseOrderNumber(orderNumber: string): number | null {
  // For PP-2024-0001 format
  const simpleMatch = orderNumber.match(/^PP-\d{4}-(\d{4})$/);
  if (simpleMatch) {
    return parseInt(simpleMatch[1], 10);
  }

  // For PP-20241201-001-XXXX format
  const complexMatch = orderNumber.match(/^PP-\d{8}-\d{3}-[A-Z0-9]{4}$/);
  if (complexMatch) {
    const sequencePart = orderNumber.split("-")[2];
    return parseInt(sequencePart, 10);
  }

  return null;
}

/**
 * Validates if an order number has the correct format
 * @param orderNumber - The order number to validate
 * @returns True if valid, false otherwise
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  // Check simple format: PP-YYYY-NNNN
  if (/^PP-\d{4}-\d{4}$/.test(orderNumber)) {
    return true;
  }

  // Check complex format: PP-YYYYMMDD-NNN-XXXX
  if (/^PP-\d{8}-\d{3}-[A-Z0-9]{4}$/.test(orderNumber)) {
    return true;
  }

  return false;
}
