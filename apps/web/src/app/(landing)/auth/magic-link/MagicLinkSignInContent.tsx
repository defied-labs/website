import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconCheckFilled } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import FaultyTerminal from "@/components/FaultyTerminal";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function MagicLinkSignInContent() {
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
      await authClient.signIn.magicLink(email, "/dashboard");

      setSuccess(true);
      toast.success("Magic link sent! Check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 h-screen w-full">
      <div className="bg-secondary shadow-[inset_0_0_30px_0_rgba(0,0,0,0.5)] w-full lg:col-span-1 col-span-3">
        <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
          <h1 className="text-2xl font-bold">Sign In</h1>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg"
                required
              />
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loading || success}
              >
                {loading ? "Sending..." : success ? "Sent!" : "Send Magic Link"}
              </Button>
              {success && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <IconCheckFilled className="size-4" /> We've emailed you a
                  magic link!
                </p>
              )}

              <p className="text-sm text-muted-foreground">
                By signing in, you agree to our{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </form>
        </div>
      </div>
      <div className="col-span-2 w-full lg:flex hidden">
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
