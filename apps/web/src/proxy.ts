import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/onboarding"];
const guestOnlyRoutes = ["/auth/magic-link"];
const adminRoutes = ["/dashboard/blog"];

// Prefer calling the API directly: fetching our own public URL from inside the
// runtime (Worker or container) loops back through the edge and can fail.
// process.env is read directly so a missing var can't crash the proxy via env
// validation; it falls back to the public URL in that case.
// Any failure is treated as "no data" so the page still renders (protected
// routes then redirect to login) instead of returning a 500.
async function fetchFromApi(path: string, request: NextRequest) {
  const base = process.env.INTERNAL_SERVER_URL || request.url;
  try {
    const response = await fetch(new URL(path, base), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    return response.ok ? await response.json() : null;
  } catch (error) {
    console.error(`[proxy] ${path} request failed:`, error);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await fetchFromApi("/api/auth/session", request);
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
    const profile = await fetchFromApi("/api/profile", request);
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
