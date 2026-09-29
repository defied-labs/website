export const authClient = {
  signIn: {
    async magicLink(email: string, callbackURL: string = "/dashboard") {
      return authClient.requestMagicLink(email, callbackURL);
    },
  },
  async getCsrfToken(): Promise<string> {
    const res = await fetch("/api/auth/csrf", {
      credentials: "same-origin",
    });
    if (!res.ok) throw new Error("Failed to fetch CSRF token");
    const data = await res.json();
    return data.csrfToken;
  },

  async getSession() {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "same-origin",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data && Object.keys(data).length > 0 ? data : null;
    } catch {
      return null;
    }
  },
  async signOut(callbackUrl: string = "/") {
    try {
      const csrfToken = await this.getCsrfToken();
      const body = new URLSearchParams({
        csrfToken,
        callbackUrl,
      });

      await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        credentials: "same-origin",
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  },

  async signInWithZitadel(callbackUrl: string = "/dashboard") {
    const csrfToken = await this.getCsrfToken();
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/signin/zitadel";

    for (const [name, value] of Object.entries({ csrfToken, callbackUrl })) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  },

  async requestMagicLink(email: string, callbackUrl: string = "/dashboard") {
    const csrfToken = await this.getCsrfToken();
    const body = new URLSearchParams({
      csrfToken,
      email,
      callbackUrl,
    });

    const res = await fetch("/api/auth/signin/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      credentials: "same-origin",
    });

    if (!res.ok) {
      throw new Error(`Failed to send magic link: ${res.statusText}`);
    }
  },
};
