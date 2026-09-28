export interface Link { id: string; url: string }
export interface Experience { id: string; role: string; company: string; dates: string; location: string; bullets: string[] }
export interface Education { id: string; degree: string; school: string; dates: string; location: string }
export interface Resume {
  name: string;
  headline: string;
  email: string;
  location: string;
  links: Link[];
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  importedText: string;
}

export const emptyResume = (): Resume => ({
  name: '', headline: '', email: '', location: '', links: [],
  summary: '', skills: [], experience: [], education: [], importedText: '',
});

const uid = () => crypto.randomUUID();

export const sampleResume = (): Resume => ({
  name: 'Alex Morgan',
  headline: 'Frontend Engineer',
  email: 'alex@example.com',
  location: 'Remote',
  links: [
    {id: uid(), url: 'linkedin.com/in/alexmorgan'},
    {id: uid(), url: 'github.com/alexmorgan'},
  ],
  summary: 'Builds accessible, reliable interfaces with a focus on performance, clean code, and great user experiences. Experienced in modern frontend technologies and passionate about inclusive design.',
  skills: ['TypeScript', 'Lit', 'Web Components', 'Accessibility', 'Playwright', 'Ag Grid', 'React', 'Vite', 'Git', 'CI/CD', 'Figma', 'MDUI', 'GraphQL'],
  experience: [
    {
      id: uid(), role: 'Software Engineer', company: 'Example Co.', dates: 'Jan 2022 – Present', location: 'Remote',
      bullets: [
        'Built reusable UI components and improved keyboard workflows.',
        'Developed accessible components used across the platform.',
        'Improved performance and reduced bundle size by 30%.',
        'Collaborated with product and design to deliver new features.',
      ],
    },
    {
      id: uid(), role: 'Web Developer', company: 'Previous Co.', dates: 'Jun 2019 – Dec 2021', location: 'Remote',
      bullets: [
        'Maintained and enhanced a WordPress multisite platform.',
        'Implemented accessibility improvements (WCAG 2.2).',
        'Automated testing with Playwright and CI/CD pipelines.',
      ],
    },
  ],
  education: [
    {id: uid(), degree: 'B.S. Computer Science', school: 'State University', dates: '2010 – 2014', location: 'City, State'},
  ],
  importedText: '',
});

interface LegacyV1 {
  contact?: unknown;
  skills?: unknown;
  experience?: Array<Record<string, unknown>>;
}

const str = (v: unknown): string => typeof v === 'string' ? v : '';
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string')
    : typeof v === 'string' ? v.split(/[·•,;|\n]+/).map(s => s.trim()).filter(Boolean)
    : [];

export function parseResume(value: string): Resume {
  const data: unknown = JSON.parse(value);
  if (!data || typeof data !== 'object') throw new Error('Invalid resume JSON');
  const r = data as Partial<Resume> & LegacyV1;
  if (typeof r.name !== 'string' || !Array.isArray(r.experience) || r.experience.some(x => typeof x.role !== 'string' || typeof x.id !== 'string')) throw new Error('Invalid resume data');

  // Migrate the v1 shape: a single `contact` line, comma-separated `skills`, and
  // free-text `details` on experience entries.
  const contactParts = str(r.contact).split(/[·•|]+/).map(s => s.trim()).filter(Boolean);
  const email = str(r.email) || contactParts.find(p => p.includes('@')) || '';
  const location = str(r.location) || contactParts.find(p => !p.includes('@')) || '';
  const links = Array.isArray(r.links)
    ? r.links.map(l => typeof l === 'string' ? {id: uid(), url: l} : {id: str(l?.id) || uid(), url: str(l?.url)}).filter(l => l.url)
    : [];
  const experience: Experience[] = (r.experience as Array<Record<string, unknown>>).map(x => ({
    id: str(x.id),
    role: str(x.role),
    company: str(x.company),
    dates: str(x.dates),
    location: str(x.location),
    bullets: Array.isArray(x.bullets)
      ? x.bullets.filter((b): b is string => typeof b === 'string')
      : str(x.details).split(/\n+/).map(s => s.replace(/^[•\-*·]\s*/, '').trim()).filter(Boolean),
  }));
  const education: Education[] = Array.isArray(r.education)
    ? r.education.map(e => ({id: str(e?.id) || uid(), degree: str(e?.degree), school: str(e?.school), dates: str(e?.dates), location: str(e?.location)}))
    : [];

  return {
    name: r.name, headline: str(r.headline), email, location, links,
    summary: str(r.summary), skills: strList(r.skills), experience, education,
    importedText: str(r.importedText),
  };
}

export function textToDraft(text: string): Resume {
  const lines = text.split(/\n/).map(s => s.trim()).filter(Boolean);
  return {...emptyResume(), name: lines[0] ?? '', importedText: lines.slice(1).join('\n')};
}
