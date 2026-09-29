import { authClient } from "@/lib/auth-client";
import { IconCheckFilled } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginForm({ searchParams }: { searchParams: any }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [zitadelLoading, setZitadelLoading] = useState(false);
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

  const handleZitadelSignIn = async () => {
    setError("");
    setZitadelLoading(true);

    try {
      const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
      await authClient.signInWithZitadel(callbackUrl);
    } catch (err) {
      setZitadelLoading(false);
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="bg-secondary shadow-[inset_0_0_30px_0_rgba(0,0,0,0.5)] w-full lg:col-span-1 col-span-3">
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <h1 className="text-2xl font-bold">Sign In</h1>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleZitadelSignIn}
            disabled={loading || zitadelLoading}
          >
            {zitadelLoading ? "Redirecting..." : "Continue with Zitadel"}
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>or use email</span>
            <span className="h-px flex-1 bg-border" />
          </div>

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
                <IconCheckFilled className="size-4" /> We've emailed you a magic
                link!
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
  );
}

export default LoginForm;
