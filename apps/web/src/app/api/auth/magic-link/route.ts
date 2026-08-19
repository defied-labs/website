import { env } from "@defied/env/web";
import { NextRequest, NextResponse } from "next/server";
import { forwardCookies } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  try {
    console.log("Received request to send magic link email");
    const body = await request.json();

    const backendResponse = await fetch(
      `${env.NEXT_PUBLIC_SERVER_URL}/api/auth/sign-in/magic-link`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify(body),
      } as RequestInit,
    );

    let data;
    try {
      const text = await backendResponse.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: backendResponse.status },
      );
    }

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    const nextResponse = NextResponse.json(data, { status: 200 });

    forwardCookies(nextResponse, backendResponse.headers.getSetCookie());

    return nextResponse;
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}