import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthGuard } from "../src/auth/auth.guard";
import { UnauthorizedException, type ExecutionContext } from "@nestjs/common";

const { mockFindUnique } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
}));

vi.mock("@defied/db", () => ({
  default: {
    session: {
      findUnique: mockFindUnique,
    },
  },
}));

describe("AuthGuard Unit Tests", () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard();
    vi.clearAllMocks();
  });

  function createMockExecutionContext(cookieHeader?: string) {
    const request: Record<string, any> = {
      headers: {
        cookie: cookieHeader,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      request,
    };
  }

  it("should throw UnauthorizedException if no cookie header is present", async () => {
    const { switchToHttp } = createMockExecutionContext(undefined);
    const context = { switchToHttp } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException("No session cookie found"),
    );
  });

  it("should throw UnauthorizedException if auth session cookie is missing", async () => {
    const { switchToHttp } = createMockExecutionContext(
      "theme=dark; other=123",
    );
    const context = { switchToHttp } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException("No session cookie found"),
    );
  });

  it("should throw UnauthorizedException if session is not in database", async () => {
    const { switchToHttp } = createMockExecutionContext(
      "authjs.session-token=token_xyz",
    );
    const context = { switchToHttp } as ExecutionContext;

    mockFindUnique.mockResolvedValueOnce(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException("Invalid or expired session"),
    );
  });

  it("should throw UnauthorizedException if session has expired", async () => {
    const { switchToHttp } = createMockExecutionContext(
      "authjs.session-token=token_xyz",
    );
    const context = { switchToHttp } as ExecutionContext;

    mockFindUnique.mockResolvedValueOnce({
      sessionToken: "token_xyz",
      expires: new Date(Date.now() - 1000 * 60), // Expired 1 min ago
      user: { id: "user_1" },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException("Invalid or expired session"),
    );
  });

  it("should attach user and session to request and return true for valid session", async () => {
    const { switchToHttp, request } = createMockExecutionContext(
      "authjs.session-token=token_xyz",
    );
    const context = { switchToHttp } as ExecutionContext;

    const mockUser = { id: "user_1", email: "user@defied.dev", name: "User" };
    const mockSession = {
      sessionToken: "token_xyz",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h future
      user: mockUser,
    };

    mockFindUnique.mockResolvedValueOnce(mockSession);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual(mockUser);
    expect(request.session).toEqual(mockSession);
  });

  it("should support __Secure-authjs.session-token prefix", async () => {
    const { switchToHttp, request } = createMockExecutionContext(
      "__Secure-authjs.session-token=secure_token_abc",
    );
    const context = { switchToHttp } as ExecutionContext;

    const mockUser = { id: "user_sec", email: "secure@defied.dev" };
    mockFindUnique.mockResolvedValueOnce({
      sessionToken: "secure_token_abc",
      expires: new Date(Date.now() + 1000 * 60 * 60),
      user: mockUser,
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(request.user).toEqual(mockUser);
  });
});
