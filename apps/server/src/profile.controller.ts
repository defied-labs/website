import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import prisma from "@defied/db";

import { AuthGuard } from "./auth/auth.guard";
import {
  CurrentUser,
  type CurrentUserPayload,
} from "./auth/current-user.decorator";

const profileFields = {
  displayName: true,
  accountType: true,
  role: true,
  organization: true,
  location: true,
  timezone: true,
  projectDescription: true,
  goals: true,
  budget: true,
  timeline: true,
  technicalNeeds: true,
  skillsAndInterests: true,
} as const;

type ProfileInput = Partial<{
  displayName: string;
  accountType: string;
  role: string;
  organization: string;
  location: string;
  timezone: string;
  projectDescription: string;
  goals: string;
  budget: string;
  timeline: string;
  technicalNeeds: string;
  skillsAndInterests: string;
}>;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

@Controller("api/profile")
@UseGuards(AuthGuard)
export class ProfileController {
  @Get()
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: profileFields,
    });

    return {
      completed: Boolean(profile),
      profile,
    };
  }

  @Patch()
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() input: ProfileInput,
  ) {
    const displayName = clean(input.displayName);
    const accountType = clean(input.accountType);
    const role = clean(input.role);

    if (!displayName || !accountType || !role) {
      return {
        completed: false,
        error: "Display name, account type, and role are required.",
      };
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        displayName,
        accountType,
        role,
        organization: clean(input.organization),
        location: clean(input.location),
        timezone: clean(input.timezone),
        projectDescription: clean(input.projectDescription),
        goals: clean(input.goals),
        budget: clean(input.budget),
        timeline: clean(input.timeline),
        technicalNeeds: clean(input.technicalNeeds),
        skillsAndInterests: clean(input.skillsAndInterests),
      },
      update: {
        displayName,
        accountType,
        role,
        organization: clean(input.organization),
        location: clean(input.location),
        timezone: clean(input.timezone),
        projectDescription: clean(input.projectDescription),
        goals: clean(input.goals),
        budget: clean(input.budget),
        timeline: clean(input.timeline),
        technicalNeeds: clean(input.technicalNeeds),
        skillsAndInterests: clean(input.skillsAndInterests),
      },
      select: profileFields,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { name: displayName },
    });

    return { completed: true, profile };
  }
}
