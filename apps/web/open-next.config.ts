import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig();

type ProxyOverride = NonNullable<
  NonNullable<typeof config.default.override>["proxyExternalRequest"]
>;

const fetchProxyWithoutRedirectFollow: ProxyOverride = async () => ({
  name: "fetch-proxy-manual-redirect",
  proxy: async (event) => {
    const headers: Record<string, string> = Object.fromEntries(
      Object.entries(event.headers).filter(
        ([key]) =>
          !["cf-connecting-ip", "x-forwarded-host"].includes(key.toLowerCase()),
      ),
    );
    if (event.headers.host) {
      headers["x-forwarded-host"] = event.headers.host;
    }

    const response = await fetch(event.url, {
      method: event.method,
      headers,
      body: event.body as BodyInit | undefined,
      redirect: "manual",
    });

    const responseHeaders: Record<string, string | string[]> = {};
    response.headers.forEach((value, key) => {
      const current = responseHeaders[key];
      if (current === undefined) responseHeaders[key] = value;
      else if (Array.isArray(current)) current.push(value);
      else responseHeaders[key] = [current, value];
    });

    return {
      type: "core",
      headers: responseHeaders,
      statusCode: response.status,
      isBase64Encoded: true,
      body: (response.body ??
        new ReadableStream({
          start(controller) {
            controller.close();
          },
        })) as unknown as NodeReadableStream,
    };
  },
});

config.default.override = {
  ...config.default.override,
  proxyExternalRequest: fetchProxyWithoutRedirectFollow,
};
if (config.middleware?.external) {
  config.middleware.override = {
    ...config.middleware.override,
    proxyExternalRequest: fetchProxyWithoutRedirectFollow,
  };
}

export default config;
