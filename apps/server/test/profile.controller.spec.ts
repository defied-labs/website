import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";

const { mockFindUnique, mockUpsert, mockUserUpdate } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpsert: vi.fn(),
  mockUserUpdate: vi.fn(),
}));

vi.mock("@defied/db", () => ({
  default: {
    userProfile: { findUnique: mockFindUnique, upsert: mockUpsert },
    user: { update: mockUserUpdate },
    session: { findUnique: vi.fn() },
  },
}));

import { ProfileController } from "../src/profile.controller";

describe("ProfileController", () => {
  const user = { id: "user_1" };
  let controller: ProfileController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ProfileController();
  });

  it("getProfile returns completed=true when a profile exists", async () => {
    mockFindUnique.mockResolvedValue({ displayName: "Ada" });
    expect(await controller.getProfile(user)).toEqual({
      completed: true,
      profile: { displayName: "Ada" },
    });
    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user_1" } }),
    );
  });

  it("getProfile returns completed=false when no profile exists", async () => {
    mockFindUnique.mockResolvedValue(null);
    expect(await controller.getProfile(user)).toEqual({
      completed: false,
      profile: null,
    });
  });

  it("updateProfile rejects missing required fields", async () => {
    const result = await controller.updateProfile(user, {
      displayName: "  ",
      accountType: "individual",
    });
    expect(result.completed).toBe(false);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("updateProfile trims input, upserts and syncs the user name", async () => {
    mockUpsert.mockResolvedValue({ displayName: "Ada" });
    const result = await controller.updateProfile(user, {
      displayName: "  Ada ",
      accountType: "individual",
      role: "founder",
      location: " Rome ",
    });

    expect(result).toEqual({
      completed: true,
      profile: { displayName: "Ada" },
    });
    const call = mockUpsert.mock.calls[0]?.[0];
    expect(call.create).toMatchObject({
      userId: "user_1",
      displayName: "Ada",
      location: "Rome",
      organization: undefined,
    });
    expect(call.update.displayName).toBe("Ada");
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { name: "Ada" },
    });
  });
});
