"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, isAuthConfigured } from "@/lib/auth";
import {
  profileSchema,
  experienceSchema,
  skillSchema,
  projectSchema,
  seoSchema,
  multilineList,
  zodErrors,
  type ActionResult,
} from "@/lib/validators";

const PUBLIC_PATHS = ["/", "/about", "/experience", "/skills", "/projects", "/resume"];

function revalidateSite(paths: string[] = PUBLIC_PATHS) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

type Gate =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>> }
  | { ok: false; message: string };

async function adminClient(): Promise<Gate> {
  if (!isAuthConfigured()) {
    return { ok: false, message: "Supabase is not configured. Set the Supabase env vars to persist changes." };
  }
  const admin = await requireAdmin();
  if (!admin) {
    return { ok: false, message: "Not authorized. Sign in with an admin email." };
  }
  const supabase = await createClient();
  return { ok: true, supabase };
}

/** Convert FormData to a plain object; checkbox fields map to real booleans. */
function formValues(formData: FormData, booleans: string[] = []): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      obj[key] = value;
    }
  }
  for (const name of booleans) {
    obj[name] = formData.get(name) === "on";
  }
  return obj;
}

/** Split a textarea into a clean string list (commas or new lines). */
function splitList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((part) => part.trim().replace(/^[-•*]\s+/, ""))
    .filter(Boolean)
    .slice(0, 60);
}

/** Log backend details server-side; return only a generic client message. */
function dbError(error: unknown, message: string): ActionResult {
  console.error(`[admin] ${message}`, error);
  return { ok: false, message };
}

// Profile ---------------------------------------------------------------------
export async function saveProfile(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(formValues(formData, ["openToWork"]));
  if (!parsed.success) {
    return { ok: false, message: "Validation failed. Check the highlighted fields.", fields: zodErrors(parsed.error) };
  }
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const d = parsed.data;

  const payload = {
    name: d.name,
    headline: d.headline,
    hero_description: d.heroDescription,
    about: d.about,
    location: d.location,
    email: d.email,
    phone: d.phone,
    linkedin: d.linkedin,
    github: d.github,
    open_to_work: d.openToWork,
    cta_text: d.ctaText,
    status: d.status,
  };

  const { data: existing } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
  const { error } = existing
    ? await supabase.from("profiles").update(payload).eq("id", (existing as { id: string }).id)
    : await supabase.from("profiles").insert(payload);

  if (error) {
    return dbError(error, "Could not save profile. Please try again.");
  }
  revalidateSite();
  return { ok: true, message: d.status === "published" ? "Profile published." : "Profile saved as draft." };
}

// Experience ------------------------------------------------------------------
export async function saveExperience(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = experienceSchema.safeParse(formValues(formData, ["isCurrent"]));
  if (!parsed.success) {
    return { ok: false, message: "Validation failed. Check the highlighted fields.", fields: zodErrors(parsed.error) };
  }
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const d = parsed.data;

  const payload = {
    company: d.company,
    designation: d.designation,
    start_date: d.startDate,
    end_date: d.endDate || null,
    is_current: d.isCurrent,
    description: d.description,
    responsibilities: multilineList(d.responsibilitiesText, "Responsibility"),
    projects: multilineList(d.projectsText, "Project"),
    technologies: splitList(d.technologiesText),
    display_order: d.displayOrder,
    status: d.status,
  };

  const { error } = d.id
    ? await supabase.from("experiences").update(payload).eq("id", d.id)
    : await supabase.from("experiences").insert(payload);

  if (error) {
    return dbError(error, "Could not save experience. Please try again.");
  }
  revalidateSite(["/", "/about", "/experience", "/resume"]);
  return { ok: true, message: d.status === "published" ? "Experience published." : "Experience saved as draft." };
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { error } = await gate.supabase.from("experiences").delete().eq("id", id);
  if (error) {
    return dbError(error, "Could not delete experience. Please try again.");
  }
  revalidateSite(["/", "/about", "/experience", "/resume"]);
  return { ok: true, message: "Experience deleted." };
}

// Skills ----------------------------------------------------------------------
export async function saveSkill(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = skillSchema.safeParse(formValues(formData, ["isActive"]));
  if (!parsed.success) {
    return { ok: false, message: "Validation failed. Check the highlighted fields.", fields: zodErrors(parsed.error) };
  }
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const d = parsed.data;

  const payload = {
    name: d.name,
    category: d.category,
    proficiency: d.proficiency,
    description: d.description,
    display_order: d.displayOrder,
    is_active: d.isActive,
  };

  const { error } = d.id
    ? await supabase.from("skills").update(payload).eq("id", d.id)
    : await supabase.from("skills").insert(payload);

  if (error) {
    return dbError(error, "Could not save skill. Please try again.");
  }
  revalidateSite(["/", "/skills", "/resume"]);
  return { ok: true, message: "Skill saved." };
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { error } = await gate.supabase.from("skills").delete().eq("id", id);
  if (error) {
    return dbError(error, "Could not delete skill. Please try again.");
  }
  revalidateSite(["/", "/skills", "/resume"]);
  return { ok: true, message: "Skill deleted." };
}

