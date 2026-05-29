/**
 * Format a number with leading zeros
 * @param num - Number to format
 * @param digits - Minimum number of digits (default: 2)
 * @returns Formatted string
 */
export function padNumber(num: number, digits: number = 2): string {
  return num.toString().padStart(digits, '0')
}

/**
 * Format date to a readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('no-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date.getTime() < new Date().getTime()
}
