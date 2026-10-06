import type { NavItem, SkillCategory, ProjectCategory } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Experience', href: '/experience' },
  { label: 'Skills', href: '/skills' },
  { label: 'Projects', href: '/projects' },
  { label: 'Resume', href: '/resume' },
  { label: 'Contact', href: '/contact' },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Profile', href: '/admin/profile' },
  { label: 'Experience', href: '/admin/experience' },
  { label: 'Skills', href: '/admin/skills' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Resume', href: '/admin/resume' },
  { label: 'SEO', href: '/admin/seo' },
  { label: 'Settings', href: '/admin/settings' },
];

export const SKILL_CATEGORIES: { value: SkillCategory; label: string; icon: string }[] = [
  { value: 'data-analytics', label: 'Data & Analytics', icon: 'database' },
  { value: 'web-development', label: 'Web Development', icon: 'code' },
  { value: 'ai-automation', label: 'AI & Automation', icon: 'cpu' },
  { value: 'creative-technology', label: 'Creative Technology', icon: 'palette' },
];

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string; icon: string }[] = [
  { value: 'data-analytics', label: 'Data Analytics', icon: 'bar-chart' },
  { value: 'ai-automation', label: 'AI & Automation', icon: 'zap' },
  { value: 'web-applications', label: 'Web Applications', icon: 'layout' },
  { value: 'creative-technology', label: 'Creative Technology', icon: 'image' },
];

export const PROFICIENCY_LEVELS = [
  { value: 'core', label: 'Core' },
  { value: 'applied', label: 'Applied' },
  { value: 'working-knowledge', label: 'Working Knowledge' },
  { value: 'familiar', label: 'Familiar' },
];

export const DEFAULT_PROFILE = {
  name: '[ADD YOUR NAME]',
  headline: 'Assistant Manager | Data Analytics | AI-Enabled Business Solutions',
  heroDescription: 'Assistant Manager with 2+ years of professional experience, combining business understanding, data analytics, AI-assisted workflows and modern technology to solve practical problems.',
  about: 'I turn business problems into practical solutions using data, AI and modern technology. With 2+ years of experience as an Assistant Manager at Dhuri Na Venture Private Limited, I combine business understanding, data analytics, AI-assisted workflows, and modern technology to solve practical problems.\n\nMy journey from MAS Educative to Assistant Manager has been defined by continuous learning and practical application. I work with Python, SQL, Power BI, and Excel for data analysis; build web applications with Next.js, React, Supabase, and PostgreSQL; and leverage AI to accelerate research, analysis, development, and creative workflows.\n\nI focus on solving the underlying business problem rather than simply using technology. Whether it\'s building a dashboard that drives decisions, automating a repetitive workflow, or developing a web application that streamlines operations, my approach is always: understand the problem first, then apply the right tools.',
  location: '[ADD YOUR LOCATION]',
  email: '[ADD YOUR EMAIL]',
  phone: '[ADD YOUR PHONE]',
  linkedin: '[ADD YOUR LINKEDIN URL]',
  github: '[ADD YOUR GITHUB URL]',
  openToWork: true,
  ctaText: 'Let\'s Build Something Useful',
};

export const WHAT_I_BRING = [
  {
    title: 'Business Understanding',
    description: 'Understand operational requirements and translate them into practical solutions.',
    icon: 'briefcase',
  },
  {
    title: 'Data Thinking',
    description: 'Use Excel, SQL, Python and Power BI to analyze and communicate data.',
    icon: 'bar-chart-2',
  },
  {
    title: 'AI-Enabled Productivity',
    description: 'Use AI to accelerate research, analysis, development and creative workflows.',
    icon: 'cpu',
  },
  {
    title: 'Technology Execution',
    description: 'Build practical web applications using modern technologies.',
    icon: 'code',
  },
  {
    title: 'Problem Solving',
    description: 'Focus on solving the underlying business problem rather than simply using technology.',
    icon: 'puzzle',
  },
];

export const CAREER_JOURNEY = [
  {
    role: 'Assistant Manager',
    company: 'Dhuri Na Venture Private Limited',
    period: '2+ Years',
    description: 'Data + AI + Technology',
    isCurrent: true,
  },
  {
    role: '[ADD EXACT DESIGNATION]',
    company: 'MAS Educative',
    period: '[ADD DATES]',
    description: 'Professional Foundation',
    isCurrent: false,
  },
];

export const PROFESSIONAL_SNAPSHOT = [
  { label: '2+ Years', value: 'Professional Experience' },
  { label: 'Assistant Manager', value: 'Current Role' },
  { label: 'Data & Analytics', value: 'Core Competency' },
  { label: 'AI-Enabled Workflows', value: 'Productivity Multiplier' },
  { label: 'Web Applications', value: 'Technical Capability' },
];