// Projects --------------------------------------------------------------------
export async function saveProject(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = projectSchema.safeParse(formValues(formData, ["isFeatured"]));
  if (!parsed.success) {
    return { ok: false, message: "Validation failed. Check the highlighted fields.", fields: zodErrors(parsed.error) };
  }
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const d = parsed.data;

  const payload = {
    name: d.name,
    category: d.category,
    problem: d.problem,
    approach: d.approach,
    solution: d.solution,
    role: d.role,
    technologies: splitList(d.technologiesText),
    key_features: multilineList(d.keyFeaturesText, "Feature"),
    outcome: d.outcome,
    github_url: d.githubUrl || "",
    live_demo_url: d.liveDemoUrl || "",
    case_study_url: d.caseStudyUrl || "",
    thumbnail: d.thumbnail,
    screenshots: splitList(d.screenshotsText),
    is_featured: d.isFeatured,
    display_order: d.displayOrder,
    status: d.status,
  };

  const { error } = d.id
    ? await supabase.from("projects").update(payload).eq("id", d.id)
    : await supabase.from("projects").insert(payload);

  if (error) {
    return dbError(error, "Could not save project. Please try again.");
  }
  revalidateSite(["/", "/projects", "/resume"]);
  return { ok: true, message: d.status === "published" ? "Project published." : "Project saved as draft." };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { error } = await gate.supabase.from("projects").delete().eq("id", id);
  if (error) {
    return dbError(error, "Could not delete project. Please try again.");
  }
  revalidateSite(["/", "/projects", "/resume"]);
  return { ok: true, message: "Project deleted." };
}

// Publish toggle ---------------------------------------------------------------
const PUBLISHABLE_TABLES = ["experiences", "projects"] as const;
type PublishableTable = (typeof PUBLISHABLE_TABLES)[number];

function isPublishableTable(table: string): table is PublishableTable {
  return (PUBLISHABLE_TABLES as readonly string[]).includes(table);
}

export async function setPublishStatus(
  table: string,
  id: string,
  status: "draft" | "published"
): Promise<ActionResult> {
  if (!isPublishableTable(table)) {
    return { ok: false, message: "Unknown content type." };
  }
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { error } = await gate.supabase.from(table).update({ status }).eq("id", id);
  if (error) {
    return dbError(error, "Could not update status. Please try again.");
  }
  revalidateSite();
  return { ok: true, message: status === "published" ? "Published." : "Moved to draft." };
}

// Resume ----------------------------------------------------------------------
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export async function uploadResume(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { supabase } = gate;

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a PDF file to upload." };
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, message: "Only PDF files are accepted." };
  }
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, message: "Resume must be 5 MB or smaller." };
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `resumes/resume-${stamp}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("portfolio-assets")
    .upload(path, file, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return dbError(uploadError, "Resume upload failed. Please try again.");
  }

  const { data: urlData } = supabase.storage.from("portfolio-assets").getPublicUrl(path);
  const { count } = await supabase.from("resumes").select("id", { count: "exact", head: true });
  const version = `v${(count ?? 0) + 1}.0`;

  const { error: insertError } = await supabase.from("resumes").insert({
    file_name: file.name,
    file_url: urlData.publicUrl,
    file_size: file.size,
    version,
    status: "draft",
  });

  if (insertError) {
    return dbError(insertError, "Upload saved but the record could not be created. Please try again.");
  }
  revalidateSite(["/", "/resume"]);
  return { ok: true, message: `Resume ${version} uploaded as draft. Publish it to go live.` };
}

export async function setResumeStatus(id: string, status: "draft" | "published"): Promise<ActionResult> {
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { error } = await gate.supabase.from("resumes").update({ status }).eq("id", id);
  if (error) {
    return dbError(error, "Could not update resume. Please try again.");
  }
  revalidateSite(["/", "/resume"]);
  return { ok: true, message: status === "published" ? "Resume published." : "Resume unpublished." };
}

export async function deleteResume(id: string): Promise<ActionResult> {
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { error } = await gate.supabase.from("resumes").delete().eq("id", id);
  if (error) {
    return dbError(error, "Could not delete resume. Please try again.");
  }
  revalidateSite(["/", "/resume"]);
  return { ok: true, message: "Resume deleted." };
}

// SEO -------------------------------------------------------------------------
export async function saveSeo(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = seoSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { ok: false, message: "Validation failed. Check the highlighted fields.", fields: zodErrors(parsed.error) };
  }
  const gate = await adminClient();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const d = parsed.data;

  const payload = {
    page_title: d.pageTitle,
    meta_description: d.metaDescription,
    og_image: d.ogImage,
    twitter_card: d.twitterCard,
    structured_data: {},
    status: d.status,
  };

  const { data: existing } = await supabase.from("seo_settings").select("id").limit(1).maybeSingle();
  const { error } = existing
    ? await supabase.from("seo_settings").update(payload).eq("id", (existing as { id: string }).id)
    : await supabase.from("seo_settings").insert(payload);

  if (error) {
    return dbError(error, "Could not save SEO settings. Please try again.");
  }
  revalidateSite();
  return { ok: true, message: d.status === "published" ? "SEO settings published." : "SEO settings saved as draft." };
}
