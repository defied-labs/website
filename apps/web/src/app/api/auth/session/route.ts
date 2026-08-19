import { env } from "@defied/env/server";
import { NextRequest, NextResponse } from "next/server";
import { forwardCookies } from "@/lib/auth-cookies";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${env.BETTER_AUTH_URL}/api/auth/get-session`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Failed to get session" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Create NextResponse and forward cookies from the auth server
    const nextResponse = NextResponse.json(data);

    // Forward any Set-Cookie headers from the auth server to the client
    // This preserves all cookie attributes including Secure and SameSite=None
    forwardCookies(nextResponse, response.headers.getSetCookie());

    return nextResponse;
  } catch (error) {
    console.error("Error getting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}