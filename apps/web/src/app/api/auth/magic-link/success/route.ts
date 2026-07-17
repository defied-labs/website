import { env } from "@defied/env/web";
import { NextRequest, NextResponse } from "next/server";

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
    const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/auth/magic-link/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ token }),
    });

    // Create NextResponse and pass through cookies from the auth server
    const nextResponse = NextResponse.json(
      await response.json(),
      { status: response.status }
    );

    // Forward any Set-Cookie headers from the auth server to the client
    const setCookieHeaders = response.headers.getSetCookie();
    for (const cookie of setCookieHeaders) {
      nextResponse.cookies.set(cookie);
    }

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
    const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/auth/magic-link/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ token }),
    });

    // Create NextResponse and pass through cookies from the auth server
    const nextResponse = NextResponse.json(
      await response.json(),
      { status: response.status }
    );

    // Forward any Set-Cookie headers from the auth server to the client
    const setCookieHeaders = response.headers.getSetCookie();
    for (const cookie of setCookieHeaders) {
      nextResponse.cookies.set(cookie);
    }

    return nextResponse;
  } catch (error) {
    console.error("Error verifying magic link:", error);
    return NextResponse.json(
      { error: "Failed to verify magic link" },
      { status: 500 }
    );
  }
}