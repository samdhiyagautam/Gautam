export interface Profile {
  name: string;
  headline: string;
  heroDescription: string;
  about: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  openToWork: boolean;
  ctaText: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  company: string;
  designation: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  responsibilities: string[];
  projects: string[];
  technologies: string[];
  description: string;
  order: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: 'core' | 'applied' | 'working-knowledge' | 'familiar';
  description: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SkillCategory = 
  | 'data-analytics'
  | 'web-development'
  | 'ai-automation'
  | 'creative-technology';

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  problem: string;
  approach: string;
  solution: string;
  role: string;
  technologies: string[];
  keyFeatures: string[];
  outcome: string;
  githubUrl: string;
  liveDemoUrl: string;
  caseStudyUrl: string;
  thumbnail: string;
  screenshots: string[];
  datasetUrl: string;
  attachments: string[];
  videoUrl: string;
  videos: string[];
  isFeatured: boolean;
  status: 'draft' | 'published';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectCategory = 
  | 'data-analytics'
  | 'ai-automation'
  | 'web-applications'
  | 'creative-technology';

export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  version: string;
  status: 'draft' | 'published';
  uploadedAt: string;
}

export interface SEO {
  pageTitle: string;
  metaDescription: string;
  ogImage: string;
  twitterCard: string;
  structuredData: Record<string, unknown>;
}

export interface AdminStats {
  publishedProjects: number;
  draftProjects: number;
  experienceEntries: number;
  skillsCount: number;
  resumeStatus: string;
  lastUpdated: string;
}

export type ContentStatus = 'draft' | 'published';

export interface NavItem {
  label: string;
  href: string;
}