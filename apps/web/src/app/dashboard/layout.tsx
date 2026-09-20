"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { IconArticle, IconLayoutDashboard } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "./sign-out-button";

const links = [
  { href: "/dashboard", label: "Overview", icon: IconLayoutDashboard },
  { href: "/dashboard/blog", label: "Blog", icon: IconArticle },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    authClient.getSession().then((data) => {
      setSession(data && Object.keys(data).length > 0 ? data : null);
    });
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-28 pb-16">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-56 shrink-0">
          <div className="md:sticky md:top-28">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-2">
              Dashboard
            </p>
            <nav className="flex md:flex-col gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
              <SignOutButton />
            </nav>

            <div className="mt-6 px-2 text-xs text-muted-foreground border-t border-border pt-4">
              {session ? (
                <>
                  <p className="truncate">{session.user?.name}</p>
                  <p className="truncate">{session.user?.email}</p>
                  <span className="inline-block mt-2 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    Admin
                  </span>
                </>
              ) : (
                <p className="truncate text-muted-foreground">
                  Loading user profile...
                </p>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
