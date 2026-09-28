import {uid} from './resume.defaults';
import type {Education, Experience, Link} from './resume.types';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export const toString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

export const toId = (value: unknown): string =>
  toString(value) || uid();

export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string') {
    return value
      .split(/[·•,;|\n]+/)
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeList<T>(
  value: unknown,
  normalize: (item: Record<string, unknown>) => T,
): T[] {
  return Array.isArray(value) ? value.filter(isRecord).map(normalize) : [];
}

export function normalizeLinks(value: unknown): Link[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => {
      if (typeof item === 'string') return {id: uid(), url: item};
      const url = isRecord(item) ? toString(item.url) : '';
      return {id: toId(isRecord(item) ? item.id : ''), url};
    })
    .filter(link => link.url);
}

export function normalizeExperience(value: Record<string, unknown>): Experience {
  return {
    id: toId(value.id),
    role: toString(value.role),
    company: toString(value.company),
    dates: toString(value.dates),
    location: toString(value.location),
    // v1 entries stored free text in `details`; v2 stores a bullets array.
    bullets: Array.isArray(value.bullets)
      ? toStringArray(value.bullets)
      : toString(value.details)
          .split(/\n+/)
          .map(line => line.replace(/^[•\-*·]\s*/, '').trim())
          .filter(Boolean),
  };
}

export function normalizeEducation(value: Record<string, unknown>): Education {
  return {
    id: toId(value.id),
    degree: toString(value.degree),
    school: toString(value.school),
    dates: toString(value.dates),
    location: toString(value.location),
  };
}
