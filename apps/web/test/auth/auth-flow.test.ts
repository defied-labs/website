import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authClient } from "../../src/lib/auth-client";

describe("Auth Client Flow Unit Tests", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("getCsrfToken", () => {
    it("fetches and returns CSRF token from endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: "csrf_token_12345" }),
      } as Response);

      const token = await authClient.getCsrfToken();
      expect(token).toBe("csrf_token_12345");
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/csrf", {
        credentials: "same-origin",
      });
    });

    it("throws error when csrf endpoint fails", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(authClient.getCsrfToken()).rejects.toThrow(
        "Failed to fetch CSRF token",
      );
    });
  });

  describe("getSession", () => {
    it("returns session object when authenticated", async () => {
      const mockSession = {
        user: { id: "user_1", name: "Tester", email: "tester@defied.dev" },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      } as Response);

      const session = await authClient.getSession();
      expect(session).toEqual(mockSession);
    });

    it("returns null when user is not authenticated or request fails", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
      } as Response);

      const session = await authClient.getSession();
      expect(session).toBeNull();
    });
  });

  describe("requestMagicLink", () => {
    it("sends email and csrf token in form-encoded POST request", async () => {
      // Mock csrf token fetch first
      const fetchMock = vi.fn();
      global.fetch = fetchMock;

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: "token_abc" }),
      } as Response);

      fetchMock.mockResolvedValueOnce({
        ok: true,
        statusText: "OK",
      } as Response);

      await authClient.requestMagicLink("founder@defied.dev", "/dashboard");

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/auth/signin/email",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: expect.stringContaining("email=founder%40defied.dev"),
        }),
      );
    });
  });

  describe("signOut", () => {
    it("posts csrf token to signout endpoint", async () => {
      const fetchMock = vi.fn();
      global.fetch = fetchMock;

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: "signout_csrf" }),
      } as Response);

      fetchMock.mockResolvedValueOnce({
        ok: true,
      } as Response);

      await authClient.signOut("/");

      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/auth/signout",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("csrfToken=signout_csrf"),
        }),
      );
    });
  });
});
