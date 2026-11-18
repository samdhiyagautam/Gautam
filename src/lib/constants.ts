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
    'Data Analyst who turns messy operational data into dashboards and decisions. 2+ years of professional experience as an Assistant Manager, combining business understanding, data modeling, automated ETL pipelines, and executive dashboards.',
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
      'Designed and deployed operational Power BI dashboards with custom DAX measures and automated data refresh, enabling leadership to track departmental KPIs and cutting monthly report compilation time by [ADD REAL METRIC: e.g. 75%].',
      'Automated recurring cross-departmental reporting pipelines using Python (Pandas) and SQL, saving [ADD REAL METRIC: e.g. 10+] hours of manual weekly data consolidation.',
      'Engineered standardized SQL queries and analytical views across operational PostgreSQL databases to consolidate fragmented data sources, resolving metric discrepancies across teams.',
      'Partnered with departmental stakeholders to translate operational pain points into structured reporting specifications and actionable visual analytics.',
      'Developed and maintained internal operations web applications using Next.js, Supabase, and PostgreSQL, supporting daily staff workflow and structured data intake.',
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
  { id: 'fallback-skill-sheets', name: 'Google Sheets', category: 'data-analytics', proficiency: 'applied', description: 'Collaborative analysis, formulas, and reporting automation', order: 8, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-looker', name: 'Looker Studio', category: 'data-analytics', proficiency: 'working-knowledge', description: 'Cloud dashboard creation and KPI visualization', order: 9, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },

  // 2. Supporting Additional Skills: Web Development
  { id: 'fallback-skill-postgres', name: 'PostgreSQL', category: 'web-development', proficiency: 'applied', description: 'Relational database querying, constraints, and views', order: 10, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-supabase', name: 'Supabase', category: 'web-development', proficiency: 'applied', description: 'Postgres backend, Row Level Security, Auth', order: 11, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-nextjs', name: 'Next.js', category: 'web-development', proficiency: 'applied', description: 'Full-stack React framework, App Router', order: 12, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-react', name: 'React', category: 'web-development', proficiency: 'applied', description: 'UI component development and interactive views', order: 13, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-ts', name: 'TypeScript', category: 'web-development', proficiency: 'applied', description: 'Type-safe application scripting', order: 14, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-tailwind', name: 'Tailwind CSS', category: 'web-development', proficiency: 'applied', description: 'Responsive layout and interface styling', order: 15, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },

  // 3. Supporting Additional Skills: AI & Automation
  { id: 'fallback-skill-prompt', name: 'Prompt Engineering', category: 'ai-automation', proficiency: 'core', description: 'Structured prompting for query drafting and data exploration', order: 16, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-automation', name: 'Workflow Automation', category: 'ai-automation', proficiency: 'applied', description: 'End-to-end reporting automation with human review', order: 17, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-aidata', name: 'AI-Assisted Analysis', category: 'ai-automation', proficiency: 'applied', description: 'Pattern detection and exploratory query scaffolding', order: 18, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },

  // 4. Supporting Additional Skills: Creative & Visual Design
  { id: 'fallback-skill-figma', name: 'Figma', category: 'creative-technology', proficiency: 'applied', description: 'Dashboard mockups and UX layout wireframing', order: 19, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
  { id: 'fallback-skill-canva', name: 'Canva', category: 'creative-technology', proficiency: 'core', description: 'Presentation decks, executive reporting visuals', order: 20, isActive: true, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
];

export const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'case-study-ipl-cricket-analytics',
    name: 'IPL Cricket Analytics — SQL & Python Pipeline',
    category: 'data-analytics',
    problem:
      'Multi-season cricket performance and match strategy questions required deep ball-by-ball analysis across 1,243 matches and 295,732 deliveries to answer 12 tactical business questions (death-over economy, toss impact by stadium, and chase vs. defend patterns) without complex cloud dependencies.',
    dataUsed:
      'Official ball-by-ball IPL match dataset from cricsheet.org (ODC-By licensed), comprising 1,243 matches and 295,732 deliveries (2008–2026) with legal-delivery filtering and bowler-credited wicket tagging.',
    role: 'Lead Data Analyst',
    technologies: ['SQL', 'SQLite', 'Python', 'Pandas', 'Excel', 'SVG Data Viz'],
    approach:
      'Engineered a normalized 2-table schema with compound B-tree indexes; authored 12 modular SQL analytical queries using CTEs, window functions (RANK, DENSE_RANK, LAG), and custom aggregations; built a dependency-free Python ingestion and SVG chart generation pipeline.',
    solution:
      'An automated analytical pipeline that parses SQL query markers, executes all 12 queries against indexed SQLite tables, exports clean CSV results, and generates visual trend charts.',
    keyFeatures: [
      'Toss impact analysis by venue: identified specific stadiums where chasing teams achieved > [ADD REAL METRIC: e.g. 54%] win rates',
      'Bowler economy rankings evaluated with minimum legal deliveries qualification filters to eliminate small-sample bias',
      'Historical chase-vs-defend win percentages compared between regular season games and playoff knockouts [ADD REAL METRIC]',
      'Automated Python pipeline generating 12 CSV result tables and high-resolution season trend charts',
    ],
    keyInsights: [
      'Toss impact varies by venue: chasing teams hold a > [ADD REAL METRIC: e.g. 54%] win advantage at specific dew-heavy stadiums.',
      'Death-over bowler economy rankings shift dramatically once a minimum legal delivery threshold is enforced.',
      'Defending teams demonstrated a statistically higher win rate in playoff knockout pressure situations [ADD REAL METRIC].',
    ],
    outcome:
      'Automated pipeline processes 295,000+ delivery records in [ADD REAL METRIC: e.g. < 4 seconds], eliminating manual calculations and auto-generating 12 verified question results.',
    githubUrl: 'https://github.com/samdhiyagautam/Gautam/tree/main/demo-projects/ipl-analysis',
    liveDemoUrl: 'https://github.com/samdhiyagautam/ipl-cricket-analytics',
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
      'Fragmented transactional retail data made it difficult to analyze monthly revenue trends, customer lifetime value, product category performance, and seasonal sales spikes across multiple customer segments.',
    dataUsed:
      'Comprehensive retail sales dataset with order records, customer demographics, product categories, and transaction amounts.',
    role: 'Data Analyst & BI Developer',
    technologies: ['SQL', 'Python', 'Power BI', 'DAX', 'Power Query', 'Excel'],
    approach:
      'Designed star-schema analytical model; constructed 11 advanced SQL queries utilizing Common Table Expressions (CTEs), CASE pivot transformations, and LAG/LEAD window functions to calculate month-over-month growth; published automated pipeline and Power BI report structure.',
    solution:
      'A multi-tool analytics pipeline with automated SQL/Python ETL execution, interactive Power BI dashboards, and structured Excel summary workbooks.',
    keyFeatures: [
      'Customer concentration analysis: top 20% of customer accounts drove [ADD REAL METRIC: e.g. 68%] of total company revenue',
      'Seasonality & MoM growth tracking: pinpointed Q4 sales surge of [ADD REAL METRIC]% across apparel and electronics',
      'Repeat customer behavior: identified that repeat buyers had a [ADD REAL METRIC]% higher average order value (AOV)',
      'Interactive Power BI report with star-schema modeling, DAX time-intelligence measures, and automated refresh',
    ],
    keyInsights: [
      'Pareto distribution confirmed: top 20% of customers generated [ADD REAL METRIC: e.g. 68%] of total company sales revenue.',
      'Q4 seasonality generated a [ADD REAL METRIC]% increase in gross sales, driven by targeted promotional campaigns.',
      'Repeat buyers demonstrated a [ADD REAL METRIC]% higher average basket size than one-time shoppers.',
    ],
    outcome:
      'Reduced monthly sales reporting compilation time by [ADD REAL METRIC: e.g. 80%], replacing manual spreadsheets with automated queries and interactive DAX measures.',
    githubUrl: 'https://github.com/samdhiyagautam/Gautam/tree/main/demo-projects/retail-sales-analysis',
    liveDemoUrl: 'https://github.com/samdhiyagautam/retail-sales-analysis',
    caseStudyUrl: '/projects/case-study-retail-sales-analysis',
    thumbnail: '/projects/retail-monthly-revenue.png',
    screenshots: ['/projects/retail-monthly-revenue.png', '/projects/retail-category-revenue.png'],
    datasetUrl: 'https://github.com/samdhiyagautam/retail-sales-analysis',
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
      'Cross-departmental operational metrics were scattered across disconnected sheets and manual logs at Dhurina, leading to multi-day reporting delays, inconsistent KPI definitions between teams, and lack of real-time visibility for management.',
    dataUsed:
      'Operational workflow logs, departmental task records, and administrative performance data spanning 2+ years of operations at Dhurina.',
    role: 'Assistant Manager & Analytics Lead',
    technologies: ['Power BI', 'DAX', 'Power Query', 'Microsoft Excel', 'SQL', 'PostgreSQL'],
    approach:
      'Partnered with operational department leads to establish unified business metric definitions; engineered Power Query ETL models to ingest multi-source data; built an executive Power BI dashboard with dynamic date hierarchies and automated scheduled refresh.',
    solution:
      'A centralized executive BI dashboard delivering automated weekly operational health metrics and SLA tracking.',
    keyFeatures: [
      'Unified KPI reporting model across operations, quality, and administrative departments',
      'Automated data ingestion and scheduled Power BI refresh replacing manual weekly compilations',
      'Custom DAX measures for task resolution velocity, team throughput, and SLA compliance',
      'Identified process bottlenecks resulting in a [ADD REAL METRIC]% reduction in task backlog',
    ],
    keyInsights: [
      'Identified operational bottlenecks causing [ADD REAL METRIC]% lag in cross-departmental turnaround.',
      'Standardized metric formulas eliminated conflicting reporting numbers between operational teams.',
      'Enabled proactive leadership resource allocation by tracking daily queue velocity against SLA targets.',
    ],
    outcome:
      'Streamlined weekly executive reporting turnaround by [ADD REAL METRIC: e.g. 75%], eliminating [ADD REAL METRIC: e.g. 10+] hours of manual spreadsheet compilation per week.',
    githubUrl: 'https://github.com/samdhiyagautam/Gautam',
    liveDemoUrl: '',
    caseStudyUrl: '/projects/case-study-operations-kpi-dashboard',
    thumbnail: '/projects/operations-kpi-dashboard.svg',
    screenshots: ['/projects/operations-kpi-dashboard.svg'],
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
