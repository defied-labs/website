// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

const fetchMock = vi.fn();

function request(path: string) {
  return new NextRequest(`https://defied.dev${path}`, {
    headers: { cookie: "session=abc" },
  });
}

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe("proxy", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("INTERNAL_SERVER_URL", "http://server:3005");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("queries the API over the internal URL, forwarding cookies", async () => {
    fetchMock.mockResolvedValue(json({}));
    await proxy(request("/auth/magic-link"));

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe("http://server:3005/api/auth/session");
    expect(init.headers.cookie).toBe("session=abc");
  });

  it("falls back to the public URL when INTERNAL_SERVER_URL is unset", async () => {
    vi.stubEnv("INTERNAL_SERVER_URL", "");
    fetchMock.mockResolvedValue(json({}));
    await proxy(request("/auth/magic-link"));

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://defied.dev/api/auth/session",
    );
  });

  it("renders the login page when the API is unreachable", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const response = await proxy(request("/auth/magic-link"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects protected routes to login when the API is unreachable", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const response = await proxy(request("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://defied.dev/auth/magic-link?callbackUrl=%2Fdashboard",
    );
  });

  it("redirects signed-in users away from the login page", async () => {
    fetchMock.mockResolvedValue(json({ user: { id: "1" } }));
    const response = await proxy(request("/auth/magic-link"));

    expect(response.headers.get("location")).toBe("https://defied.dev/dashboard");
  });

  it("sends users with an incomplete profile to onboarding", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ user: { id: "1" } }))
      .mockResolvedValueOnce(json({ completed: false }));
    const response = await proxy(request("/dashboard"));

    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://server:3005/api/profile",
    );
    expect(response.headers.get("location")).toBe(
      "https://defied.dev/onboarding",
    );
  });
});
