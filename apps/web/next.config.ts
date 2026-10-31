import { env } from "@defied/env/web";
import type { NextConfig } from "next";
import nextra from "nextra";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      "next-mdx-import-source-file": "./mdx-components.ts",
    },
  },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const serverUrl = env.INTERNAL_SERVER_URL;
    return [
      {
        source: "/api/auth/:path*",
        destination: `${serverUrl}/api/auth/:path*`,
      },
      {
        source: "/api/admin/blog/:path*",
        destination: `${serverUrl}/api/admin/blog/:path*`,
      },
      {
        source: "/api/profile/:path*",
        destination: `${serverUrl}/api/profile/:path*`,
      },
      {
        source: "/api/blog/:path*",
        destination: `${serverUrl}/api/blog/:path*`,
      },
    ];
  },
};

const withNextra = nextra({});

export default withNextra(nextConfig);
