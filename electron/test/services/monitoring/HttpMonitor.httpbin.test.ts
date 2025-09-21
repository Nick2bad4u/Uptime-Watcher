/**
 * Test suite for HTTP monitoring against httpbin.org endpoints
 *
 * This test investigates why certain URLs are being marked as "down" when they
 * should be "up", particularly focusing on content negotiation and HTTP status
 * code handling.
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-16
 */

import { describe, it, expect, beforeEach } from "vitest";
import { HttpMonitor } from "../../../services/monitoring/HttpMonitor";
import type { Site } from "../../../../shared/types";

describe("HTTP Monitor - httpbin.org Integration Tests", () => {
    let httpMonitor: HttpMonitor;

    // Some runs against httpbin.org can be impacted by upstream/CDN outages.
    // Treat common transient 5xx as acceptable skips to avoid flakiness.
    const transientNetworkErrors = new Set<string>([
        "ECONNRESET",
        "ECONNABORTED",
        "ETIMEDOUT",
        "EAI_AGAIN",
        "ENOTFOUND",
        "ERR_NETWORK",
        "TimeoutError",
        // Cloudflare/edge proxies sometimes surface 522/524
        "522",
        "524",
    ]);

    const isTransientOutage = (code?: string): boolean =>
        code === "502" ||
        code === "503" ||
        code === "504" ||
        code === "Error" || // Network errors/timeouts that result in error details
        (code !== undefined && transientNetworkErrors.has(code));

    const handleTransientOutage = (
        label: string,
        result: {
            status: string;
            details?: string;
        }
    ): boolean => {
        if (isTransientOutage(result.details)) {
            // Document and accept as a transient external failure
            console.warn(
                `[httpbin transient] ${label} skipped due to ${result.details}`
            );
            // Ensure mapping is consistent for server errors
            expect(result.status).toBe("down");
            return true;
        }
        return false;
    };

    /**
     * Retry wrapper for transient errors to reduce flakiness in httpbin-backed
     * integration tests. Retries only when the result indicates a transient
     * outage or known network blip.
     */
    const checkWithTransientRetry = async (
        monitor: Site["monitors"][0],
        label: string,
        attempts = 2,
        backoffMs = 300
    ): Promise<Awaited<ReturnType<typeof httpMonitor.check>>> => {
        let last: Awaited<ReturnType<typeof httpMonitor.check>> | undefined;
        for (let i = 0; i < Math.max(1, attempts); i++) {
            last = await httpMonitor.check(monitor);
            if (!isTransientOutage(last.details)) return last;
            if (i < attempts - 1) {
                await new Promise((r) => setTimeout(r, backoffMs * (i + 1)));
                console.warn(
                    `[httpbin transient] retrying ${label} due to ${last.details} (attempt ${i + 2}/${attempts})`
                );
            }
        }
        // If still transient after retries, return last result
        return last as Awaited<ReturnType<typeof httpMonitor.check>>;
    };

    beforeEach(() => {
        httpMonitor = new HttpMonitor({
            timeout: 10_000,
            userAgent: "UptimeWatcher-Test/1.0",
        });
    });

    /**
     * Test basic GET endpoints that should always return 200
     */
    describe("Basic GET Endpoints", () => {
        const basicEndpoints = [
            {
                url: "https://httpbin.org/get",
                description: "Basic GET request",
            },
            { url: "https://httpbin.org/json", description: "JSON response" },
            { url: "https://httpbin.org/xml", description: "XML response" },
            { url: "https://httpbin.org/html", description: "HTML response" },
            { url: "https://httpbin.org/uuid", description: "UUID generator" },
            {
                url: "https://httpbin.org/user-agent",
                description: "User agent echo",
            },
            { url: "https://httpbin.org/headers", description: "Headers echo" },
        ];

        for (const { url, description } of basicEndpoints) {
            it(`should mark ${description} as UP`, async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: HttpMonitor", "component");
                await annotate("Category: Integration", "category");
                await annotate("Type: HTTP Monitoring", "type");

                const monitor: Site["monitors"][0] = {
                    id: `test-${Date.now()}`,
                    type: "http",
                    url,
                    status: "pending",
                    checkInterval: 60_000,
                    history: [],
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    timeout: 10_000,
                };

                const result = await checkWithTransientRetry(
                    monitor,
                    description,
                    2
                );

                if (handleTransientOutage(description, result)) return;

                expect(result.status).toBe("up");
                expect(result.responseTime).toBeGreaterThan(0);
                expect(result.details).toBe("200");
            }, 30_000);
        }
    });

    /**
     * Test content negotiation endpoints that require specific Accept headers
     */
    describe("Content Negotiation Endpoints", () => {
        it("should handle image endpoint that requires Accept header", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Integration", "category");
            await annotate("Type: Content Negotiation", "type");

            const monitor: Site["monitors"][0] = {
                id: `test-image-${Date.now()}`,
                type: "http",
                url: "https://httpbin.org/image",
                status: "pending",
                checkInterval: 60_000,
                history: [],
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                timeout: 10_000,
            };

            const result = await checkWithTransientRetry(monitor, "/image", 2);

            // This should currently fail with 406 Not Acceptable
            // We'll document the expected vs actual behavior
            console.log(`Image endpoint result:`, result);

            // For now, we expect this to be marked as UP because 406 is not a 5xx error
            // But the endpoint requires proper Accept headers to return 200
            if (handleTransientOutage("/image", result)) return;
            if (result.details === "406") {
                expect(result.status).toBe("up"); // 406 is client error, site is responding
            } else {
                expect(result.status).toBe("up");
                expect(result.details).toBe("200");
            }
        }, 30_000);

        it("should handle image/png endpoint", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Integration", "category");
            await annotate("Type: Content Negotiation", "type");

            const monitor: Site["monitors"][0] = {
                id: `test-png-${Date.now()}`,
                type: "http",
                url: "https://httpbin.org/image/png",
                status: "pending",
                checkInterval: 60_000,
                history: [],
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                timeout: 10_000,
            };

            const result = await checkWithTransientRetry(
                monitor,
                "/image/png",
                2
            );
            console.log(`PNG endpoint result:`, result);

            // PNG endpoint might be more lenient
            if (handleTransientOutage("/image/png", result)) return;
            expect(result.status).toBe("up");
        }, 30_000);
    });

    /**
     * Test different HTTP status codes
     */
    describe("HTTP Status Code Endpoints", () => {
        const statusTests = [
            { code: 200, expected: "up", description: "OK" },
            { code: 201, expected: "up", description: "Created" },
            { code: 202, expected: "up", description: "Accepted" },
            { code: 301, expected: "up", description: "Moved Permanently" },
            { code: 302, expected: "up", description: "Found" },
            { code: 304, expected: "up", description: "Not Modified" },
            { code: 400, expected: "up", description: "Bad Request" },
            { code: 401, expected: "up", description: "Unauthorized" },
            { code: 403, expected: "up", description: "Forbidden" },
            { code: 404, expected: "up", description: "Not Found" },
            { code: 418, expected: "up", description: "I'm a teapot" },
            {
                code: 500,
                expected: "down",
                description: "Internal Server Error",
            },
            { code: 502, expected: "down", description: "Bad Gateway" },
            { code: 503, expected: "down", description: "Service Unavailable" },
        ];

        for (const { code, expected, description } of statusTests) {
            it(`should mark HTTP ${code} (${description}) as ${expected.toUpperCase()}`, async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: HttpMonitor", "component");
                await annotate("Category: Integration", "category");
                await annotate("Type: Status Code Handling", "type");

                const monitor: Site["monitors"][0] = {
                    id: `test-${code}-${Date.now()}`,
                    type: "http",
                    url: `https://httpbin.org/status/${code}`,
                    status: "pending",
                    checkInterval: 60_000,
                    history: [],
                    monitoring: true,
                    responseTime: 0,
                    // Disable retries to keep tests fast and avoid backoff delays
                    retryAttempts: 0,
                    timeout: 10_000,
                };

                const result = await checkWithTransientRetry(
                    monitor,
                    `status/${code}`,
                    2
                );
                console.log(`Status ${code} result:`, result);

                // We consider 3xx as UP. Axios may follow redirects for some endpoints,
                // resulting in a final 200 rather than the original 3xx status.
                if (handleTransientOutage(`status/${code}`, result)) return;
                expect(result.status).toBe(expected);
                const acceptableDetails =
                    code === 301 || code === 302
                        ? [String(code), "200"]
                        : [String(code)];
                expect(acceptableDetails).toContain(result.details);
                expect(result.responseTime).toBeGreaterThan(0);
            }, 30_000);
        }
    });

    /**
     * Test redirect behavior
     */
    describe("Redirect Endpoints", () => {
        it("should handle absolute redirects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Integration", "category");
            await annotate("Type: Redirect Handling", "type");

            const monitor: Site["monitors"][0] = {
                id: `test-redirect-${Date.now()}`,
                type: "http",
                url: "https://httpbin.org/redirect/1", // Redirects to /get
                status: "pending",
                checkInterval: 60_000,
                history: [],
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                timeout: 15_000, // Increased timeout for redirects
            };

            const result = await checkWithTransientRetry(
                monitor,
                "redirect/1",
                3 // More retry attempts for this flaky endpoint
            );
            console.log(`Redirect result:`, result);

            if (handleTransientOutage("redirect/1", result)) return;
            expect(result.status).toBe("up");
            expect(result.details).toBe("200"); // Should follow redirect and get 200
        }, 60_000); // Increased test timeout to 60 seconds
    });

    /**
     * Test delayed responses
     */
    describe("Delay Endpoints", () => {
        it("should handle short delays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Integration", "category");
            await annotate("Type: Delay Handling", "type");

            const monitor: Site["monitors"][0] = {
                id: `test-delay-${Date.now()}`,
                type: "http",
                url: "https://httpbin.org/delay/2", // 2 second delay
                status: "pending",
                checkInterval: 60_000,
                history: [],
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                timeout: 10_000,
            };

            const result = await checkWithTransientRetry(monitor, "delay/2", 2);
            console.log(`Delay result:`, result);

            if (handleTransientOutage("delay/2", result)) return;
            expect(result.status).toBe("up");
            expect(result.details).toBe("200");
            expect(result.responseTime).toBeGreaterThan(2000); // Should be at least 2 seconds
        }, 30_000);
    });

    /**
     * Test various content types to understand Accept header handling
     */
    describe("Content Type Endpoints", () => {
        const contentTypeTests = [
            {
                path: "/json",
                contentType: "application/json",
                description: "JSON content",
            },
            {
                path: "/xml",
                contentType: "application/xml",
                description: "XML content",
            },
            {
                path: "/html",
                contentType: "text/html",
                description: "HTML content",
            },
            {
                path: "/robots.txt",
                contentType: "text/plain",
                description: "Plain text content",
            },
        ];

        for (const { path, description } of contentTypeTests) {
            it(`should handle ${description}`, async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: HttpMonitor", "component");
                await annotate("Category: Integration", "category");
                await annotate("Type: Content Type Handling", "type");

                const monitor: Site["monitors"][0] = {
                    id: `test-content-${Date.now()}`,
                    type: "http",
                    url: `https://httpbin.org${path}`,
                    status: "pending",
                    checkInterval: 60_000,
                    history: [],
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    timeout: 10_000,
                };

                const result = await checkWithTransientRetry(
                    monitor,
                    `content${path}`,
                    2
                );
                console.log(`${description} result:`, result);

                if (handleTransientOutage(`content${path}`, result)) return;
                expect(result.status).toBe("up");
                expect(result.details).toBe("200");
            }, 30_000);
        }
    });
});
