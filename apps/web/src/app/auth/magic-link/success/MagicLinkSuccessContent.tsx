"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function MagicLinkSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  useEffect(() => {
    const verifyMagicLink = async () => {
      if (!token) {
        console.error("Missing token in URL");
        toast.error("Missing verification token");
        router.push("/auth/magic-link");
        return;
      }

      try {
        const result = await authClient.magicLink.verify({
          query: { token },
        });

        if (!result.error) {
          console.log("Magic link verified successfully:", result.data);
          toast.success("You have been signed in!");

          router.push("/dashboard");
        } else {
          console.error("Invalid or expired token:", result.error);
          toast.error(result.error.message || "Invalid or expired token");
          router.push("/auth/magic-link?error=invalid_token");
        }
      } catch (error) {
        console.error("Error verifying magic link:", error);
        toast.error("An error occurred during verification");
        router.push("/auth/magic-link?error=verification_failed");
      }
    };

    verifyMagicLink();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Verifying your magic link...</h1>
        <p className="mt-4 text-muted-foreground">
          Please wait while we verify your authentication.
        </p>
      </div>
    </div>
  );
}
