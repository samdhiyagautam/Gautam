import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BUCKET, safeStorageName, storagePathFromUrl } from "../storage.ts";

describe("storagePathFromUrl", () => {
  it("extracts the object path from a public bucket URL", () => {
    const url = `https://hcplxfefoqdkwxjntctm.supabase.co/storage/v1/object/public/${BUCKET}/images/2026-01-01T00-00-00-000Z_photo.png`;
    assert.equal(storagePathFromUrl(url), "images/2026-01-01T00-00-00-000Z_photo.png");
  });

  it("strips query strings", () => {
    const url = `https://example.supabase.co/storage/v1/object/public/${BUCKET}/videos/a.mp4?token=abc`;
    assert.equal(storagePathFromUrl(url), "videos/a.mp4");
  });

  it("decodes percent-encoded paths", () => {
    const url = `https://example.supabase.co/storage/v1/object/public/${BUCKET}/images/my%20chart.png`;
    assert.equal(storagePathFromUrl(url), "images/my chart.png");
  });

  it("returns null for foreign URLs", () => {
    assert.equal(storagePathFromUrl("https://youtu.be/dQw4w9WgXcQ"), null);
    assert.equal(storagePathFromUrl(""), null);
  });

  it("returns null for malformed percent-encoding", () => {
    const url = `https://example.supabase.co/storage/v1/object/public/${BUCKET}/images/%E0%A4%A`;
    assert.equal(storagePathFromUrl(url), null);
  });
});

describe("safeStorageName", () => {
  it("lowercases and collapses unsafe characters", () => {
    assert.equal(safeStorageName("My Report (final).xlsx"), "my_report_final_.xlsx");
  });

  it("keeps dots, dashes and underscores", () => {
    assert.equal(safeStorageName("clean-name_1.png"), "clean-name_1.png");
  });
});
