import type { NavItem, SkillCategory, ProjectCategory, Experience, Skill, Project, Profile } from '@/types';

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

// ---------------------------------------------------------------------------
// CMS fallbacks: used when Supabase is not configured or tables are empty.
// constants.ts is the ONLY place fallback content lives — components and the
// CMS read layer both import from here. No duplicated copies elsewhere.
// ---------------------------------------------------------------------------

export const FALLBACK_PROFILE: Profile = {
  name: 'Gautam Samdhiya',
  headline: 'Data Analyst | SQL · Python · Power BI · Excel',
  heroDescription:
    'Data Analyst with 2+ years of professional experience as an Assistant Manager, combining business understanding, data analytics with SQL, Python, Power BI and Excel, AI-assisted workflows and modern technology to solve practical problems.',
  about:
    "I turn business problems into practical solutions using data, AI and modern technology. With 2+ years of experience as an Assistant Manager at Dhuri Na Venture Private Limited, I combine business understanding, data analytics, AI-assisted workflows, and modern technology to solve practical problems.\n\nMy journey from MAS Educative to Assistant Manager has been defined by continuous learning and practical application. I work with Python, SQL, Power BI, and Excel for data analysis; build web applications with Next.js, React, Supabase, and PostgreSQL; and leverage AI to accelerate research, analysis, development, and creative workflows.\n\nI focus on solving the underlying business problem rather than simply using technology. Whether it's building a dashboard that drives decisions, automating a repetitive workflow, or developing a web application that streamlines operations, my approach is always: understand the problem first, then apply the right tools.",
  location: '[ADD YOUR LOCATION]',
  email: 'gautamsamdhiya2000@gmail.com',
  phone: '8797918451',
  linkedin: 'https://www.linkedin.com/in/connectwithgautam',
  github: 'https://github.com/samdhiyagautam',
  openToWork: true,
  ctaText: "Let's Build Something Useful",
  updatedAt: new Date(0).toISOString(),
};

