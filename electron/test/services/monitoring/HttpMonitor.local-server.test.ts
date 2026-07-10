/**
 * Socket-level integration tests for HTTP monitoring against a deterministic
 * local server.
 */

import type { Site } from "@shared/types";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { HttpMonitor } from "../../../services/monitoring/HttpMonitor";

const LOCAL_DELAY_MS = 100;

const createHttpMonitor = (
    url: string,
    overrides: Partial<Site["monitors"][0]> = {}
): Site["monitors"][0] => ({
    checkInterval: 60_000,
    history: [],
    id: `test-${randomUUID()}`,
    monitoring: true,
    responseTime: 0,
    retryAttempts: 0,
    status: "pending",
    timeout: 10_000,
    type: "http",
    url,
    ...overrides,
});

describe("HTTP Monitor - local server integration", () => {
    let baseUrl: string;
    let httpMonitor: HttpMonitor;
    let server: Server;

    beforeAll(async () => {
        server = createServer((request, response) => {
            const pathname = new URL(request.url ?? "/", "http://127.0.0.1")
                .pathname;
            const send = (
                statusCode: number,
                body = "",
                contentType = "text/plain"
            ): void => {
                response.writeHead(statusCode, {
                    "Content-Type": contentType,
                });
                response.end(body);
            };

            if (pathname.startsWith("/status/")) {
                const statusCode = Number(pathname.slice("/status/".length));
                send(statusCode);
                return;
            }

            if (pathname === "/redirect/1") {
                response.writeHead(302, { Location: `${baseUrl}/get` });
                response.end();
                return;
            }

            if (pathname === "/delay/short") {
                setTimeout(() => {
                    send(200, "delayed");
                }, LOCAL_DELAY_MS);
                return;
            }

            switch (pathname) {
                case "/get": {
                    send(200, "ok");
                    return;
                }
                case "/headers": {
                    send(
                        200,
                        JSON.stringify({ headers: request.headers }),
                        "application/json"
                    );
                    return;
                }
                case "/html": {
                    send(
                        200,
                        "<!doctype html><title>test</title>",
                        "text/html"
                    );
                    return;
                }
                case "/image": {
                    const accept = request.headers.accept ?? "";
                    if (!accept.includes("*/*") && !accept.includes("image/")) {
                        send(406, "unsupported representation");
                        return;
                    }
                    send(200, "image", "image/webp");
                    return;
                }
                case "/image/png": {
                    send(200, "png", "image/png");
                    return;
                }
                case "/json": {
                    send(200, JSON.stringify({ ok: true }), "application/json");
                    return;
                }
                case "/robots.txt": {
                    send(200, "User-agent: *\nDisallow:");
                    return;
                }
                case "/user-agent": {
                    if (
                        request.headers["user-agent"] !==
                        "UptimeWatcher-Test/1.0"
                    ) {
                        send(400, "unexpected user agent");
                        return;
                    }
                    send(
                        200,
                        JSON.stringify({
                            userAgent: request.headers["user-agent"],
                        }),
                        "application/json"
                    );
                    return;
                }
                case "/uuid": {
                    send(
                        200,
                        JSON.stringify({ uuid: randomUUID() }),
                        "application/json"
                    );
                    return;
                }
                case "/xml": {
                    send(
                        200,
                        '<?xml version="1.0"?><test />',
                        "application/xml"
                    );
                    return;
                }
                default: {
                    send(404, "not found");
                }
            }
        });

        await new Promise<void>((resolve, reject) => {
            const handleListenError = (error: Error): void => {
                reject(error);
            };
            server.once("error", handleListenError);
            server.listen(0, "127.0.0.1", () => {
                server.off("error", handleListenError);
                resolve();
            });
        });

        const address = server.address();
        if (!address || typeof address === "string") {
            throw new Error("Local HTTP test server did not expose a TCP port");
        }
        baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    });

    beforeEach(() => {
        httpMonitor = new HttpMonitor({
            timeout: 10_000,
            userAgent: "UptimeWatcher-Test/1.0",
        });
    });

    describe("Basic GET endpoints", () => {
        const basicEndpoints = [
            { path: "/get", description: "basic GET request" },
            { path: "/json", description: "JSON response" },
            { path: "/xml", description: "XML response" },
            { path: "/html", description: "HTML response" },
            { path: "/uuid", description: "UUID response" },
            { path: "/user-agent", description: "user-agent echo" },
            { path: "/headers", description: "header echo" },
        ];

        for (const { path, description } of basicEndpoints) {
            it(`marks a ${description} as up`, async () => {
                const result = await httpMonitor.check(
                    createHttpMonitor(`${baseUrl}${path}`)
                );

                expect(result).toMatchObject({ details: "200", status: "up" });
                expect(result.responseTime).toBeGreaterThanOrEqual(0);
            });
        }
    });

    describe("Content negotiation endpoints", () => {
        for (const path of ["/image", "/image/png"]) {
            it(`handles ${path}`, async () => {
                const result = await httpMonitor.check(
                    createHttpMonitor(`${baseUrl}${path}`)
                );

                expect(result).toMatchObject({ details: "200", status: "up" });
            });
        }
    });

    describe("HTTP status codes", () => {
        const statusTests = [
            { code: 200, expected: "up" },
            { code: 201, expected: "up" },
            { code: 202, expected: "up" },
            { code: 301, expected: "up" },
            { code: 302, expected: "up" },
            { code: 304, expected: "up" },
            { code: 400, expected: "up" },
            { code: 401, expected: "up" },
            { code: 403, expected: "up" },
            { code: 404, expected: "up" },
            { code: 418, expected: "up" },
            { code: 500, expected: "down" },
            { code: 502, expected: "down" },
            { code: 503, expected: "down" },
        ] as const;

        for (const { code, expected } of statusTests) {
            it(`maps HTTP ${code} to ${expected}`, async () => {
                const result = await httpMonitor.check(
                    createHttpMonitor(`${baseUrl}/status/${code}`)
                );

                expect(result).toMatchObject({
                    details: String(code),
                    status: expected,
                });
            });
        }
    });

    it("follows an absolute-request redirect", async () => {
        const result = await httpMonitor.check(
            createHttpMonitor(`${baseUrl}/redirect/1`)
        );

        expect(result).toMatchObject({ details: "200", status: "up" });
    });

    it("records response latency for a delayed response", async () => {
        const result = await httpMonitor.check(
            createHttpMonitor(`${baseUrl}/delay/short`)
        );

        expect(result).toMatchObject({ details: "200", status: "up" });
        expect(result.responseTime).toBeGreaterThanOrEqual(LOCAL_DELAY_MS - 20);
    });

    describe("Content types", () => {
        for (const path of [
            "/json",
            "/xml",
            "/html",
            "/robots.txt",
        ]) {
            it(`handles ${path}`, async () => {
                const result = await httpMonitor.check(
                    createHttpMonitor(`${baseUrl}${path}`)
                );

                expect(result).toMatchObject({ details: "200", status: "up" });
            });
        }
    });
});
