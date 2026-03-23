export const baseUrl = `http://localhost:${process.env.PORT}`;

type HeadersWithSetCookie = Headers & {
    getSetCookie?: () => string[];
};

function getSetCookies(response: Response) {
    const headers = response.headers as HeadersWithSetCookie;

    if (typeof headers.getSetCookie === "function") {
        return headers.getSetCookie();
    }

    const setCookie = headers.get("set-cookie");
    if (!setCookie) {
        return [];
    }

    return setCookie.split(/,(?=\s*[^;,\s]+=)/);
}

export class TestSession {
    private readonly cookies = new Map<string, string>();

    csrfToken = "";

    private storeCookies(response: Response) {
        for (const cookie of getSetCookies(response)) {
            const [cookiePair] = cookie.split(";");

            if (!cookiePair) {
                continue;
            }

            const separatorIndex = cookiePair.indexOf("=");
            if (separatorIndex === -1) {
                continue;
            }

            const name = cookiePair.slice(0, separatorIndex).trim();
            const value = cookiePair.slice(separatorIndex + 1).trim();
            this.cookies.set(name, value);
        }
    }

    private cookieHeader() {
        return [...this.cookies.entries()]
            .map(([name, value]) => `${name}=${value}`)
            .join("; ");
    }

    private mergeHeaders(headers: HeadersInit = {}, includeCsrf = false) {
        const mergedHeaders = new Headers(headers);
        const cookieHeader = this.cookieHeader();

        if (cookieHeader) {
            mergedHeaders.set("Cookie", cookieHeader);
        }

        if (includeCsrf) {
            mergedHeaders.set("x-csrf-token", this.csrfToken);
        }

        return mergedHeaders;
    }

    async initCsrf() {
        const response = await fetch(`${baseUrl}/api/csrf`, {
            headers: this.mergeHeaders(),
        });

        this.storeCookies(response);
        const payload = await response.json() as { csrfToken: string };
        this.csrfToken = payload.csrfToken;

        return response;
    }

    async fetch(input: string, init: RequestInit = {}) {
        const response = await fetch(input, {
            ...init,
            headers: this.mergeHeaders(init.headers),
        });

        this.storeCookies(response);
        return response;
    }

    async csrfFetch(input: string, init: RequestInit = {}) {
        const response = await fetch(input, {
            ...init,
            headers: this.mergeHeaders(init.headers, true),
        });

        this.storeCookies(response);
        return response;
    }
}

export async function createTestSession() {
    const session = new TestSession();
    await session.initCsrf();
    return session;
}

export async function loginAndGetSession(email: string, password: string) {
    const session = await createTestSession();
    const response = await session.csrfFetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    return { session, response };
}
