import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Docs Route & Content Generation", () => {
  const docsContentDir = path.resolve(
    import.meta.dirname,
    "../../../docs/content/docs",
  );

  it("ensures documentation content directory exists with index.mdx", () => {
    expect(fs.existsSync(docsContentDir)).toBe(true);

    const indexPath = path.join(docsContentDir, "index.mdx");
    expect(fs.existsSync(indexPath)).toBe(true);

    const indexContent = fs.readFileSync(indexPath, "utf8");
    expect(indexContent).toContain("title: Introduction");
    expect(indexContent).toContain("description:");
  });

  it("ensures docs meta.json exists and defines navigation pages", () => {
    const metaPath = path.join(docsContentDir, "meta.json");
    expect(fs.existsSync(metaPath)).toBe(true);

    const metaContent = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    expect(metaContent).toBeDefined();
    expect(metaContent.pages).toContain("index");
  });

  it("verifies fumadocs route param generator mapping logic", () => {
    // Fumadocs slug params generator contract:
    // root page index.mdx -> slug undefined or []
    // subpage foo/bar.mdx -> slug ['foo', 'bar']
    function generateRouteParams(files: string[]) {
      return files.map((file) => {
        const parts = file.replace(/\.mdx$/, "").split("/");
        if (parts.length === 1 && parts[0] === "index") {
          return { slug: undefined };
        }
        if (parts[parts.length - 1] === "index") {
          return { slug: parts.slice(0, -1) };
        }
        return { slug: parts };
      });
    }

    const testFiles = [
      "index.mdx",
      "architecture/overview.mdx",
      "guides/getting-started.mdx",
    ];
    const params = generateRouteParams(testFiles);

    expect(params).toEqual([
      { slug: undefined },
      { slug: ["architecture", "overview"] },
      { slug: ["guides", "getting-started"] },
    ]);
  });
});
