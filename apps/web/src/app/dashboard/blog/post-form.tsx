"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PostFormValues } from "@/lib/blog-types";
import { getInitialPostFormValues } from "@/lib/blog-types";
import type { ContentStatus } from "@defied/content";
import { BlockNoteEditor } from "@/components/blog/BlockNoteEditor";
import { Step, Stepper } from "@/components/ui/stepper";

const steps = [
  {
    id: "metadata",
    label: "Metadata",
    description: "Title, slug, excerpt, cover",
  },
  { id: "content", label: "Content", description: "Write your post" },
  { id: "seo", label: "SEO & Taxonomy", description: "Categories, tags, SEO" },
];

export function PostForm({
  mode,
  initial,
  setPreview,
}: {
  mode: "create" | "edit";
  initial?: Partial<PostFormValues> & { id: string };
  setPreview?: React.Dispatch<React.SetStateAction<PostFormValues>>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<PostFormValues>(() =>
    getInitialPostFormValues(initial),
  );
  const [pending, setPending] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  function set<K extends keyof PostFormValues>(
    key: K,
    value: PostFormValues[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setPreview?.(
      (prevState) => ({ ...prevState, [key]: value }) as PostFormValues,
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Only allow submission from the explicit Save button
    const nativeEvent = e.nativeEvent as SubmitEvent;
    const submitter = nativeEvent.submitter as HTMLElement | null;
    if (submitter && !submitter.matches("[data-save-button]")) {
      return;
    }
    e.preventDefault();
    setPending(true);
    try {
      console.log("[handleSubmit] Saving form:", { title: form.title, contentLength: form.content?.length, contentPreview: form.content?.slice(0, 100) });
      const url =
        mode === "create"
          ? "/api/admin/blog"
          : `/api/admin/blog/${initial?.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const responseText = await res.text();
      console.log("[handleSubmit] Response status:", res.status, "body:", responseText);
      const data = JSON.parse(responseText).catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? `Failed to save post: ${res.status} ${responseText}`);
      }
      toast.success(mode === "create" ? "Post created" : "Post saved");
      router.push("/dashboard/blog");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Stepper
        initialStep={1}
        onStepChange={setCurrentStep}
        nextButtonText="Next"
        renderStepIndicator={({
          step,
          currentStep: activeStep,
          onStepClick,
        }) => (
          <button
            type="button"
            onClick={() => onStepClick(step)}
            aria-label={`Go to ${steps[step - 1].label} step`}
            aria-current={step === activeStep ? "step" : undefined}
            className="group flex shrink-0 items-center gap-2"
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                step < activeStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : step === activeStep
                    ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15"
                    : "border-border bg-background text-muted-foreground group-hover:border-foreground"
              }`}
            >
              {step}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium">
                {steps[step - 1].label}
              </span>
              <span className="block text-xs text-muted-foreground">
                {steps[step - 1].description}
              </span>
            </span>
          </button>
        )}
      >
        <Step>
          <div className="space-y-5" data-step="metadata">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Post title"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="my-post-slug"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input
                id="excerpt"
                value={form.excerpt as string}
                onChange={(e) => set("excerpt", e.target.value)}
                placeholder="Short summary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coverImage">Cover image URL</Label>
              <Input
                id="coverImage"
                value={form.coverImage as string}
                onChange={(e) => set("coverImage", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Workflow status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(event) =>
                  set("status", event.target.value as ContentStatus)
                }
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="review">In review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </Step>

        <Step>
          <div className="space-y-5" data-step="content">
            <div className="space-y-1.5">
              <Label htmlFor="content">Content</Label>
              <BlockNoteEditor
                value={form.content}
                onChange={(content) => set("content", content)}
              />
            </div>
          </div>
        </Step>

        <Step>
          <div className="space-y-5" data-step="seo">
            <div>
              <h3 className="text-sm font-semibold mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "tech",
                  "design",
                  "business",
                  "product",
                  "marketing",
                  "engineering",
                ].map((cat) => (
                  <label
                    key={cat}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm cursor-pointer transition-colors ${
                      form.taxonomy.categories.includes(cat)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.taxonomy.categories.includes(cat)}
                      onChange={(e) =>
                        set("taxonomy", {
                          ...form.taxonomy,
                          categories: e.target.checked
                            ? [...form.taxonomy.categories, cat]
                            : form.taxonomy.categories.filter((c) => c !== cat),
                        })
                      }
                      className="sr-only"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Tags</h3>
              <Input
                value={form.taxonomy.tags.join(", ")}
                onChange={(e) =>
                  set("taxonomy", {
                    ...form.taxonomy,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="tag1, tag2, tag3"
                className="max-w-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated
              </p>
            </div>

            <div className="my-4 border-t" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">SEO Settings</h3>
              <div className="space-y-1.5">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={form.seo.title ?? ""}
                  onChange={(e) =>
                    set("seo", { ...form.seo, title: e.target.value })
                  }
                  placeholder="Custom SEO title (optional)"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Input
                  id="seoDescription"
                  value={form.seo.description ?? ""}
                  onChange={(e) =>
                    set("seo", { ...form.seo, description: e.target.value })
                  }
                  placeholder="Meta description (optional)"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seoImage">SEO Image URL</Label>
                <Input
                  id="seoImage"
                  value={form.seo.image ?? ""}
                  onChange={(e) =>
                    set("seo", { ...form.seo, image: e.target.value })
                  }
                  placeholder="https://... (optional)"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="noIndex"
                  checked={form.seo.noIndex ?? false}
                  onChange={(e) =>
                    set("seo", { ...form.seo, noIndex: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label
                  htmlFor="noIndex"
                  className="text-sm font-normal cursor-pointer"
                >
                  No index (prevent search engines from indexing)
                </Label>
              </div>
            </div>
          </div>
        </Step>
      </Stepper>

      <div className="flex items-center justify-end border-t pt-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/blog")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending} data-save-button>
            {pending
              ? "Saving…"
              : mode === "create"
                ? "Create post"
                : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
