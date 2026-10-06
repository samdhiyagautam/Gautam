import { createClient } from "@/lib/supabase/server";
import {
  FALLBACK_PROFILE,
  FALLBACK_EXPERIENCES,
  FALLBACK_SKILLS,
  FALLBACK_PROJECTS,
} from "@/lib/constants";
import type {
  Experience,
  Profile,
  Project,
  ProjectCategory,
  Resume,
  SEO,
  Skill,
  SkillCategory,
} from "@/types";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && (url.startsWith("http://") || url.startsWith("https://")));
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

function isSkillCategory(value: unknown): value is SkillCategory {
  return (
    value === "data-analytics" ||
    value === "web-development" ||
    value === "ai-automation" ||
    value === "creative-technology"
  );
}

function isProjectCategory(value: unknown): value is ProjectCategory {
  return (
    value === "data-analytics" ||
    value === "ai-automation" ||
    value === "web-applications" ||
    value === "creative-technology"
  );
}

function isProficiency(
  value: unknown
): value is Skill["proficiency"] {
  return (
    value === "core" ||
    value === "applied" ||
    value === "working-knowledge" ||
    value === "familiar"
  );
}

function isStatus(value: unknown): value is "draft" | "published" {
  return value === "draft" || value === "published";
}

interface ExperienceRow {
  id: string;
  company: string;
  designation: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  responsibilities: unknown;
  projects: unknown;
  technologies: unknown;
  display_order: number;
  status: unknown;
  created_at: string;
  updated_at: string;
}

interface SkillRow {
  id: string;
  name: string;
  category: unknown;
  proficiency: unknown;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectRow {
  id: string;
  name: string;
  category: unknown;
  problem: string;
  approach: string;
  solution: string;
  role: string;
  technologies: unknown;
  key_features: unknown;
  outcome: string;
  github_url: string;
  live_demo_url: string;
  case_study_url: string;
  thumbnail: string;
  screenshots: unknown;
  is_featured: boolean;
  display_order: number;
  status: unknown;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  name: string;
  headline: string;
  hero_description: string;
  about: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  open_to_work: boolean;
  cta_text: string;
  updated_at: string;
}

interface ResumeRow {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  version: string;
  status: unknown;
  uploaded_at: string;
}

interface SeoRow {
  page_title: string;
  meta_description: string;
  og_image: string;
  twitter_card: string;
  structured_data: unknown;
}

function mapExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    company: row.company,
    designation: row.designation,
    startDate: row.start_date,
    endDate: row.end_date,
    isCurrent: row.is_current,
    responsibilities: toStringArray(row.responsibilities),
    projects: toStringArray(row.projects),
    technologies: toStringArray(row.technologies),
    description: row.description,
    order: row.display_order,
    status: isStatus(row.status) ? row.status : "draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    category: isSkillCategory(row.category) ? row.category : "data-analytics",
    proficiency: isProficiency(row.proficiency) ? row.proficiency : "familiar",
    description: row.description,
    order: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    category: isProjectCategory(row.category) ? row.category : "data-analytics",
    problem: row.problem,
    approach: row.approach,
    solution: row.solution,
    role: row.role,
    technologies: toStringArray(row.technologies),
    keyFeatures: toStringArray(row.key_features),
    outcome: row.outcome,
    githubUrl: row.github_url,
    liveDemoUrl: row.live_demo_url,
    caseStudyUrl: row.case_study_url,
    thumbnail: row.thumbnail,
    screenshots: toStringArray(row.screenshots),
    isFeatured: row.is_featured,
    status: isStatus(row.status) ? row.status : "draft",
    order: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    headline: row.headline,
    heroDescription: row.hero_description,
    about: row.about,
    location: row.location,
    email: row.email,
    phone: row.phone,
    linkedin: row.linkedin,
    github: row.github,
    openToWork: row.open_to_work,
    ctaText: row.cta_text,
    updatedAt: row.updated_at,
  };
}

