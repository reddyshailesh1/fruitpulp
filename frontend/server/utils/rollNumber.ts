/**
 * Normalizes college roll number:
 * - Trims leading and trailing whitespace
 * - Replaces any multiple whitespace characters with empty string or single space
 * - Converts to uppercase
 */
export function normalizeRollNumber(input: string): string {
  if (!input) return '';
  // Strip all internal whitespace or condense
  return input.trim().replace(/\s+/g, '').toUpperCase();
}

/**
 * Validates roll number format:
 * - Must be between 3 and 25 characters long
 * - Only uppercase letters, digits, and standard separators (- / .)
 */
export function isValidRollNumber(rollNumber: string): boolean {
  const normalized = normalizeRollNumber(rollNumber);
  if (normalized.length < 3 || normalized.length > 25) {
    return false;
  }
  // Standard college roll number patterns (e.g., 21CS045, ME-2022-09, 19/EC/104)
  const pattern = /^[A-Z0-9\-_./]+$/;
  return pattern.test(normalized);
}
