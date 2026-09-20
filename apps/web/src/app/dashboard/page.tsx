import Link from "next/link";
import { getAdminBlogStats } from "@/lib/blog-server";
import { IconArticle, IconArrowRight } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const { total, published, drafts } = await getAdminBlogStats();

  const stats = [
    { label: "Total posts", value: total },
    { label: "Published", value: published },
    { label: "Drafts", value: drafts },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          A quick look at your site.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border p-5 bg-card"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <IconArticle className="size-4 text-primary" />
            <h2 className="font-semibold">Blog Management</h2>
          </div>
          <Link
            href="/dashboard/blog"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Manage posts <IconArrowRight className="size-4" />
          </Link>
        </div>
        <p className="p-5 text-sm text-muted-foreground">
          Create, edit, and publish blog posts. This area is restricted to site
          administrators.
        </p>
      </div>
    </div>
  );
}
