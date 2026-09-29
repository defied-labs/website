import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { pageSchema } from "fumadocs-core/source/schema";
import { docsFrontmatterSchema } from "@defied/content";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend(docsFrontmatterSchema.shape),
  },
});

export default defineConfig();
