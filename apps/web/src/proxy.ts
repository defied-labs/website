import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/onboarding"];
const guestOnlyRoutes = ["/auth/magic-link"];
const adminRoutes = ["/dashboard/blog"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionResponse = await fetch(
    new URL("/api/auth/session", request.url),
    { headers: { cookie: request.headers.get("cookie") ?? "" } },
  );

  const session = sessionResponse.ok ? await sessionResponse.json() : null;
  const isAuthenticated = Boolean(session?.user);
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

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

  if (isAdminRoute && session?.user?.role !== "site_admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    isAuthenticated &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    const profileResponse = await fetch(new URL("/api/profile", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    const profile = profileResponse.ok ? await profileResponse.json() : null;
    const isOnboarding = pathname.startsWith("/onboarding");

    if (profile && !profile.completed && !isOnboarding) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (profile?.completed && isOnboarding) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/auth/magic-link",
  ],
};
