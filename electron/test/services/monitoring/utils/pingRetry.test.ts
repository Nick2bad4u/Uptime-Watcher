/**
 * Test suite for ping retry utilities.
 *
 * @remarks
 * Tests the ping retry functionality including single ping attempts,
 * retry logic, error handling, and cross-platform compatibility.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";
import * as ping from "ping";

import { performPingCheckWithRetry, performSinglePingCheck } from "../../../../services/monitoring/utils/pingRetry";
import { MonitorCheckResult } from "../../../../services/monitoring/types";
import * as operationalHooksModule from "../../../../utils/operationalHooks";
import * as errorHandlingModule from "../../../../services/monitoring/utils/pingErrorHandling";

// Mock the ping library
vi.mock("ping");
const mockPing = ping as any;

// Mock operational hooks
vi.mock("../../../../utils/operationalHooks");
const mockWithOperationalHooks = operationalHooksModule.withOperationalHooks as MockedFunction<
    typeof operationalHooksModule.withOperationalHooks
>;

// Mock error handling
vi.mock("../../../../services/monitoring/utils/pingErrorHandling");
const mockHandlePingCheckError = errorHandlingModule.handlePingCheckError as MockedFunction<
    typeof errorHandlingModule.handlePingCheckError
>;

// Mock electron utils and logger
vi.mock("../../../../electronUtils", () => ({
    isDev: vi.fn(() => false),
}));

vi.mock("../../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("pingRetry utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default operational hooks mock - just calls the function
        mockWithOperationalHooks.mockImplementation(async (fn) => {
            return fn();
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("performSinglePingCheck", () => {
        const successfulPingResult = {
            alive: true,
            time: 25.5,
            packetLoss: "0",
            host: "example.com",
        };

        const failedPingResult = {
            alive: false,
            time: "unknown",
            packetLoss: "100",
            host: "example.com",
        };

        beforeEach(() => {
            mockPing.promise = {
                probe: vi.fn(),
            };
        });

        it("should successfully ping a reachable host", async () => {
            mockPing.promise.probe.mockResolvedValue(successfulPingResult);

            const result = await performSinglePingCheck("example.com", 5000);

            expect(result).toEqual({
                status: "up",
                responseTime: 26, // Rounded from 25.5
                details: "Ping successful - packet loss: 0%",
            });

            expect(mockPing.promise.probe).toHaveBeenCalledWith("example.com", {
                numeric: false,
                timeout: 5, // Converted from milliseconds to seconds
                min_reply: 1,
            });
        });

        it("should handle unreachable host", async () => {
            mockPing.promise.probe.mockResolvedValue(failedPingResult);

            const result = await performSinglePingCheck("unreachable.com", 3000);

            expect(result.status).toBe("down");
            expect(result.details).toBe("Host unreachable");
            expect(result.error).toBe("Ping failed - host unreachable");
            expect(typeof result.responseTime).toBe("number");
        });

        it("should use measured time when ping library doesn't provide time", async () => {
            const resultWithoutTime = {
                ...successfulPingResult,
                time: undefined,
            };
            mockPing.promise.probe.mockResolvedValue(resultWithoutTime);

            const startTime = Date.now();
            const result = await performSinglePingCheck("example.com", 5000);
            const endTime = Date.now();

            expect(result.status).toBe("up");
            expect(result.responseTime).toBeGreaterThanOrEqual(0);
            expect(result.responseTime).toBeLessThanOrEqual(endTime - startTime + 10); // Allow 10ms tolerance
        });

        it("should convert timeout from milliseconds to seconds", async () => {
            mockPing.promise.probe.mockResolvedValue(successfulPingResult);

            await performSinglePingCheck("example.com", 15_000);

            expect(mockPing.promise.probe).toHaveBeenCalledWith("example.com", {
                numeric: false,
                timeout: 15, // 15000ms -> 15s
                min_reply: 1,
            });
        });

        it("should use minimum timeout of 1 second", async () => {
            mockPing.promise.probe.mockResolvedValue(successfulPingResult);

            await performSinglePingCheck("example.com", 500); // Less than 1 second

            expect(mockPing.promise.probe).toHaveBeenCalledWith("example.com", {
                numeric: false,
                timeout: 1, // Minimum 1 second
                min_reply: 1,
            });
        });

        it("should throw error on ping library failure", async () => {
            const pingError = new Error("Network unreachable");
            mockPing.promise.probe.mockRejectedValue(pingError);

            await expect(performSinglePingCheck("example.com", 5000)).rejects.toThrow(
                "Ping failed: Network unreachable"
            );
        });

        it("should handle non-Error exceptions", async () => {
            mockPing.promise.probe.mockRejectedValue("String error");

            await expect(performSinglePingCheck("example.com", 5000)).rejects.toThrow("Ping failed: String error");
        });

        it("should use cross-platform ping options only", async () => {
            mockPing.promise.probe.mockResolvedValue(successfulPingResult);

            await performSinglePingCheck("example.com", 5000);

            const callArgs = mockPing.promise.probe.mock.calls[0][1];

            // Verify only cross-platform options are used
            expect(callArgs).toEqual({
                numeric: false,
                timeout: 5,
                min_reply: 1,
            });

            // Verify no platform-specific options
            expect(callArgs).not.toHaveProperty("extra");
            expect(callArgs).not.toHaveProperty("packetSize");
            expect(callArgs).not.toHaveProperty("deadline");
        });
    });

    describe("performPingCheckWithRetry", () => {
        const mockSingleCheckResult: MonitorCheckResult = {
            status: "up",
            responseTime: 50,
            details: "Ping successful - packet loss: 0%",
        };

        beforeEach(() => {
            // Mock operational hooks to just return the result
            mockWithOperationalHooks.mockImplementation(async (fn) => {
                return fn();
            });
        });

        it("should call withOperationalHooks with correct parameters", async () => {
            mockWithOperationalHooks.mockResolvedValue(mockSingleCheckResult);

            await performPingCheckWithRetry("example.com", 5000, 3);

            expect(mockWithOperationalHooks).toHaveBeenCalledWith(expect.any(Function), {
                initialDelay: expect.any(Number),
                maxRetries: 3,
                operationName: "ping-check",
            });
        });

        it("should return successful result on first attempt", async () => {
            mockWithOperationalHooks.mockResolvedValue(mockSingleCheckResult);

            const result = await performPingCheckWithRetry("google.com", 5000, 3);

            expect(result).toEqual(mockSingleCheckResult);
        });

        it("should handle retry failure and call error handler", async () => {
            const error = new Error("All ping attempts failed");
            const errorResult: MonitorCheckResult = {
                status: "down",
                responseTime: 0,
                details: "Ping failed: All ping attempts failed",
                error: "All ping attempts failed",
            };

            mockWithOperationalHooks.mockRejectedValue(error);
            mockHandlePingCheckError.mockReturnValue(errorResult);

            const result = await performPingCheckWithRetry("unreachable.com", 3000, 2);

            expect(result).toEqual(errorResult);
            expect(mockHandlePingCheckError).toHaveBeenCalledWith(error, {
                host: "unreachable.com",
                timeout: 3000,
                maxRetries: 2,
            });
        });

        it("should handle zero retries (single attempt only)", async () => {
            mockWithOperationalHooks.mockResolvedValue(mockSingleCheckResult);

            const result = await performPingCheckWithRetry("example.com", 5000, 0);

            expect(result).toEqual(mockSingleCheckResult);
            expect(mockWithOperationalHooks).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    maxRetries: 0,
                })
            );
        });

        it("should handle high retry counts", async () => {
            mockWithOperationalHooks.mockResolvedValue(mockSingleCheckResult);

            await performPingCheckWithRetry("example.com", 5000, 10);

            expect(mockWithOperationalHooks).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    maxRetries: 10,
                })
            );
        });

        it("should handle different host types", async () => {
            mockWithOperationalHooks.mockResolvedValue(mockSingleCheckResult);

            const hostTypes = ["google.com", "192.168.1.1", "localhost", "2001:db8::1", "subdomain.example.org"];

            for (const host of hostTypes) {
                mockWithOperationalHooks.mockClear();

                await performPingCheckWithRetry(host, 5000, 2);

                expect(mockWithOperationalHooks).toHaveBeenCalledWith(
                    expect.any(Function),
                    expect.objectContaining({
                        operationName: "ping-check",
                    })
                );
            }
        });
    });

    describe("cross-platform compatibility", () => {
        beforeEach(() => {
            mockPing.promise = {
                probe: vi.fn(),
            };
        });

        it("should use only cross-platform ping options", async () => {
            const successResult = {
                alive: true,
                time: 42,
                packetLoss: "0",
                host: "example.com",
            };
            mockPing.promise.probe.mockResolvedValue(successResult);

            await performSinglePingCheck("example.com", 5000);

            const options = mockPing.promise.probe.mock.calls[0][1];

            // Verify only supported cross-platform options
            const expectedOptions = {
                numeric: false,
                timeout: 5,
                min_reply: 1,
            };

            expect(options).toEqual(expectedOptions);
        });

        it("should not use platform-specific options", async () => {
            const successResult = {
                alive: true,
                time: 42,
                packetLoss: "0",
                host: "example.com",
            };
            mockPing.promise.probe.mockResolvedValue(successResult);

            await performSinglePingCheck("example.com", 5000);

            const options = mockPing.promise.probe.mock.calls[0][1];

            // Verify platform-specific options are not used
            expect(options).not.toHaveProperty("extra");
            expect(options).not.toHaveProperty("deadline");
            expect(options).not.toHaveProperty("packetSize");
            expect(options).not.toHaveProperty("sourceAddr");
            expect(options).not.toHaveProperty("outInterface");
        });
    });

    describe("error scenarios", () => {
        beforeEach(() => {
            mockPing.promise = {
                probe: vi.fn(),
            };
        });

        it("should handle ping library returning null", async () => {
            mockPing.promise.probe.mockResolvedValue(null);

            await expect(performSinglePingCheck("example.com", 5000)).rejects.toThrow();
        });

        it("should handle ping library returning undefined", async () => {
            mockPing.promise.probe.mockResolvedValue(undefined);

            await expect(performSinglePingCheck("example.com", 5000)).rejects.toThrow();
        });

        it("should handle malformed ping result", async () => {
            const malformedResult = {
                // Missing required properties
                someOtherProperty: "value",
            };
            mockPing.promise.probe.mockResolvedValue(malformedResult);

            const result = await performSinglePingCheck("example.com", 5000);

            expect(result.status).toBe("down");
            expect(result.details).toBe("Host unreachable");
        });
    });
});
