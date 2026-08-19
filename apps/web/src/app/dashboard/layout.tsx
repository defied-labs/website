"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      // Redirect to magic-link page if not authenticated
      router.push("/auth/magic-link");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div>
      <h1>Dashboard Layout</h1>
      <p>This is the layout for the dashboard.</p>
      <nav>
        <p>User: {session.user?.email}</p>
      </nav>
      {children}
    </div>
  );
}

export default DashboardLayout;