function mapResume(row: ResumeRow): Resume {
  return {
    id: row.id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileSize: row.file_size,
    version: row.version,
    status: isStatus(row.status) ? row.status : "draft",
    uploadedAt: row.uploaded_at,
  };
}

function mapSeo(row: SeoRow): SEO {
  const structuredData =
    row.structured_data && typeof row.structured_data === "object"
      ? (row.structured_data as Record<string, unknown>)
      : {};
  return {
    pageTitle: row.page_title,
    metaDescription: row.meta_description,
    ogImage: row.og_image,
    twitterCard: row.twitter_card,
    structuredData,
  };
}

async function query<T>(table: string, build: (supabase: Awaited<ReturnType<typeof createClient>>) => PromiseLike<{ data: T | null; error: unknown }>): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await build(supabase);
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

// Public reads: published rows only. Falls back to constants when Supabase is
// unconfigured, unreachable, or tables are empty.
export async function getPublishedProfile(): Promise<Profile> {
  const row = await query<ProfileRow>("profiles", (supabase) =>
    supabase
      .from("profiles")
      .select("name, headline, hero_description, about, location, email, phone, linkedin, github, open_to_work, cta_text, updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  );
  return row ? mapProfile(row) : FALLBACK_PROFILE;
}

export async function getPublishedExperiences(): Promise<Experience[]> {
  const rows = await query<ExperienceRow[]>("experiences", (supabase) =>
    supabase
      .from("experiences")
      .select("id, company, designation, start_date, end_date, is_current, description, responsibilities, projects, technologies, display_order, status, created_at, updated_at")
      .eq("status", "published")
      .order("display_order", { ascending: true })
  );
  if (!rows || rows.length === 0) {
    return FALLBACK_EXPERIENCES.filter((e) => e.status === "published");
  }
  return rows.map(mapExperience);
}

export async function getPublishedSkills(): Promise<Skill[]> {
  const rows = await query<SkillRow[]>("skills", (supabase) =>
    supabase
      .from("skills")
      .select("id, name, category, proficiency, description, display_order, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
  );
  if (!rows || rows.length === 0) {
    return FALLBACK_SKILLS.filter((s) => s.isActive);
  }
  return rows.map(mapSkill);
}

export async function getPublishedProjects(): Promise<Project[]> {
  const rows = await query<ProjectRow[]>("projects", (supabase) =>
    supabase
      .from("projects")
      .select("id, name, category, problem, approach, solution, role, technologies, key_features, outcome, github_url, live_demo_url, case_study_url, thumbnail, screenshots, is_featured, display_order, status, created_at, updated_at")
      .eq("status", "published")
      .order("display_order", { ascending: true })
  );
  if (!rows || rows.length === 0) {
    return FALLBACK_PROJECTS.filter((p) => p.status === "published");
  }
  return rows.map(mapProject);
}

export async function getPublishedProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_PROJECTS.find((p) => p.id === id && p.status === "published") ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, category, problem, approach, solution, role, technologies, key_features, outcome, github_url, live_demo_url, case_study_url, thumbnail, screenshots, is_featured, display_order, status, created_at, updated_at")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    return mapProject(data as ProjectRow);
  } catch {
    return null;
  }
}

export async function getPublishedResume(): Promise<Resume | null> {
  const row = await query<ResumeRow>("resumes", (supabase) =>
    supabase
      .from("resumes")
      .select("id, file_name, file_url, file_size, version, status, uploaded_at")
      .eq("status", "published")
      .order("uploaded_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  );
  return row ? mapResume(row) : null;
}

export async function getSeoSettings(): Promise<SEO | null> {
  const row = await query<SeoRow>("seo_settings", (supabase) =>
    supabase
      .from("seo_settings")
      .select("page_title, meta_description, og_image, twitter_card, structured_data")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  );
  return row ? mapSeo(row) : null;
}

// Admin reads: all rows regardless of status (layout already enforces admin).
export async function getAdminProfile(): Promise<Profile> {
  const row = await query<ProfileRow>("profiles", (supabase) =>
    supabase
      .from("profiles")
      .select("name, headline, hero_description, about, location, email, phone, linkedin, github, open_to_work, cta_text, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  );
  return row ? mapProfile(row) : FALLBACK_PROFILE;
}

export async function getAdminSeo(): Promise<SEO | null> {
  const row = await query<SeoRow>("seo_settings", (supabase) =>
    supabase
      .from("seo_settings")
      .select("page_title, meta_description, og_image, twitter_card, structured_data")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  );
  return row ? mapSeo(row) : null;
}

async function getAdminRow<T, R>(
  table: string,
  id: string,
  columns: string,
  map: (row: R) => T
): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(table).select(columns).eq("id", id).maybeSingle();
    if (error || !data) return null;
    return map(data as R);
  } catch {
    return null;
  }
}

const EXPERIENCE_COLUMNS =
  "id, company, designation, start_date, end_date, is_current, description, responsibilities, projects, technologies, display_order, status, created_at, updated_at";
const SKILL_COLUMNS =
  "id, name, category, proficiency, description, display_order, is_active, created_at, updated_at";
const PROJECT_COLUMNS =
  "id, name, category, problem, approach, solution, role, technologies, key_features, outcome, github_url, live_demo_url, case_study_url, thumbnail, screenshots, is_featured, display_order, status, created_at, updated_at";

export function getAdminExperience(id: string): Promise<Experience | null> {
  return getAdminRow<Experience, ExperienceRow>("experiences", id, EXPERIENCE_COLUMNS, mapExperience);
}

export function getAdminSkill(id: string): Promise<Skill | null> {
  return getAdminRow<Skill, SkillRow>("skills", id, SKILL_COLUMNS, mapSkill);
}

export function getAdminProject(id: string): Promise<Project | null> {
  return getAdminRow<Project, ProjectRow>("projects", id, PROJECT_COLUMNS, mapProject);
}
export async function getAllExperiences(): Promise<Experience[]> {
  const rows = await query<ExperienceRow[]>("experiences", (supabase) =>
    supabase
      .from("experiences")
      .select("id, company, designation, start_date, end_date, is_current, description, responsibilities, projects, technologies, display_order, status, created_at, updated_at")
      .order("display_order", { ascending: true })
  );
  if (!rows || rows.length === 0) return FALLBACK_EXPERIENCES;
  return rows.map(mapExperience);
}

export async function getAllSkills(): Promise<Skill[]> {
  const rows = await query<SkillRow[]>("skills", (supabase) =>
    supabase
      .from("skills")
      .select("id, name, category, proficiency, description, display_order, is_active, created_at, updated_at")
      .order("display_order", { ascending: true })
  );
  if (!rows || rows.length === 0) return FALLBACK_SKILLS;
  return rows.map(mapSkill);
}

export async function getAllProjects(): Promise<Project[]> {
  const rows = await query<ProjectRow[]>("projects", (supabase) =>
    supabase
      .from("projects")
      .select("id, name, category, problem, approach, solution, role, technologies, key_features, outcome, github_url, live_demo_url, case_study_url, thumbnail, screenshots, is_featured, display_order, status, created_at, updated_at")
      .order("display_order", { ascending: true })
  );
  if (!rows || rows.length === 0) return FALLBACK_PROJECTS;
  return rows.map(mapProject);
}

export async function getAllResumes(): Promise<Resume[]> {
  const rows = await query<ResumeRow[]>("resumes", (supabase) =>
    supabase
      .from("resumes")
      .select("id, file_name, file_url, file_size, version, status, uploaded_at")
      .order("uploaded_at", { ascending: false })
  );
  return rows ? rows.map(mapResume) : [];
}

export { isSupabaseConfigured };

export function isContactConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
}
