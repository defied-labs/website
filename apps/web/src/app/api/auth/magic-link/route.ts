import { env } from "@defied/env/web";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Call Better Auth's magic-link endpoint on the auth server (NOT this route)
    const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/auth/magic-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // Return the response from Better Auth (includes cookies)
    const data = await response.json();

    // Create NextResponse and pass through cookies from the auth server
    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    // Forward any Set-Cookie headers from the auth server to the client
    const setCookieHeaders = response.headers.getSetCookie();
    for (const cookie of setCookieHeaders) {
      nextResponse.cookies.set(cookie);
    }

    return nextResponse;
  } catch (error) {
    console.error("Error requesting magic link:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle any GET requests (shouldn't happen in normal flow, but just in case)
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}