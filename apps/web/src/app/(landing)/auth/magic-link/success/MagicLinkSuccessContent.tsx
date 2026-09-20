"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MagicLinkSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    if (!token) {
      // No token present; Auth.js handles the callback itself.
      // If we somehow land here without a token, redirect to sign-in.
      setStatus("error");
      router.push("/auth/magic-link?error=missing_token");
      return;
    }

    // With Auth.js, the verification happens in the callback handler
    // (/api/auth/callback/email). This page is only reached after the
    // callback already ran. If we still have a token in the URL, then
    // something went wrong OR the auth callback is redirecting here first.
    //
    // Safest behaviour: check the session to see if we are now signed in.
    // If yes, go to dashboard. Otherwise, let Auth.js finish by navigating
    // to the callback URL with the token so it can complete verification.
    const url = new URL(window.location.href);
    url.pathname = "/api/auth/callback/email";
    // Preserve the token query param for Auth.js to consume.
    window.location.href = url.toString();

    // Fallback in case navigation is blocked (e.g. not a full page load).
    const fallback = setTimeout(() => {
      setStatus("error");
    }, 8000);

    return () => clearTimeout(fallback);
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {status === "error"
            ? "Unable to verify magic link"
            : "Verifying your magic link..."}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {status === "error"
            ? "Please try signing in again."
            : "Please wait while we verify your authentication."}
        </p>
      </div>
    </div>
  );
}
