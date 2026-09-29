import { z } from "zod";

export const contentStatusSchema = z.enum([
  "draft",
  "review",
  "published",
  "archived",
]);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const seoMetadataSchema = z.object({
  title: z.string().trim().max(70).optional().nullable(),
  description: z.string().trim().max(160).optional().nullable(),
  image: z.string().url().optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  noIndex: z.boolean().default(false),
});
export type SeoMetadata = z.infer<typeof seoMetadataSchema>;

export const authorMetadataSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  bio: z.string().trim().max(500).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  url: z.string().url().optional().nullable(),
});
export type AuthorMetadata = z.infer<typeof authorMetadataSchema>;

export const taxonomySchema = z.object({
  categories: z.array(z.string().trim().min(1).max(80)).default([]),
  tags: z.array(z.string().trim().min(1).max(80)).default([]),
});
export type Taxonomy = z.infer<typeof taxonomySchema>;

const contentBaseSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().trim().max(500).optional().nullable(),
  status: contentStatusSchema.default("draft"),
  seo: seoMetadataSchema.default({ noIndex: false }),
  taxonomy: taxonomySchema.default({ categories: [], tags: [] }),
});

export const blogPostSchema = contentBaseSchema.extend({
  kind: z.literal("blog-post"),
  content: z.string().trim().min(1),
  coverImage: z.string().url().optional().nullable(),
  authorId: z.string().trim().min(1).optional().nullable(),
  publishedAt: z.coerce.date().optional().nullable(),
});
export type BlogPostContent = z.infer<typeof blogPostSchema>;

export const docsPageSchema = contentBaseSchema.extend({
  kind: z.literal("docs-page"),
  content: z.string().trim().min(1),
  order: z.number().int().nonnegative().optional(),
});
export type DocsPageContent = z.infer<typeof docsPageSchema>;

export const docsFrontmatterSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  status: contentStatusSchema.default("published"),
  seo: seoMetadataSchema.default({ noIndex: false }),
  categories: z.array(z.string().trim().min(1).max(80)).default([]),
  tags: z.array(z.string().trim().min(1).max(80)).default([]),
});

export const landingBlockSchema = z.object({
  id: z.string().trim().min(1),
  type: z.enum(["hero", "feature", "cta", "testimonial", "rich-text"]),
  heading: z.string().trim().max(200).optional(),
  body: z.string().trim().max(5000).optional(),
  image: z.string().url().optional().nullable(),
  cta: z
    .object({ label: z.string().trim().min(1).max(80), href: z.string().url() })
    .optional(),
});
export const landingPageSchema = contentBaseSchema.extend({
  kind: z.literal("landing-page"),
  blocks: z.array(landingBlockSchema).min(1),
});
export type LandingPageContent = z.infer<typeof landingPageSchema>;

export const contentInputSchema = z.discriminatedUnion("kind", [
  blogPostSchema,
  docsPageSchema,
  landingPageSchema,
]);
export type ContentInput = z.infer<typeof contentInputSchema>;

export function parseContent<T extends z.ZodType>(
  schema: T,
  input: unknown,
): z.infer<T> {
  return schema.parse(input);
}

export function isPublished(status: ContentStatus) {
  return status === "published";
}
