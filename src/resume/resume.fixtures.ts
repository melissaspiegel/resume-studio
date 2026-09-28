import {uid} from './resume.defaults';
import type {Resume} from './resume.types';

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
