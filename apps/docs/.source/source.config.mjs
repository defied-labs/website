// source.config.ts
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { pageSchema } from "fumadocs-core/source/schema";
import { docsFrontmatterSchema } from "@defied/content";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend(docsFrontmatterSchema.shape)
  }
});
var source_config_default = defineConfig();
export {
  source_config_default as default,
  docs
};
