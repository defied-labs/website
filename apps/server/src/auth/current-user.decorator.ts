import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export interface CurrentUserPayload {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  [key: string]: any;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload | undefined;
    if (!user) return null;
    return data ? user[data] : user;
  },
);
