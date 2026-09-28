import {describe, it, expect} from 'vitest';
import {parseResume, textToDraft, sampleResume} from '../src/resume';

describe('resume data', () => {
  it('round trips a saved resume', () => {
    const r = sampleResume();
    expect(parseResume(JSON.stringify(r))).toEqual(r);
  });

  it('rejects malformed JSON data', () =>
    expect(() => parseResume('{"name":1,"experience":[]}')).toThrow());

  it('keeps extracted PDF text for manual review', () =>
    expect(textToDraft('Alex Morgan\nEngineer\nExample Co.').importedText).toContain('Example Co.'));

  it('migrates v1 drafts to the structured schema', () => {
    const v1 = {
      name: 'A', headline: 'H', contact: 'a@b.co · Remote', summary: 's',
      skills: 'TS · Lit', importedText: '',
      experience: [{id: '1', role: 'R', company: 'C', dates: '2020', details: 'Did x\nDid y'}],
    };
    const r = parseResume(JSON.stringify(v1));
    expect(r.email).toBe('a@b.co');
    expect(r.location).toBe('Remote');
    expect(r.skills).toEqual(['TS', 'Lit']);
    expect(r.experience[0].bullets).toEqual(['Did x', 'Did y']);
    expect(r.education).toEqual([]);
  });

  it('normalizes tolerant: generates missing IDs and drops bad sections', () => {
    const r = parseResume(JSON.stringify({
      name: 'A',
      experience: [{role: 'Engineer'}],
      education: 'not-an-array',
    }));
    expect(r.experience[0].id).toBeTruthy();
    expect(r.experience[0].role).toBe('Engineer');
    expect(r.education).toEqual([]);
  });
});
