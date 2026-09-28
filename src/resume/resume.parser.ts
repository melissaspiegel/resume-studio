import {emptyResume} from './resume.defaults';
import {legacyContact} from './resume.migrations';
import {
  isRecord,
  normalizeEducation,
  normalizeExperience,
  normalizeLinks,
  normalizeList,
  toString,
  toStringArray,
} from './resume.normalizers';
import type {Resume} from './resume.types';

/**
 * Parse stored/imported JSON into a Resume. Tolerant by design: unknown fields
 * are dropped, missing fields fall back to defaults, missing IDs are generated,
 * and only a non-string `name` is rejected — a resume without a name isn't
 * usable.
 */
export function parseResume(value: string): Resume {
  const data: unknown = JSON.parse(value);
  if (!isRecord(data)) throw new Error('Invalid resume JSON');
  if (typeof data.name !== 'string') throw new Error('Invalid resume data');

  const contact = legacyContact(data);

  return {
    ...emptyResume(),
    name: data.name,
    headline: toString(data.headline),
    email: contact.email,
    location: contact.location,
    links: normalizeLinks(data.links),
    summary: toString(data.summary),
    skills: toStringArray(data.skills),
    experience: normalizeList(data.experience, normalizeExperience),
    education: normalizeList(data.education, normalizeEducation),
    importedText: toString(data.importedText),
  };
}

/** Map raw PDF text extraction into a draft for manual review. */
export function textToDraft(text: string): Resume {
  const lines = text.split(/\n/).map(s => s.trim()).filter(Boolean);
  return {...emptyResume(), name: lines[0] ?? '', importedText: lines.slice(1).join('\n')};
}
