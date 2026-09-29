"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { IconArticle, IconLayoutDashboard } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "./sign-out-button";

const userLinks = [
  { href: "/dashboard", label: "Overview", icon: IconLayoutDashboard },
] as const;

const adminLinks = [
  { href: "/dashboard/blog", label: "Blog management", icon: IconArticle },
] as const;

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

type Session = {
  user?: SessionUser | null;
};

function getInitials(user: SessionUser) {
  const value = getUserLabel(user);
  return value
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getUserLabel(user: SessionUser) {
  if (user.name) return user.name;

  const localPart = user.email
    ?.split("@", 1)[0]
    ?.replace(/[._-]+/g, " ")
    .trim();
  return localPart || "User";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    authClient
      .getSession()
      .then((data) => {
        setSession(
          data && Object.keys(data).length > 0 ? (data as Session) : null,
        );
      })
      .catch(() => setProfileError(true));
  }, []);

  const user = session?.user;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-28 pb-16">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-56 shrink-0">
          <div className="md:sticky md:top-28">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-2">
              Dashboard
            </p>
            <nav className="flex md:flex-col gap-1">
              {[...userLinks, ...(user?.role === "site_admin" ? adminLinks : [])].map((link) => {
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

            <div className="mt-6 border-t border-border pt-4">
              {user ? (
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt=""
                        className="size-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-10 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                        {getInitials(user)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {getUserLabel(user)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email || "No email provided"}
                      </p>
                    </div>
                  </div>
                  <span className="mt-3 inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Authenticated
                  </span>
                </div>
              ) : profileError ? (
                <p className="text-xs text-destructive">
                  Unable to load profile.
                </p>
              ) : (
                <div
                  className="h-16 animate-pulse rounded-lg bg-muted"
                  aria-label="Loading profile"
                />
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
