import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { AdminGuard } from "../src/auth/admin.guard";
import { CurrentUser } from "../src/auth/current-user.decorator";
import { IS_PUBLIC_KEY, Public } from "../src/auth/public.decorator";

function ctx(user?: Record<string, unknown>) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe("AdminGuard", () => {
  const guard = new AdminGuard();

  it("allows site admins", () => {
    expect(guard.canActivate(ctx({ id: "1", role: "site_admin" }))).toBe(true);
  });

  it("rejects non-admins", () => {
    expect(() => guard.canActivate(ctx({ id: "1", role: "user" }))).toThrow(
      ForbiddenException,
    );
  });

  it("rejects anonymous requests", () => {
    expect(() => guard.canActivate(ctx())).toThrow(ForbiddenException);
  });
});

type ParamFactory = (data: unknown, context: ExecutionContext) => unknown;

function currentUserFactory(): ParamFactory {
  class Test {
    handler(@CurrentUser() _user: unknown) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, "handler");
  return (Object.values(args)[0] as { factory: ParamFactory }).factory;
}

describe("CurrentUser decorator", () => {
  const factory = currentUserFactory();

  it("returns the whole user", () => {
    const user = { id: "1", email: "a@b.c" };
    expect(factory(undefined, ctx(user))).toEqual(user);
  });

  it("returns a single field", () => {
    expect(factory("email", ctx({ id: "1", email: "a@b.c" }))).toBe("a@b.c");
  });

  it("returns null without a user", () => {
    expect(factory(undefined, ctx())).toBeNull();
  });
});

describe("Public decorator", () => {
  it("sets the public metadata", () => {
    class Test {
      @Public()
      handler() {}
    }
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, Test.prototype.handler)).toBe(
      true,
    );
  });
});
