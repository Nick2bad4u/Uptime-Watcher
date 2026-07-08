import { createMockConstructor } from "@shared/test/helpers/vitestConstructors";
// Import the mocked modules to get access to the mock functions
import * as dns from "node:dns/promises";
import * as net from "node:net";
import { performance } from "node:perf_hooks";
/**
 * Unit tests for native connectivity checking with degraded state support.
 *
 * @remarks
 * Tests the enhanced connectivity checking functionality that supports:
 *
 * - "up" status for successful checks
 * - "degraded" status for partial success (DNS resolves but ports unreachable,
 *   HTTP 4xx responses)
 * - "down" status for complete failures
 * - DNS timeout handling with Promise.race
 * - HTTP status code categorization
 *
 * @file Comprehensive tests for native connectivity utilities
 *
 * @author AI Generated
 *
 * @since 2024
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { USER_AGENT } from "../../../constants";
import type { ConnectivityOptions } from "../../../services/monitoring/utils/nativeConnectivity";

import {
    checkConnectivity,
    checkHttpConnectivity,
} from "../../../services/monitoring/utils/nativeConnectivity";

// Mock Node.js modules with inline functions to avoid hoisting issues
vi.mock("node:dns/promises", () => ({
    __esModule: true,
    resolve4: vi.fn(),
}));
vi.mock("node:net", () => {
    const Socket = createMockConstructor(() => ({
        setTimeout: vi.fn(),
        on: vi.fn(),
        connect: vi.fn(),
        destroy: vi.fn(),
        removeAllListeners: vi.fn(),
    }));

    return { __esModule: true, Socket };
});
vi.mock("node:perf_hooks", () => ({
    performance: {
        now: vi.fn().mockReturnValue(100),
    },
}));
// Mock objects must be declared after vi import and imports of actual modules
const mockDnsResolve4 = vi.mocked(dns.resolve4);
const mockSocketClass = vi.mocked(net.Socket);
const mockFetch = vi.fn();
// Create mock objects that match the usage in tests
const mockDns = {
    resolve4: mockDnsResolve4,
};
const mockNet = {
    Socket: mockSocketClass,
};
// Mock fetch globally
globalThis.fetch = mockFetch;
describe("Native Connectivity with Degraded State", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(mockDnsResolve4).mockClear();
        vi.mocked(mockFetch).mockClear();
        // Reset performance.now to return predictable values
        let mockTime = 100;
        vi.mocked(performance.now).mockImplementation(() => {
            mockTime += 50; // Each call advances by 50ms
            return mockTime - 50;
        });
    });
    describe(checkHttpConnectivity, () => {
        it("should return 'up' status for successful HTTP responses (200-299)", async () => {
            // Arrange
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: "OK",
            });
            // Act
            const result = await checkHttpConnectivity("https://example.com");
            // Assert
            expect(result.status).toBe("up");
            expect(result.details).toBe("HTTP 200 - OK");
            expect(result.responseTime).toBe(50);
            expect(result.error).toBeUndefined();
            expect(mockFetch).toHaveBeenCalledWith(
                "https://example.com",
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "User-Agent": USER_AGENT,
                    }),
                    method: "HEAD",
                })
            );
        });
        it("should return 'degraded' status for client errors (400-499)", async () => {
            // Arrange
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: "Not Found",
            });
            // Act
            const result = await checkHttpConnectivity(
                "https://example.com/nonexistent"
            );
            // Assert
            expect(result.status).toBe("degraded");
            expect(result.details).toBe("HTTP 404 - Not Found");
            expect(result.responseTime).toBe(50);
            expect(result.error).toBeUndefined();
        });
        it("should return 'down' status for server errors (500+)", async () => {
            // Arrange
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: "Internal Server Error",
            });
            // Act
            const result = await checkHttpConnectivity("https://example.com");
            // Assert
            expect(result.status).toBe("down");
            expect(result.details).toBe("HTTP 500 - Internal Server Error");
            expect(result.error).toBe("Server error: 500");
            expect(result.responseTime).toBe(50);
        });
        it("should return 'down' status for network errors", async () => {
            // Arrange
            mockFetch.mockRejectedValue(new Error("Network error"));
            // Act
            const result = await checkHttpConnectivity(
                "https://unreachable.example.com"
            );
            // Assert
            expect(result.status).toBe("down");
            expect(result.details).toBe("HTTP request failed");
            expect(result.error).toBe("Network error");
            expect(result.responseTime).toBe(50);
        });
        it("should handle timeout properly", async () => {
            // Arrange
            const timeoutError = new Error("Request timeout");
            timeoutError.name = "AbortError";
            mockFetch.mockRejectedValue(timeoutError);
            // Act
            const result = await checkHttpConnectivity(
                "https://slow.example.com",
                1000
            );
            // Assert
            expect(result.status).toBe("down");
            expect(result.details).toBe("HTTP request failed");
            expect(result.error).toBe("Request timeout");
        });
        it("should propagate caller aborts before starting HTTP requests", async () => {
            // Arrange
            const controller = new AbortController();
            controller.abort("stop");

            // Act / Assert
            await expect(
                checkHttpConnectivity(
                    "https://example.com",
                    1000,
                    controller.signal
                )
            ).rejects.toMatchObject({
                name: "AbortError",
            });
            expect(mockFetch).not.toHaveBeenCalled();
        });
        it("should propagate caller aborts during HTTP requests", async () => {
            // Arrange
            const controller = new AbortController();
            mockFetch.mockImplementation(() => {
                controller.abort("stop");
                return Promise.reject(new Error("fetch aborted"));
            });

            // Act / Assert
            await expect(
                checkHttpConnectivity(
                    "https://example.com",
                    1000,
                    controller.signal
                )
            ).rejects.toMatchObject({
                name: "AbortError",
            });
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });
    describe("checkConnectivity with DNS resolution", () => {
        it("should return 'degraded' status when DNS resolves but TCP fails", async () => {
            // Arrange
            mockDns.resolve4.mockResolvedValue(["192.168.1.1"]);
            // Mock TCP connection failure
            const mockSocket = {
                setTimeout: vi.fn(),
                on: vi.fn((event, callback) => {
                    if (event === "error") {
                        // Simulate connection failure
                        setTimeout(() => callback(), 10);
                    }
                }),
                connect: vi.fn(),
                destroy: vi.fn(),
                removeAllListeners: vi.fn(),
            };

            mockNet.Socket.mockImplementation(function MockSocketInstance() {
                return mockSocket as unknown as net.Socket;
            });
            // Act
            const result = await checkConnectivity("example.com", {
                method: "tcp",
            });
            // Assert
            expect(result.status).toBe("degraded");
            expect(result.details).toBe(
                "DNS resolution successful, but no open ports found"
            );
            expect(mockDns.resolve4).toHaveBeenCalledWith("example.com");
        });
        it("should return 'down' status when DNS fails", async () => {
            // Arrange
            mockDns.resolve4.mockRejectedValue(
                new Error("DNS resolution failed")
            );
            // Mock TCP connection failure
            const mockSocket = {
                setTimeout: vi.fn(),
                on: vi.fn((event, callback) => {
                    if (event === "error") {
                        setTimeout(() => callback(), 10);
                    }
                }),
                connect: vi.fn(),
                destroy: vi.fn(),
                removeAllListeners: vi.fn(),
            };

            mockNet.Socket.mockImplementation(function MockSocketInstance() {
                return mockSocket as unknown as net.Socket;
            });
            // Act
            const result = await checkConnectivity("nonexistent.example.com", {
                method: "tcp",
            });
            // Assert
            expect(result.status).toBe("down");
            expect(result.details).toBe(
                "Failed to connect to nonexistent.example.com"
            );
        });
        it("should normalize URL-shaped targets before DNS fallback", async () => {
            // Arrange
            mockDns.resolve4.mockResolvedValue(["203.0.113.10"]);

            // Act
            const result = await checkConnectivity(
                "https://example.com/path with spaces?token=secret",
                {
                    method: "dns",
                }
            );

            // Assert
            expect(result.status).toBe("degraded");
            expect(mockDns.resolve4).toHaveBeenCalledWith("example.com");
        });
        it("should avoid echoing URL paths or queries in failed DNS details", async () => {
            // Arrange
            mockDns.resolve4.mockRejectedValue(
                new Error("DNS resolution failed")
            );

            // Act
            const result = await checkConnectivity(
                "https://example.com/path with spaces?token=secret",
                {
                    method: "dns",
                }
            );

            // Assert
            expect(result.status).toBe("down");
            expect(result.details).toBe("Failed to connect to example.com");
        });
        it("should handle DNS timeout with Promise.race", async () => {
            // Arrange
            mockDns.resolve4.mockReturnValue(
                new Promise((resolve) =>
                    setTimeout(() => {
                        resolve(["192.168.1.1"]);
                    }, 2000)
                )
            );
            // Act
            const result = await checkConnectivity("slow-dns.example.com", {
                method: "dns",
                timeout: 100,
            });
            // Assert
            expect(result.status).toBe("down");
            expect(result.details).toBe(
                "Failed to connect to slow-dns.example.com"
            );
        });
        it("should propagate abort while DNS resolution is pending", async () => {
            // Arrange
            const controller = new AbortController();
            mockDns.resolve4.mockReturnValue(new Promise(() => undefined));

            // Act
            const resultPromise = checkConnectivity(
                "abort.example.com",
                {
                    method: "dns",
                    timeout: 5000,
                },
                controller.signal
            );
            controller.abort("stop");

            // Assert
            await expect(resultPromise).rejects.toMatchObject({
                name: "AbortError",
            });
        });
        it("should not invoke option accessors while normalizing connectivity checks", async () => {
            // Arrange
            mockDns.resolve4.mockResolvedValue(["192.168.1.1"]);
            let getterCalls = 0;
            const options = {
                method: "dns" as const,
            } as Record<string, unknown>;

            Object.defineProperty(options, "timeout", {
                enumerable: true,
                get() {
                    getterCalls += 1;
                    throw new Error("timeout getter should not run");
                },
            });
            Object.defineProperty(options, "ports", {
                enumerable: true,
                get() {
                    getterCalls += 1;
                    throw new Error("ports getter should not run");
                },
            });
            Object.defineProperty(options, "unexpected", {
                enumerable: true,
                get() {
                    getterCalls += 1;
                    throw new Error("unexpected getter should not run");
                },
            });

            // Act
            const result = await checkConnectivity(
                "example.com",
                options as ConnectivityOptions
            );

            // Assert
            expect(result.status).toBe("degraded");
            expect(mockDns.resolve4).toHaveBeenCalledWith("example.com");
            expect(getterCalls).toBe(0);
        });
        it("should ignore invalid TCP port overrides and probe valid ports", async () => {
            // Arrange
            mockDns.resolve4.mockRejectedValue(
                new Error("DNS fallback unused")
            );
            let connectHandler: (() => void) | undefined;
            const connectCalls: number[] = [];
            const mockSocket = {
                connect: vi.fn((port: number) => {
                    connectCalls.push(port);
                    if (port !== 443) {
                        throw new RangeError(`Invalid port ${port}`);
                    }
                    connectHandler?.();
                }),
                destroy: vi.fn(),
                on: vi.fn((event: string, callback: () => void) => {
                    if (event === "connect") {
                        connectHandler = callback;
                    }
                }),
                removeAllListeners: vi.fn(),
                setTimeout: vi.fn(),
            };

            mockNet.Socket.mockImplementation(function MockSocketInstance() {
                return mockSocket as unknown as net.Socket;
            });

            // Act
            const result = await checkConnectivity("example.com", {
                method: "tcp",
                ports: [
                    0,
                    -1,
                    65_536,
                    12.5,
                    443,
                ],
            });

            // Assert
            expect(result.status).toBe("up");
            expect(result.details).toBe(
                "TCP connection successful on port 443"
            );
            expect(connectCalls).toEqual([443]);
            expect(mockDns.resolve4).not.toHaveBeenCalled();
        });
    });
    describe("Status validation", () => {
        it("should only return valid MonitorCheckResult status values", async () => {
            // Test HTTP degraded state
            mockFetch.mockResolvedValue({
                ok: false,
                status: 403,
                statusText: "Forbidden",
            });
            const httpResult = await checkHttpConnectivity(
                "https://example.com"
            );
            expect([
                "up",
                "degraded",
                "down",
            ]).toContain(httpResult.status);
            // Test DNS degraded state
            mockDns.resolve4.mockResolvedValue(["192.168.1.1"]);
            const mockSocket = {
                setTimeout: vi.fn(),
                on: vi.fn((event, callback) => {
                    if (event === "error") {
                        setTimeout(() => callback(), 10);
                    }
                }),
                connect: vi.fn(),
                destroy: vi.fn(),
                removeAllListeners: vi.fn(),
            };

            mockNet.Socket.mockImplementation(function MockSocketInstance() {
                return mockSocket as unknown as net.Socket;
            });
            const tcpResult = await checkConnectivity("example.com");
            expect([
                "up",
                "degraded",
                "down",
            ]).toContain(tcpResult.status);
        });
    });
    describe("Performance and timing", () => {
        it("should record accurate response times for different states", async () => {
            // Test up state timing
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: "OK",
            });
            const upResult = await checkHttpConnectivity(
                "https://fast.example.com"
            );
            expect(upResult.responseTime).toBeGreaterThan(0);
            // Test degraded state timing
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: "Not Found",
            });
            const degradedResult = await checkHttpConnectivity(
                "https://example.com/404"
            );
            expect(degradedResult.responseTime).toBeGreaterThan(0);
            // Test down state timing
            mockFetch.mockRejectedValue(new Error("Connection failed"));
            const downResult = await checkHttpConnectivity(
                "https://unreachable.example.com"
            );
            expect(downResult.responseTime).toBeGreaterThan(0);
        });
    });
});
