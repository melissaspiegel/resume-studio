export interface Link {
  id: string;
  url: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  dates: string;
  location: string;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  dates: string;
  location: string;
}

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
