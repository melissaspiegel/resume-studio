import type {Resume} from './resume.types';

export const uid = () => crypto.randomUUID();

export const emptyResume = (): Resume => ({
  name: '',
  headline: '',
  email: '',
  location: '',
  links: [],
  summary: '',
  skills: [],
  experience: [],
  education: [],
  importedText: '',
});
