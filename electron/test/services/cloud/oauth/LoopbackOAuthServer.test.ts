import {
    startLoopbackOAuthServer,
    type LoopbackOAuthServer,
} from "@electron/services/cloud/oauth/LoopbackOAuthServer";
import { createServer, get, type Server } from "node:http";
import { describe, expect, it } from "vitest";

async function closeServer(server: LoopbackOAuthServer): Promise<void> {
    await server.close();
}

async function closeNodeServer(server: Server): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

async function listenOnLoopback(): Promise<{
    readonly port: number;
    readonly server: Server;
}> {
    const server = createServer((_request, response) => {
        response.statusCode = 204;
        response.end();
    });

    await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address();
    if (!address || typeof address === "string") {
        await closeNodeServer(server);
        throw new Error("Expected loopback test server to expose a port");
    }

    return { port: address.port, server };
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

    it("buffers pre-wait callback errors and rejects without timing out", async () => {
        const server = await startLoopbackOAuthServer({
            port: 0,
            redirectHost: "127.0.0.1",
            redirectPath: "/oauth2/callback",
        });

        try {
            const callbackUrl = new URL(server.redirectUri);
            callbackUrl.searchParams.set("state", "expected-state");
            callbackUrl.searchParams.set("error_description", "denied");

            const response = await requestUrl(callbackUrl.toString());

            expect(response.statusCode).toBe(400);
            await expect(
                server.waitForCallback({
                    expectedState: "expected-state",
                    timeoutMs: 1000,
                })
            ).rejects.toThrow("OAuth callback error: denied");
        } finally {
            await closeServer(server);
        }
    });

    it("sanitizes provider callback error details before rejecting", async () => {
        const server = await startLoopbackOAuthServer({
            port: 0,
            redirectHost: "127.0.0.1",
            redirectPath: "/oauth2/callback",
        });

        try {
            const callbackUrl = new URL(server.redirectUri);
            callbackUrl.searchParams.set("state", "expected-state");
            callbackUrl.searchParams.set("error", "access_denied");
            callbackUrl.searchParams.set(
                "error_description",
                `denied\n${"x".repeat(500)}`
            );

            const response = await requestUrl(callbackUrl.toString());

            expect(response.statusCode).toBe(400);
            await expect(
                server.waitForCallback({
                    expectedState: "expected-state",
                    timeoutMs: 1000,
                })
            ).rejects.toThrow(/^OAuth callback error: denied x{293}\.\.\.$/u);
        } finally {
            await closeServer(server);
        }
    });

    it("rejects pre-wait callbacks with mismatched state without timing out", async () => {
        const server = await startLoopbackOAuthServer({
            port: 0,
            redirectHost: "127.0.0.1",
            redirectPath: "/oauth2/callback",
        });

        try {
            const callbackUrl = new URL(server.redirectUri);
            callbackUrl.searchParams.set("code", "authorization-code");
            callbackUrl.searchParams.set("state", "wrong-state");

            const response = await requestUrl(callbackUrl.toString());

            expect(response.statusCode).toBe(200);
            await expect(
                server.waitForCallback({
                    expectedState: "expected-state",
                    timeoutMs: 1000,
                })
            ).rejects.toThrow("OAuth state mismatch");
        } finally {
            await closeServer(server);
        }
    });

    it("rejects a pending callback wait when the server is closed", async () => {
        const server = await startLoopbackOAuthServer({
            port: 0,
            redirectHost: "127.0.0.1",
            redirectPath: "/oauth2/callback",
        });

        const callbackPromise = server.waitForCallback({
            expectedState: "expected-state",
            timeoutMs: 60_000,
        });

        await closeServer(server);

        await expect(callbackPromise).rejects.toThrow(
            "OAuth loopback server closed"
        );
    });

    it("rejects cleanly and closes partial listeners when a port is already in use", async () => {
        const blocker = await listenOnLoopback();

        let thrown: unknown;
        let unexpectedServer: LoopbackOAuthServer | undefined;
        try {
            unexpectedServer = await startLoopbackOAuthServer({
                port: blocker.port,
                redirectHost: "127.0.0.1",
            });
        } catch (error: unknown) {
            thrown = error;
        } finally {
            if (unexpectedServer) {
                await closeServer(unexpectedServer);
            }
            await closeNodeServer(blocker.server);
        }

        expect(thrown).toBeInstanceOf(Error);
        const message = (thrown as Error).message.toLowerCase();
        expect(
            message.includes("eaddrinuse") ||
                message.includes("address already in use") ||
                message.includes("listen")
        ).toBeTruthy();

        const server = await startLoopbackOAuthServer({
            port: blocker.port,
            redirectHost: "127.0.0.1",
        });

        await closeServer(server);
    });
});
