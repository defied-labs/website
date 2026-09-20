import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile"];
const guestOnlyRoutes = ["/auth/magic-link"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionResponse = await fetch(
    new URL("/api/auth/session", request.url),
    { headers: { cookie: request.headers.get("cookie") ?? "" } },
  );

  const session = sessionResponse.ok ? await sessionResponse.json() : null;
  const isAuthenticated = Boolean(session?.user);

  if (guestOnlyRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !isAuthenticated
  ) {
    const loginUrl = new URL("/auth/magic-link", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/auth/magic-link"],
};
