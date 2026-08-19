import { env } from "@defied/env/server";
import { NextRequest, NextResponse } from "next/server";
import { forwardCookies } from "@/lib/auth-cookies";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 }
      );
    }

    // Call Better Auth's magic-link verify endpoint on the auth server
    const response = await fetch(`${env.BETTER_AUTH_URL}/api/auth/magic-link/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ token }),
      // Required for Node.js when sending a body with fetch
      duplex: "half",
    } as RequestInit & { duplex: string });

    const responseData = await response.json();

    // If verification failed, return the error
    if (!response.ok || responseData.error) {
      const errorMessage = responseData.error || "Verification failed";
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Create a redirect to the client-side success page
    // Note: After verification, we don't need to pass token in URL anymore
    const nextResponse = NextResponse.redirect(
      new URL(`/auth/magic-link/success`, request.url)
    );

    // Forward any Set-Cookie headers from the auth server to the client
    // This preserves all cookie attributes including Secure and SameSite=None
    forwardCookies(nextResponse, response.headers.getSetCookie());

    return nextResponse;
  } catch (error) {
    console.error("Error verifying magic link:", error);
    return NextResponse.json(
      { error: "Failed to verify magic link" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 }
      );
    }

    // Call Better Auth's magic-link verify endpoint on the auth server
    const response = await fetch(`${env.BETTER_AUTH_URL}/api/auth/magic-link/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ token }),
      // Required for Node.js when sending a body with fetch
      duplex: "half",
    } as RequestInit & { duplex: string });

    const responseData = await response.json();

    // If verification failed, return the error
    if (!response.ok || responseData.error) {
      const errorMessage = responseData.error || "Verification failed";
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Create a redirect to the client-side success page
    // Note: After verification, we don't need to pass token in URL anymore
    const nextResponse = NextResponse.redirect(
      new URL(`/auth/magic-link/success`, request.url)
    );

    // Forward any Set-Cookie headers from the auth server to the client
    // This preserves all cookie attributes including Secure and SameSite=None
    forwardCookies(nextResponse, response.headers.getSetCookie());

    return nextResponse;
  } catch (error) {
    console.error("Error verifying magic link:", error);
    return NextResponse.json(
      { error: "Failed to verify magic link" },
      { status: 500 }
    );
  }
}