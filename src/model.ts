export interface Experience { id: string; role: string; company: string; dates: string; details: string }
export interface Resume { name: string; headline: string; contact: string; summary: string; skills: string; experience: Experience[]; importedText: string }
export const emptyResume = (): Resume => ({name: '', headline: '', contact: '', summary: '', skills: '', experience: [], importedText: ''});
export const sampleResume = (): Resume => ({name: 'Alex Morgan', headline: 'Frontend Engineer', contact: 'alex@example.com · Remote', summary: 'Builds accessible, reliable interfaces.', skills: 'TypeScript · Lit · Accessibility', experience: [{id: crypto.randomUUID(), role: 'Software Engineer', company: 'Example Co.', dates: '2022–present', details: 'Built reusable UI components and improved keyboard workflows.'}], importedText: ''});
export function parseResume(value: string): Resume {
  const data: unknown = JSON.parse(value);
  if (!data || typeof data !== 'object') throw new Error('Invalid resume JSON');
  const r = data as Partial<Resume>;
  if (typeof r.name !== 'string' || !Array.isArray(r.experience) || r.experience.some(x => typeof x.role !== 'string' || typeof x.id !== 'string')) throw new Error('Invalid resume data');
  return {...emptyResume(), ...r, experience: r.experience};
}
export function textToDraft(text: string): Resume {
  const lines = text.split(/\n/).map(s => s.trim()).filter(Boolean);
  return {...emptyResume(), name: lines[0] ?? '', importedText: lines.slice(1).join('\n')};
}
