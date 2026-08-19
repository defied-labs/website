import { NextResponse } from "next/server";

/**
 * Parses a Set-Cookie header value to extract cookie attributes.
 * Returns the cookie name, value, and all attributes needed for setting on the response.
 */
export function parseSetCookieHeader(cookie: string): {
  name: string;
  value: string;
  options?: {
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
  };
} | null {
  const semicolonIndex = cookie.indexOf(";");
  let nameValue: string;

  if (semicolonIndex === -1) {
    // No attributes, just name=value
    nameValue = cookie;
  } else {
    nameValue = cookie.substring(0, semicolonIndex);
  }

  const equalIndex = nameValue.indexOf("=");
  if (equalIndex === -1) {
    return null;
  }

  const name = decodeURIComponent(nameValue.substring(0, equalIndex).trim());
  const value = decodeURIComponent(nameValue.substring(equalIndex + 1).trim());

  // Parse remaining attributes
  let options: {
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {};

  if (semicolonIndex !== -1) {
    const attributes = cookie.substring(semicolonIndex + 1).split(";");
    for (const attr of attributes) {
      const trimmed = attr.trim().toLowerCase();

      if (trimmed.startsWith("path=")) {
        options.path = trimmed.substring(5);
      } else if (trimmed.startsWith("domain=")) {
        options.domain = trimmed.substring(7);
      } else if (trimmed === "secure") {
        options.secure = true;
      } else if (trimmed === "httponly") {
        options.httpOnly = true;
      } else if (trimmed.startsWith("samesite=")) {
        const sameSiteValue = trimmed.substring(9);
        if (sameSiteValue === "strict" || sameSiteValue === "lax" || sameSiteValue === "none") {
          options.sameSite = sameSiteValue as "strict" | "lax" | "none";
        }
      } else if (trimmed.startsWith("max-age=")) {
        const maxAgeStr = trimmed.substring(8);
        const maxAgeNum = parseInt(maxAgeStr, 10);
        if (!isNaN(maxAgeNum)) {
          options.maxAge = maxAgeNum;
        }
      } else if (trimmed.startsWith("expires=")) {
        const expiresStr = trimmed.substring(8);
        const expiresDate = new Date(expiresStr);
        if (!isNaN(expiresDate.getTime())) {
          options.expires = expiresDate;
        }
      }
    }
  }

  return { name, value, options };
}

/**
 * Forwards Set-Cookie headers from a backend response to a NextResponse.
 * Preserves all cookie attributes including Secure and SameSite=None.
 */
export function forwardCookies(
  nextResponse: NextResponse,
  setCookieHeaders: string[]
): void {
  for (const cookie of setCookieHeaders) {
    const parsed = parseSetCookieHeader(cookie);
    if (!parsed) continue;

    const { name, value, options } = parsed;

    // Build the options object for NextResponse.cookies.set()
    let cookieOptions: Parameters<typeof nextResponse.cookies.set>[2] | undefined;

    if (options) {
      cookieOptions = {};

      if (options.path !== undefined) cookieOptions.path = options.path;
      if (options.domain !== undefined) cookieOptions.domain = options.domain;
      if (options.maxAge !== undefined) cookieOptions.maxAge = options.maxAge;
      if (options.expires !== undefined) cookieOptions.expires = options.expires;
      if (options.secure !== undefined) cookieOptions.secure = options.secure;
      if (options.httpOnly !== undefined) cookieOptions.httpOnly = options.httpOnly;
      if (options.sameSite !== undefined) cookieOptions.sameSite = options.sameSite;
    }

    nextResponse.cookies.set(name, value, cookieOptions);
  }
}