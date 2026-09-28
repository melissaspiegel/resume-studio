import {toString} from './resume.normalizers';

/**
 * v1 drafts stored a single `contact` line such as "alex@example.com · Remote".
 * Split it into the structured email/location fields, preferring any v2 values
 * that are already present.
 */
export function legacyContact(raw: Record<string, unknown>): {email: string; location: string} {
  const parts = toString(raw.contact)
    .split(/[·•|]+/)
    .map(part => part.trim())
    .filter(Boolean);

  return {
    email: toString(raw.email) || parts.find(part => part.includes('@')) || '',
    location: toString(raw.location) || parts.find(part => !part.includes('@')) || '',
  };
}
