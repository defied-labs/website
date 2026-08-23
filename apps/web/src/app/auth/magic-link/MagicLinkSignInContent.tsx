import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconCheckFilled } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import FaultyTerminal from "@/components/FaultyTerminal";

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
        setError("Too many requests. Please try again later.");
        toast.error("Too many requests. Please try again later.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to send magic link");
      }

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
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive a magic link
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" disabled={loading} className="w-full flex-1">
              {loading ? "Sending..." : "Send magic link"}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
            <IconCheckFilled className="h-4 w-4 mr-2" /> We've emailed you a
            magic link!
          </div>
        )}
      </div>
    </div>
  );
}
