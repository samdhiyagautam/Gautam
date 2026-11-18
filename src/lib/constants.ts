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
    description: 'Understand operational workflows and translate business requirements into practical data solutions.',
    icon: 'briefcase',
  },
  {
    title: 'SQL, Excel & Power BI',
    description: 'Build relational schemas, author analytical SQL queries (CTEs, window functions), and engineer automated reports.',
    icon: 'bar-chart-2',
  },
  {
    title: 'Dashboards & Decisions',
    description: 'Design self-serve executive dashboards with custom DAX measures that track core KPIs and drive leadership decisions.',
    icon: 'puzzle',
  },
];

export const CAREER_JOURNEY = [
  {
    role: 'Assistant Manager',
    company: 'Dhurina',
    period: '2+ Years',
    description: 'Data + BI + Operations',
    isCurrent: true,
  },
];

export const PROFESSIONAL_SNAPSHOT = [
  { label: '2+ Years', value: 'Professional Experience' },
  { label: 'Assistant Manager', value: 'Current Role' },
  { label: 'SQL · Power BI · Excel', value: 'Core Analytics Stack' },
  { label: 'Dashboards & Decisions', value: 'Primary Focus' },
];

// ---------------------------------------------------------------------------
// CMS fallbacks: used when Supabase is not configured or tables are empty.
// constants.ts is the ONLY place fallback content lives — components and the
// CMS read layer both import from here. No duplicated copies elsewhere.
// ---------------------------------------------------------------------------

export const FALLBACK_PROFILE: Profile = {
  name: 'Gautam Samdhiya',
  headline: 'Data Analyst | SQL · Power BI · Excel · Python',
  heroDescription:
    '2+ years of professional experience as an Assistant Manager, combining business understanding with hands-on relational data modeling, automated ETL pipelines, and executive dashboards.',
  about:
    "I turn business problems into practical solutions using data, analytics and modern technology. With 2+ years of experience as an Assistant Manager at Dhurina, I combine commercial understanding, hands-on SQL, Power BI, Excel, and Python data modeling, and automated pipelines to drive reliable business decisions.\n\nMy focus is solving the underlying business problem rather than simply using tools. Whether building an executive dashboard that reveals operational bottlenecks, automating a repetitive cross-departmental reporting pipeline, or standardizing database queries, my approach is always: understand the business challenge first, audit the data carefully, then deliver measurable impact.",
  location: 'Ranchi, Jharkhand, India',
  email: 'gautamsamdhiya2000@gmail.com',
  phone: 'Available on request',
  linkedin: 'https://www.linkedin.com/in/connectwithgautam',
  github: 'https://github.com/samdhiyagautam',
  openToWork: true,
  ctaText: "Let's Connect",
  updatedAt: new Date(0).toISOString(),
};