export const FALLBACK_EXPERIENCES: Experience[] = [
  {
    id: 'fallback-exp-1',
    company: 'Dhuri Na Venture Private Limited',
    designation: 'Assistant Manager',
    startDate: '2022-01',
    endDate: null,
    isCurrent: true,
    responsibilities: [
      'Lead data analytics initiatives for business decision-making',
      'Design and maintain Power BI dashboards for operational reporting',
      'Automate repetitive workflows using Python and AI-assisted tools',
      'Collaborate with cross-functional teams to define data requirements',
      'Build and maintain web applications for internal operations',
      'Implement AI-enabled productivity workflows across teams',
    ],
    projects: [
      'Executive Dashboard - Real-time KPI monitoring',
      'Sales Analytics Pipeline - Automated data processing',
      'Operations Portal - Next.js web application',
      'AI-Assisted Reporting System - automated compilation with human review checkpoints',
    ],
    technologies: ['Python', 'SQL', 'Power BI', 'Excel', 'Power Query', 'DAX', 'Next.js', 'React', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'AI Tools'],
    description:
      'As Assistant Manager, I bridge business requirements with technical solutions. My role combines data analytics, business intelligence, web development, and AI-enabled automation to drive operational efficiency and data-driven decision making.',
    order: 1,
    status: 'published',
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: 'fallback-exp-2',
    company: 'MAS Educative',
    designation: '[ADD EXACT DESIGNATION]',
    startDate: '[ADD START DATE]',
    endDate: '[ADD END DATE]',
    isCurrent: false,
    responsibilities: ['[ADD VERIFIED RESPONSIBILITY 1]', '[ADD VERIFIED RESPONSIBILITY 2]'],
    projects: ['[ADD PROJECT 1]'],
    technologies: ['[ADD TECHNOLOGY 1]'],
    description: '[ADD ROLE DESCRIPTION]',
    order: 2,
    status: 'draft',
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
];

export const FALLBACK_SKILLS: Skill[] = [
  { id: 'fallback-skill-python', name: 'Python', category: 'data-analytics', proficiency: 'core', description: 'Data analysis, automation, scripting', order: 1, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-pandas', name: 'Pandas', category: 'data-analytics', proficiency: 'core', description: 'Data manipulation and analysis', order: 2, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-sql', name: 'SQL', category: 'data-analytics', proficiency: 'core', description: 'Querying, optimization, data modeling', order: 3, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-powerbi', name: 'Power BI', category: 'data-analytics', proficiency: 'core', description: 'Dashboard development, DAX, data visualization', order: 4, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-excel', name: 'Excel', category: 'data-analytics', proficiency: 'core', description: 'Advanced formulas, Power Query, modeling', order: 5, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-powerquery', name: 'Power Query', category: 'data-analytics', proficiency: 'applied', description: 'Data transformation and ETL', order: 6, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-dax', name: 'DAX', category: 'data-analytics', proficiency: 'applied', description: 'Data Analysis Expressions for Power BI', order: 7, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-sheets', name: 'Google Sheets', category: 'data-analytics', proficiency: 'applied', description: 'Collaborative analysis, Apps Script', order: 8, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-looker', name: 'Looker Studio', category: 'data-analytics', proficiency: 'working-knowledge', description: 'Dashboard creation and sharing', order: 9, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-nextjs', name: 'Next.js', category: 'web-development', proficiency: 'core', description: 'Full-stack React framework, App Router', order: 1, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-react', name: 'React', category: 'web-development', proficiency: 'core', description: 'Component architecture, hooks, state management', order: 2, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-ts', name: 'TypeScript', category: 'web-development', proficiency: 'core', description: 'Type-safe development', order: 3, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-html', name: 'HTML', category: 'web-development', proficiency: 'core', description: 'Semantic markup, accessibility', order: 4, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-css', name: 'CSS', category: 'web-development', proficiency: 'core', description: 'Modern CSS, animations, layouts', order: 5, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-tailwind', name: 'Tailwind CSS', category: 'web-development', proficiency: 'core', description: 'Utility-first styling', order: 6, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-supabase', name: 'Supabase', category: 'web-development', proficiency: 'applied', description: 'Backend-as-a-service, auth, database', order: 7, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-postgres', name: 'PostgreSQL', category: 'web-development', proficiency: 'applied', description: 'Relational database design, queries', order: 8, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-aidev', name: 'AI-Assisted Development', category: 'ai-automation', proficiency: 'core', description: 'Code generation, debugging, architecture', order: 1, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-prompt', name: 'Prompt Engineering', category: 'ai-automation', proficiency: 'core', description: 'Structured prompting for consistent results', order: 2, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-aidata', name: 'AI-Assisted Data Analysis', category: 'ai-automation', proficiency: 'applied', description: 'Automated insights, pattern detection', order: 3, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-aiworkflows', name: 'AI-Powered Workflows', category: 'ai-automation', proficiency: 'applied', description: 'Process automation with LLMs', order: 4, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-aicontent', name: 'AI Content Generation', category: 'ai-automation', proficiency: 'applied', description: 'Technical writing, documentation', order: 5, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-automation', name: 'Workflow Automation', category: 'ai-automation', proficiency: 'applied', description: 'End-to-end process automation', order: 6, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-canva', name: 'Canva', category: 'creative-technology', proficiency: 'core', description: 'Design, presentations, brand assets', order: 1, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-figma', name: 'Figma', category: 'creative-technology', proficiency: 'applied', description: 'UI/UX design, prototyping, design systems', order: 2, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-photoshop', name: 'Photoshop', category: 'creative-technology', proficiency: 'working-knowledge', description: 'Image editing, compositing', order: 3, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-aigraphic', name: 'AI Graphic Design', category: 'creative-technology', proficiency: 'applied', description: 'Midjourney, DALL-E, generative design', order: 4, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-aivideo', name: 'AI Video Creation', category: 'creative-technology', proficiency: 'working-knowledge', description: 'Runway, Sora, video generation', order: 5, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-videoedit', name: 'Video Editing', category: 'creative-technology', proficiency: 'working-knowledge', description: 'Premiere Pro, DaVinci Resolve', order: 6, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
];


// ---------------------------------------------------------------------------
// FALLBACK_PROJECTS intentionally empty (truthfulness rule).
// Removed 2026-10-07 - unverified template projects, no owner proof provided:
//   1. Portfolio Website (claimed Vercel/GitHub CI/CD deployment - never verified)
//   2. Executive Dashboard (no dashboard file, link, or screenshot)
//   3. AI-Assisted Reporting Automation (no pipeline code or report sample)
//   4. Operations Portal (no application code or deployment)
//   5. Sales Analytics Pipeline (no ETL code or dataset)
//   6. AI Content Generation Toolkit (no prompt library or samples)
// Add real projects via Admin CMS (publish) or constants once proof exists.
// ---------------------------------------------------------------------------

export const FALLBACK_PROJECTS: Project[] = [];
