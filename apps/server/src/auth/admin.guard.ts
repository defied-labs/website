import {
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";

import type { CurrentUserPayload } from "./current-user.decorator";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload | undefined;

    if (user?.role !== "site_admin") {
      throw new ForbiddenException("Site administrator access required");
    }

    return true;
  }
}