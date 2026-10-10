import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  projectSchema,
  multilineList,
  splitList,
  zodErrors,
} from "../validators.ts";
import { safeNextPath } from "../safe-redirect.ts";
import type { Project } from "../../types/index.ts";

const validDraft = {
  name: "Test Draft Project",
  category: "data-analytics",
  problem: "Sales data is scattered across systems.",
  approach: "Consolidate with Python and SQL.",
  solution: "Nightly ETL into Postgres with Power BI on top.",
  role: "Data Analyst",
  technologiesText: "Python, SQL\nPandas",
  keyFeaturesText: "- Automated daily load\n- Data quality checks",
  outcome: "One place to look at sales trends.",
  githubUrl: "",
  liveDemoUrl: "",
  caseStudyUrl: "",
  thumbnail: "",
  screenshotsText: "",
  datasetUrl: "",
  isFeatured: false,
  displayOrder: 3,
  status: "draft",
};

describe("projectSchema", () => {
  it("rejects an empty project name", () => {
    const result = projectSchema.safeParse({ ...validDraft, name: "" });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok("name" in zodErrors(result.error));
    }
  });

  it("rejects an empty problem statement", () => {
    const result = projectSchema.safeParse({ ...validDraft, problem: "" });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok("problem" in zodErrors(result.error));
    }
  });

  it("rejects whitespace-only required fields", () => {
    const result = projectSchema.safeParse({ ...validDraft, name: "   ", problem: "\n\t " });
    assert.equal(result.success, false);
    if (!result.success) {
      const fields = zodErrors(result.error);
      assert.ok("name" in fields);
      assert.ok("problem" in fields);
    }
  });

  it("accepts a valid draft project", () => {
    const result = projectSchema.safeParse(validDraft);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.status, "draft");
      assert.equal(result.data.isFeatured, false);
    }
  });

  it("accepts a valid published project", () => {
    const result = projectSchema.safeParse({
      ...validDraft,
      status: "published",
      isFeatured: true,
      githubUrl: "https://github.com/example/repo",
    });
    assert.equal(result.success, true);
  });

  it("trims whitespace from text fields", () => {
    const result = projectSchema.safeParse({ ...validDraft, name: "  Padded Name  " });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.name, "Padded Name");
    }
  });

  it("parses display order safely as a non-negative integer", () => {
    const ok = projectSchema.safeParse({ ...validDraft, displayOrder: "7" });
    assert.equal(ok.success, true);
    if (ok.success) assert.equal(ok.data.displayOrder, 7);

    assert.equal(projectSchema.safeParse({ ...validDraft, displayOrder: -2 }).success, false);
    assert.equal(projectSchema.safeParse({ ...validDraft, displayOrder: 2.5 }).success, false);
  });

  it("rejects non-http(s) link values", () => {
    const result = projectSchema.safeParse({ ...validDraft, githubUrl: "javascript:alert(1)" });
    assert.equal(result.success, false);
  });
});

describe("array normalization", () => {
  it("splits newline-separated key features and strips bullets/empties", () => {
    assert.deepEqual(multilineList("- First\n\n* Second\n  \n• Third", "Feature"), [
      "First",
      "Second",
      "Third",
    ]);
  });

  it("splits comma-separated technologies", () => {
    assert.deepEqual(splitList("Python, SQL, Power BI"), ["Python", "SQL", "Power BI"]);
  });

  it("splits newline-separated technologies and drops empties", () => {
    assert.deepEqual(splitList("Python\n\nSQL\n  \nPandas"), ["Python", "SQL", "Pandas"]);
  });

  it("handles mixed commas, newlines, and bullets", () => {
    assert.deepEqual(splitList("- Python, SQL\n* Pandas,, Excel"), [
      "Python",
      "SQL",
      "Pandas",
      "Excel",
    ]);
  });

  it("returns an empty array for blank input", () => {
    assert.deepEqual(splitList("   \n , "), []);
  });
});

describe("project visibility rules (same predicates the site uses)", () => {
  const published: Project = {
    id: "1",
    name: "Live",
    category: "data-analytics",
    problem: "p",
    approach: "",
    solution: "",
    role: "",
    technologies: [],
    keyFeatures: [],
    outcome: "",
    githubUrl: "",
    liveDemoUrl: "",
    caseStudyUrl: "",
    thumbnail: "",
    screenshots: [],
    datasetUrl: "",
    attachments: [],
    videoUrl: "",
    videos: [],
    isFeatured: true,
    status: "published",
    order: 1,
    createdAt: "",
    updatedAt: "",
  };
  const draft: Project = { ...published, id: "2", status: "draft", isFeatured: false };

  it("draft projects are hidden from the public site", () => {
    const visible = [published, draft].filter((p) => p.status === "published");
    assert.deepEqual(
      visible.map((p) => p.id),
      ["1"]
    );
  });

  it("published projects appear publicly, featured first via ordering", () => {
    const visible = [draft, published]
      .filter((p) => p.status === "published")
      .sort((a, b) => a.order - b.order);
    assert.deepEqual(
      visible.map((p) => p.id),
      ["1"]
    );
    assert.equal(visible[0].isFeatured, true);
  });
});

describe("safeNextPath", () => {
  it("allows plain same-origin paths", () => {
    assert.equal(safeNextPath("/admin"), "/admin");
    assert.equal(safeNextPath("/admin/projects/new"), "/admin/projects/new");
  });

  it("rejects protocol-relative, backslash, scheme, and empty values", () => {
    assert.equal(safeNextPath("//evil.com"), "/admin");
    assert.equal(safeNextPath("/\\evil"), "/admin");
    assert.equal(safeNextPath("/foo\\bar"), "/admin");
    assert.equal(safeNextPath("https://evil.com"), "/admin");
    assert.equal(safeNextPath("javascript:alert(1)"), "/admin");
    assert.equal(safeNextPath(""), "/admin");
    assert.equal(safeNextPath(null), "/admin");
    assert.equal(safeNextPath(undefined), "/admin");
  });
});
