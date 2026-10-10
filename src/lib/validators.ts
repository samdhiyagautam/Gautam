import { z } from "zod";

const statusSchema = z.enum(["draft", "published"]);
const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .default("")
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Link must start with http:// or https://");

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  headline: z.string().trim().min(1, "Headline is required.").max(200),
  heroDescription: z.string().trim().min(1, "Hero description is required.").max(1000),
  about: z.string().trim().min(1, "About is required.").max(8000),
  location: z.string().trim().max(120).default(""),
  email: z.string().trim().email("A valid email is required.").max(254),
  phone: z.string().trim().max(40).default(""),
  linkedin: z.string().trim().max(2048).default(""),
  github: z.string().trim().max(2048).default(""),
  openToWork: z.boolean().default(true),
  ctaText: z.string().trim().max(120).default(""),
  status: statusSchema.default("draft"),
});

const stringList = (label: string) =>
  z
    .string()
    .trim()
    .max(400, `${label} entries must be under 400 characters each.`)
    .refine((v) => v.length > 0, `${label} entries cannot be empty.`);

function multilineList(raw: string, label: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim().replace(/^[-•*]\s+/, ""))
    .filter(Boolean)
    .map((line) => stringList(label).parse(line));
}

/** Split free text on commas or new lines into a clean, capped string list. */
function splitList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((part) => part.trim().replace(/^[-•*]\s+/, ""))
    .filter(Boolean)
    .slice(0, 60);
}

export const experienceSchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().trim().min(1, "Company is required.").max(200),
  designation: z.string().trim().min(1, "Designation is required.").max(200),
  startDate: z.string().trim().min(1, "Start date is required.").max(40),
  endDate: z.string().trim().max(40).default(""),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().max(4000).default(""),
  responsibilitiesText: z.string().trim().max(8000).default(""),
  projectsText: z.string().trim().max(8000).default(""),
  technologiesText: z.string().trim().max(2000).default(""),
  displayOrder: z.coerce.number().int().min(0).max(1000).default(0),
  status: statusSchema.default("draft"),
});

export const skillSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Skill name is required.").max(100),
  category: z.enum(["data-analytics", "web-development", "ai-automation", "creative-technology"]),
  proficiency: z.enum(["core", "applied", "working-knowledge", "familiar"]),
  description: z.string().trim().max(500).default(""),
  displayOrder: z.coerce.number().int().min(0).max(1000).default(0),
  isActive: z.boolean().default(true),
});

export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Project name is required.").max(150),
  category: z.enum(["data-analytics", "ai-automation", "web-applications", "creative-technology"]),
  problem: z.string().trim().min(1, "Problem is required.").max(4000),
  approach: z.string().trim().max(4000).default(""),
  solution: z.string().trim().max(4000).default(""),
  role: z.string().trim().max(200).default(""),
  technologiesText: z.string().trim().max(2000).default(""),
  keyFeaturesText: z.string().trim().max(8000).default(""),
  outcome: z.string().trim().max(4000).default(""),
  githubUrl: optionalUrl,
  liveDemoUrl: optionalUrl,
  caseStudyUrl: optionalUrl,
  thumbnail: z.string().trim().max(2048).default(""),
  screenshotsText: z.string().trim().max(4000).default(""),
  datasetUrl: optionalUrl,
  videoUrl: optionalUrl,
  isFeatured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).max(1000).default(0),
  status: statusSchema.default("draft"),
});

export const seoSchema = z.object({
  pageTitle: z.string().trim().min(1, "Page title is required.").max(120),
  metaDescription: z.string().trim().min(1, "Meta description is required.").max(320),
  ogImage: z.string().trim().max(2048).default("/og-image.png"),
  twitterCard: z.enum(["summary", "summary_large_image"]).default("summary_large_image"),
  status: statusSchema.default("draft"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SeoInput = z.infer<typeof seoSchema>;

export { multilineList, splitList };

export function zodErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!(key in fields)) {
      fields[key] = issue.message;
    }
  }
  return fields;
}

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fields?: Record<string, string> };
