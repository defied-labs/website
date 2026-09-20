import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import prisma from "@defied/db";

function getCookie(cookieHeader: string | undefined, name: string) {
  return cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookieHeader = request.headers?.cookie as string | undefined;
    const sessionToken =
      getCookie(cookieHeader, "authjs.session-token") ??
      getCookie(cookieHeader, "__Secure-authjs.session-token");

    if (!sessionToken) {
      throw new UnauthorizedException("No session cookie found");
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires <= new Date()) {
      throw new UnauthorizedException("Invalid or expired session");
    }

    request.user = session.user;
    request.session = session;
    return true;
  }
}
