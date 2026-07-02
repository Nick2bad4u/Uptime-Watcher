import {
    startLoopbackOAuthServer,
    type LoopbackOAuthServer,
} from "@electron/services/cloud/oauth/LoopbackOAuthServer";
import { get } from "node:http";
import { describe, expect, it } from "vitest";

async function closeServer(server: LoopbackOAuthServer): Promise<void> {
    await server.close();
}

async function requestUrl(
    url: string
): Promise<{ readonly body: string; readonly statusCode: number | undefined }> {
    return new Promise((resolve, reject) => {
        const request = get(url, (response) => {
            let body = "";

            response.setEncoding("utf8");
            response.on("data", (chunk: string) => {
                body += chunk;
            });
            response.on("end", () => {
                resolve({ body, statusCode: response.statusCode });
            });
        });

        request.on("error", reject);
        request.setTimeout(1000, () => {
            request.destroy(new Error("OAuth loopback test request timed out"));
        });
    });
}

describe(startLoopbackOAuthServer, () => {
    it("returns an HTTP redirect URI for the HTTP loopback listener", async () => {
        const server = await startLoopbackOAuthServer({
            port: 0,
            redirectHost: "127.0.0.1",
            redirectPath: "",
        });

        try {
            expect(server.redirectUri).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/u);
        } finally {
            await closeServer(server);
        }
    });

    it("uses the generated HTTP redirect URI for callbacks", async () => {
        const server = await startLoopbackOAuthServer({
            port: 0,
            redirectHost: "127.0.0.1",
            redirectPath: "/oauth2/callback",
        });

        try {
            const callbackPromise = server.waitForCallback({
                expectedState: "expected-state",
                timeoutMs: 1000,
            });

            const callbackUrl = new URL(server.redirectUri);
            callbackUrl.searchParams.set("code", "authorization-code");
            callbackUrl.searchParams.set("state", "expected-state");

            const response = await requestUrl(callbackUrl.toString());
            const callback = await callbackPromise;

            expect(response.statusCode).toBe(200);
            expect(response.body).toContain("Connected");
            expect(callback).toEqual({
                code: "authorization-code",
                state: "expected-state",
            });
        } finally {
            await closeServer(server);
        }
    });
});
