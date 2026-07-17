"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconCheckFilled } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import FaultyTerminal from "@/components/FaultyTerminal";

export default function MagicLinkSignIn() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        missing_token: "Missing token in URL",
        invalid_token: "Invalid or expired token",
        verification_failed: "Token verification failed",
      };
      setError(errorMessages[errorParam] || "An error occurred");
      toast.error(errorMessages[errorParam] || "An error occurred");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 429) {
        // Handle rate limiting - show user-friendly message
        toast.warning("Too many requests. Please wait a moment and try again.");
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setSuccess(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[92dvh] grid grid-cols-3 items-center justify-center bg-background w-full border-b relative">
      <div className="lg:w-1/3 px-10 bg-background/90 h-full flex flex-col justify-center absolute top-0 left-0 col-span-1 z-10">
        <div className="mx-auto flex space-y-6 flex-col">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-primary">
              Sign in with Magic Link
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we'll send you a secure sign-in link
            </p>
          </div>

          <div className="w-full max-w-md">
            {success ? (
              <div className="text-center">
                <div className="text-green-500 mb-4">
                  <IconCheckFilled className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Check your email!
                </h3>
                <p className="text-muted-foreground mb-6">
                  We've sent a magic link to{" "}
                  <span className="font-medium">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  The link will expire in 15 minutes. If you don't see it, check
                  your spam folder.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-muted-foreground mb-2"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-primary rounded-md shadow-sm placeholder-primary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>
              </form>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              {/* Add Google, GitHub, etc. buttons */}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-full col-span-3">
        <FaultyTerminal
          scale={2.2}
          gridMul={[2, 1]}
          digitSize={1.4}
          timeScale={0.2}
          pause={false}
          scanlineIntensity={0.5}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0}
          tint="#1db6a5"
          mouseReact
          mouseStrength={0.2}
          pageLoadAnimation
          brightness={0.8}
        />
      </div>
    </div>
  );
}
