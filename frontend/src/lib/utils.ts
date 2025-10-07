import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Western Arabic numerals (0123456789) to Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩)
export function toArabicNumerals(text: string | number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return text.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)])
}

// Format number based on language
export function formatNumber(number: string | number, language: string): string {
  if (language === 'ar') {
    return toArabicNumerals(number)
  }
  return number.toString()
}
