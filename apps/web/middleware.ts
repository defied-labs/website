import { env } from "@defied/env/web";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Better Auth uses better-auth_session_token (with underscore) as the default cookie name
  const sessionCookie = req.cookies.get("better-auth_session_token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/magic-link", req.url));
  }

  try {
    // Verify the session with Better Auth server
    const authResponse = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/auth/get-session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `better-auth_session_token=${sessionCookie.value}`,
      },
    });

    if (!authResponse.ok) {
      return NextResponse.redirect(new URL("/auth/magic-link", req.url));
    }

    const session = await authResponse.json();

    if (!session) {
      return NextResponse.redirect(new URL("/auth/magic-link", req.url));
    }

    // Allow the request to proceed if the user is authenticated
    return NextResponse.next();
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.redirect(new URL("/auth/magic-link", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};