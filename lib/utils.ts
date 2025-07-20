import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL-friendly slug from a filename
 * @param filename - The original filename to convert to slug
 * @returns A URL-friendly slug
 */
export function generateSlug(filename: string): string {
  // Remove file extension
  const nameWithoutExtension = filename.replace(/\.[^/.]+$/, '');
  
  return nameWithoutExtension
    // Convert to lowercase
    .toLowerCase()
    // Replace Arabic and Unicode characters with their ASCII equivalents where possible
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9_-]/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 50 characters
    .substring(0, 50)
    // Remove trailing hyphen if truncation created one
    .replace(/-+$/, '');
}

/**
 * Generates a unique slug by checking against existing slugs and appending numbers if needed
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let uniqueSlug = baseSlug;
  let counter = 1;

  // If the base slug is empty or too short, use a default
  if (!uniqueSlug || uniqueSlug.length < 3) {
    uniqueSlug = 'media-file';
  }

  // Check for uniqueness and append numbers if needed
  while (existingSlugs.includes(uniqueSlug)) {
    // Remove previous counter if exists
    const slugWithoutCounter = baseSlug.replace(/-\d+$/, '');
    uniqueSlug = `${slugWithoutCounter}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * Validates if a slug meets the required format
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3) return false;
  return /^[a-z0-9_-]+$/.test(slug);
}