export const FALLBACK_EXPERIENCES: Experience[] = [
  {
    id: 'fallback-exp-1',
    company: 'Dhurina',
    designation: 'Assistant Manager',
    startDate: '2024-10',
    endDate: null,
    isCurrent: true,
    responsibilities: [
      'Designed and deployed operational Power BI dashboards with custom DAX measures and scheduled refresh, replacing manual reporting compilation with self-serve KPI tracking for department leadership.',
      'Automated recurring cross-departmental reporting pipelines using Python (Pandas) and SQL, eliminating repetitive manual data consolidation across operational teams.',
      'Engineered standardized SQL queries and analytical views across operational PostgreSQL databases to unify fragmented sources and resolve metric discrepancies across departments.',
      'Partnered directly with departmental leads to translate operational bottlenecks and ad-hoc inquiries into clear reporting specifications and actionable visual dashboards.',
      'Maintained internal operations web applications using Next.js, Supabase, and PostgreSQL to streamline daily administrative workflows and standardize data intake.',
    ],
    projects: [
      'Operational Performance & Executive KPI Dashboard (Power BI)',
      'Cross-Departmental Reporting Automation (Python + SQL)',
      'Operations Portal & Database Data Intake (Next.js + Supabase)',
    ],
    technologies: ['SQL', 'Power BI', 'DAX', 'Excel', 'Power Query', 'Python', 'Pandas', 'PostgreSQL', 'Supabase'],
    description:
      'As Assistant Manager, I bridge business operations and data analytics. My work centers on data modeling, operational KPI dashboards, automating recurring reports with Python and SQL, and translating complex operational data into clear decisions for leadership.',
    order: 1,
    status: 'published',
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
];

export const FALLBACK_SKILLS: Skill[] = [
  // 1. Data & Analytics (Top priority for Data Analyst / BI Analyst)
  { id: 'fallback-skill-sql', name: 'SQL', category: 'data-analytics', proficiency: 'core', description: 'Querying, joins, aggregations, CTEs, window functions, schema design', order: 1, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-excel', name: 'Excel', category: 'data-analytics', proficiency: 'core', description: 'Advanced formulas (XLOOKUP, INDEX/MATCH), Power Query, pivot tables, modeling', order: 2, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-powerbi', name: 'Power BI', category: 'data-analytics', proficiency: 'core', description: 'Interactive dashboard development, star-schema modeling, scheduled refresh', order: 3, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-dax', name: 'DAX', category: 'data-analytics', proficiency: 'core', description: 'Data Analysis Expressions for calculated measures, time intelligence, KPI cards', order: 4, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-python', name: 'Python', category: 'data-analytics', proficiency: 'core', description: 'Data analysis, automated pipeline scripting, ETL routines', order: 5, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-pandas', name: 'Pandas', category: 'data-analytics', proficiency: 'core', description: 'Data wrangling, cleaning, restructuring, aggregation, and export', order: 6, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-stats', name: 'Statistics Basics', category: 'data-analytics', proficiency: 'applied', description: 'Descriptive statistics, distributions, trend evaluation, variance, and outlier detection', order: 7, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-powerquery', name: 'Power Query', category: 'data-analytics', proficiency: 'applied', description: 'Data extraction, transformation, M code steps, automated cleaning', order: 8, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-sheets', name: 'Google Sheets', category: 'data-analytics', proficiency: 'applied', description: 'Collaborative analysis, formulas, and reporting automation', order: 9, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-looker', name: 'Looker Studio', category: 'data-analytics', proficiency: 'working-knowledge', description: 'Cloud dashboard creation and KPI visualization', order: 10, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },

  // 2. Supporting Additional Skills: Web Development
  { id: 'fallback-skill-postgres', name: 'PostgreSQL', category: 'web-development', proficiency: 'applied', description: 'Relational database querying, constraints, and views', order: 11, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-supabase', name: 'Supabase', category: 'web-development', proficiency: 'applied', description: 'Postgres backend, Row Level Security, Auth', order: 12, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-nextjs', name: 'Next.js', category: 'web-development', proficiency: 'applied', description: 'Full-stack React framework, App Router', order: 13, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-react', name: 'React', category: 'web-development', proficiency: 'applied', description: 'UI component development and interactive views', order: 14, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-ts', name: 'TypeScript', category: 'web-development', proficiency: 'applied', description: 'Type-safe application scripting', order: 15, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-tailwind', name: 'Tailwind CSS', category: 'web-development', proficiency: 'applied', description: 'Responsive layout and interface styling', order: 16, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },

  // 3. Supporting Additional Skills: AI & Automation
  { id: 'fallback-skill-prompt', name: 'Prompt Engineering', category: 'ai-automation', proficiency: 'core', description: 'Structured prompting for query drafting and data exploration', order: 17, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-automation', name: 'Workflow Automation', category: 'ai-automation', proficiency: 'applied', description: 'End-to-end reporting automation with human review', order: 18, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-aidata', name: 'AI-Assisted Analysis', category: 'ai-automation', proficiency: 'applied', description: 'Pattern detection and exploratory query scaffolding', order: 19, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },

  // 4. Supporting Additional Skills: Creative & Visual Design
  { id: 'fallback-skill-figma', name: 'Figma', category: 'creative-technology', proficiency: 'applied', description: 'Dashboard mockups and UX layout wireframing', order: 20, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-canva', name: 'Canva', category: 'creative-technology', proficiency: 'core', description: 'Presentation decks, executive reporting visuals', order: 21, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
];

export const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'case-study-ipl-cricket-analytics',
    name: 'IPL Cricket Analytics — SQL & Python Pipeline',
    category: 'data-analytics',
    problem:
      'Multi-season cricket performance and match strategy questions required deep ball-by-ball analysis across 1,243 matches and 295,732 deliveries to answer 12 tactical questions (death-over economy, toss impact by stadium, and chase vs. defend patterns) without complex cloud dependencies.',
    dataUsed:
      'Official ball-by-ball IPL match dataset from cricsheet.org (ODC-By licensed), covering 1,243 matches and 295,732 deliveries (2008–2026) with legal-delivery filtering and bowler-credited wicket tagging.',
    role: 'Personal Project',
    technologies: ['SQL', 'SQLite', 'Python', 'Pandas', 'Excel', 'SVG Data Viz'],
    approach:
      'Engineered a normalized 2-table schema with compound B-tree indexes; authored 12 modular SQL analytical queries using CTEs, window functions (RANK, DENSE_RANK, LAG), and custom aggregations; built a dependency-free Python ingestion and SVG chart generation pipeline.',
    solution:
      'An automated analytical pipeline that parses SQL query markers, executes all 12 queries against indexed SQLite tables, exports clean CSV results, and generates visual trend charts.',
    keyFeatures: [
      'Toss decision impact: teams choosing to field first won 54.7% of games (443 of 810 matches across 19 seasons)',
      'Venue-specific chase win rates: Sawai Mansingh Stadium (Jaipur) favored chasing teams at 64.7% (44 of 68 matches), while Chepauk (Chennai) favored defending teams with a 54.1% defend win rate',
      'Bowler economy rankings evaluated with a 30-over minimum threshold: identified A Chandila (6.21), Sohail Tanvir (6.46), and Sunil Narine (6.79 across 775 overs) as top performers',
      'Automated Python pipeline generating 12 CSV result tables and high-resolution season trend charts',
    ],
    keyInsights: [
      'Toss decision advantage: electing to field first yielded a 54.7% overall match win rate across 810 decisions.',
      'Venue contrast: Sawai Mansingh Stadium in Jaipur favored chasing teams heavily (64.7% chase wins), whereas MA Chidambaram Stadium in Chennai favored defending teams (54.1% defend wins).',
      'Enforcing a 30-over qualification threshold removed small-sample noise and isolated elite long-term economy leaders.',
    ],
    outcome:
      'Dependency-free Python pipeline executes 12 analytical SQL queries across all 295,732 records in 4.2 seconds, exporting verified CSV results and trend charts.',
    githubUrl: 'https://github.com/samdhiyagautam/Gautam/tree/main/demo-projects/ipl-analysis',
    liveDemoUrl: '',
    caseStudyUrl: '/projects/case-study-ipl-cricket-analytics',
    thumbnail: '/projects/ipl-season-runs.png',
    screenshots: ['/projects/ipl-season-runs.png', '/projects/ipl-team-wins.png'],
    datasetUrl: 'https://cricsheet.org',
    attachments: [],
    videoUrl: '',
    videos: [],
    isFeatured: true,
    status: 'published',
    order: 1,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: 'case-study-retail-sales-analysis',
    name: 'Retail Sales Analysis & Customer KPI Modeling',
    category: 'data-analytics',
    problem:
      'Designed an end-to-end retail analytics practice portfolio project using a synthetic multi-year transaction dataset generated by Python (1,687 orders, 378 customers) to practice and demonstrate advanced relational data modeling, analytical SQL queries (CTEs, window functions), customer retention analysis, and Power BI reporting without proprietary company data.',
    dataUsed:
      'Synthetic retail transaction dataset generated by a Python script in this repo (demo-projects/retail-sales-analysis), created for practicing SQL and Power BI.',
    role: 'Personal Project',
    technologies: ['SQL', 'Python', 'Power BI', 'DAX', 'Power Query', 'Excel'],
    approach:
      'Designed star-schema analytical model; constructed 11 modular SQL queries utilizing Common Table Expressions (CTEs), CASE pivot transformations, and LAG window functions to calculate month-over-month growth; authored 11 modular analytical SQL queries, an automated Python data pipeline, a 16-sheet Excel summary workbook, and Power BI dimensional modeling notes.',
    solution:
      'A multi-tool analytics pipeline with automated SQL/Python ETL execution, interactive Power BI dashboards, and structured Excel summary workbooks.',
    keyFeatures: [
      'Customer revenue concentration: top 20% of customer accounts (76 customers) drove 50.9% (synthetic data) ($4.20M of $8.26M (synthetic data)) of total revenue',
      'Seasonal revenue surge: Q4 generated peak sales of $1.32M in 2024 (+37.0% QoQ growth) and $1.24M in 2025',
      'Category revenue mix: Apparel ($2.49M, 30.2%) and Electronics ($2.22M, 26.8%) combined for 57.0% of total revenue',
      'Customer retention breakdown: repeat buyers comprised 84.4% (synthetic data) (319 customers) of the active customer base',
    ],
    keyInsights: [
      'Top 20% of customers generated 50.9% (synthetic data) of total company revenue ($4.20M out of $8.26M (synthetic data)).',
      'Q4 was the highest revenue quarter in both recorded years ($1.32M in 2024 and $1.24M in 2025).',
      'Repeat buyer retention reached 84.4% (synthetic data) across active synthetic customer accounts.',
    ],
    outcome:
      'In-memory SQLite analysis pipeline processes 1,687 orders and 378 customers across 11 queries in 0.16 seconds, producing verified CSV outputs and Power BI data models.',
    githubUrl: 'https://github.com/samdhiyagautam/Gautam/tree/main/demo-projects/retail-sales-analysis',
    liveDemoUrl: '',
    caseStudyUrl: '/projects/case-study-retail-sales-analysis',
    thumbnail: '/projects/retail-monthly-revenue.png',
    screenshots: ['/projects/retail-monthly-revenue.png', '/projects/retail-category-revenue.png'],
    datasetUrl: '',
    attachments: [],
    videoUrl: '',
    videos: [],
    isFeatured: true,
    status: 'published',
    order: 2,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: 'case-study-operations-kpi-dashboard',
    name: 'Operational KPI & Executive Decision Dashboard',
    category: 'data-analytics',
    problem:
      'Cross-departmental operational metrics were scattered across disconnected spreadsheets and manual logs at Dhurina, leading to delayed decision-making, inconsistent KPI definitions between teams, and lack of scheduled-refresh visibility for management.',
    dataUsed:
      'Operational workflow logs, departmental task records, and administrative performance data spanning 2+ years of operations at Dhurina (Internal work — data confidential).',
    role: 'Assistant Manager',
    technologies: ['Power BI', 'DAX', 'Power Query', 'Microsoft Excel', 'SQL', 'PostgreSQL'],
    approach:
      'Partnered directly with operational department leads to establish unified KPI formulas and data definitions; engineered Power Query ETL models to ingest multi-source records; built an executive Power BI dashboard with dynamic date hierarchies and automated scheduled refresh.',
    solution:
      'A centralized executive BI dashboard delivering automated weekly operational health metrics and SLA tracking for department leadership.',
    keyFeatures: [
      'Internal work — data confidential: built for internal company operations at Dhurina',
      'Unified KPI reporting model across operations, quality, and administrative departments',
      'Automated data ingestion and scheduled Power BI refresh replacing manual weekly compilations',
      'Custom DAX measures for task resolution velocity, team throughput, and operational metrics',
    ],
    keyInsights: [
      'Standardized metric definitions eliminated conflicting monthly reporting numbers across operational teams.',
      'Automated scheduled data refresh replaced manual weekly compiling with self-serve executive dashboards.',
      'Provided department leadership with scheduled-refresh visibility into workflow queue velocity and operational throughput.',
    ],
    outcome:
      'Replaced repetitive manual weekly report compilations with automated, self-serve Power BI dashboards and standardized cross-departmental KPIs.',
    githubUrl: '',
    liveDemoUrl: '',
    caseStudyUrl: '/projects/case-study-operations-kpi-dashboard',
    thumbnail: '',
    screenshots: [],
    datasetUrl: '',
    attachments: [],
    videoUrl: '',
    videos: [],
    isFeatured: true,
    status: 'published',
    order: 3,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
];
