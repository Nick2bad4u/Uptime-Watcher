/**
 * Comprehensive tests for Settings domain API Includes fast-check
 * property-based testing for robust coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";

// Mock electron using vi.hoisted() to ensure proper initialization order
const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

import {
    settingsApi,
    type SettingsApiInterface,
} from "../../../preload/domains/settingsApi";

describe("Settings Domain API", () => {
    let api: SettingsApiInterface;

    beforeEach(() => {
        vi.clearAllMocks();
        api = settingsApi;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("API Structure Validation", () => {
        it("should expose all required settings methods", () => {
            const expectedMethods = ["getHistoryLimit", "updateHistoryLimit"];

            for (const method of expectedMethods) {
                expect(api).toHaveProperty(method);
                expect(typeof api[method as keyof typeof api]).toBe("function");
            }
        });

        it("should reference the same settingsApi instance", () => {
            expect(api).toBe(settingsApi);
        });
    });

    describe("getHistoryLimit", () => {
        it("should call IPC with correct channel and return history limit", async () => {
            const mockLimit = 30; // 30 days
            mockIpcRenderer.invoke.mockResolvedValue(mockLimit);

            const result = await api.getHistoryLimit();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "get-history-limit"
            );
            expect(result).toBe(mockLimit);
            expect(typeof result).toBe("number");
        });

        it("should handle various valid history limits", async () => {
            const validLimits = [
                1,
                7,
                30,
                90,
                365,
                1095,
            ]; // 1 day to 3 years

            for (const limit of validLimits) {
                mockIpcRenderer.invoke.mockResolvedValue(limit);

                const result = await api.getHistoryLimit();

                expect(result).toBe(limit);
                expect(typeof result).toBe("number");
                expect(result).toBeGreaterThan(0);
            }
        });

        it("should handle zero and negative values", async () => {
            const edgeCases = [
                0,
                -1,
                -100,
            ];

            for (const limit of edgeCases) {
                mockIpcRenderer.invoke.mockResolvedValue(limit);

                const result = await api.getHistoryLimit();

                expect(result).toBe(limit);
            }
        });

        it("should handle very large history limits", async () => {
            const largeLimits = [
                10_000,
                365_000,
                Number.MAX_SAFE_INTEGER,
            ];

            for (const limit of largeLimits) {
                mockIpcRenderer.invoke.mockResolvedValue(limit);

                const result = await api.getHistoryLimit();

                expect(result).toBe(limit);
            }
        });

        it("should handle floating point values", async () => {
            const floatLimits = [
                30.5,
                7.25,
                1.1,
            ];

            for (const limit of floatLimits) {
                mockIpcRenderer.invoke.mockResolvedValue(limit);

                const result = await api.getHistoryLimit();

                expect(result).toBe(limit);
            }
        });

        it("should handle IPC errors", async () => {
            const error = new Error("Failed to get history limit");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.getHistoryLimit()).rejects.toThrow(
                "Failed to get history limit"
            );
        });

        it("should handle concurrent calls", async () => {
            const limit = 30;
            mockIpcRenderer.invoke.mockResolvedValue(limit);

            const promises = Array.from({ length: 5 }, () =>
                api.getHistoryLimit()
            );
            const results = await Promise.all(promises);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(5);
            for (const result of results) {
                expect(result).toBe(limit);
            }
        });

        it("should handle malformed responses", async () => {
            const malformedResponses = [
                "30", // String instead of number
                null,
                undefined,
                {},
                [],
                true,
                Number.NaN,
                Infinity,
                -Infinity,
            ];

            for (const response of malformedResponses) {
                mockIpcRenderer.invoke.mockResolvedValue(response);

                const result = await api.getHistoryLimit();
                expect(result).toBe(response);
            }
        });
    });

    describe("updateHistoryLimit", () => {
        it("should call IPC with correct channel and parameter", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            const newLimit = 60;
            const result = await api.updateHistoryLimit(newLimit);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "update-history-limit",
                newLimit
            );
            expect(result).toBeUndefined();
        });

        it("should handle various valid limit updates", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            const validLimits = [
                1,
                7,
                14,
                30,
                90,
                180,
                365,
            ];

            for (const limit of validLimits) {
                await api.updateHistoryLimit(limit);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "update-history-limit",
                    limit
                );
            }

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(
                validLimits.length
            );
        });

        it("should handle edge case limits", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            const edgeCases = [
                0,
                -1,
                999_999,
                Number.MAX_SAFE_INTEGER,
            ];

            for (const limit of edgeCases) {
                await api.updateHistoryLimit(limit);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "update-history-limit",
                    limit
                );
            }
        });

        it("should handle floating point limits", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            const floatLimits = [
                30.5,
                7.25,
                1.1,
            ];

            for (const limit of floatLimits) {
                await api.updateHistoryLimit(limit);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "update-history-limit",
                    limit
                );
            }
        });

        it("should handle update errors", async () => {
            const error = new Error("Failed to update history limit");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.updateHistoryLimit(30)).rejects.toThrow(
                "Failed to update history limit"
            );
        });

        it("should handle validation errors", async () => {
            const validationError = new Error(
                "Invalid history limit: must be positive"
            );
            mockIpcRenderer.invoke.mockRejectedValue(validationError);

            await expect(api.updateHistoryLimit(-10)).rejects.toThrow(
                "Invalid history limit"
            );
        });

        it("should handle multiple parameter scenarios", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            // Test with various argument counts
            await api.updateHistoryLimit(30);
            await api.updateHistoryLimit(60, "extra param" as never);
            await api.updateHistoryLimit();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(3);
        });

        it("should handle concurrent updates", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            const limits = [
                30,
                60,
                90,
                120,
                180,
            ];
            const promises = limits.map((limit) =>
                api.updateHistoryLimit(limit)
            );

            await Promise.all(promises);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(limits.length);
            for (const limit of limits) {
                const index = limits.indexOf(limit);
                expect(mockIpcRenderer.invoke).toHaveBeenNthCalledWith(
                    index + 1,
                    "update-history-limit",
                    limit
                );
            }
        });

        it("should handle special number values", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            const specialValues = [
                Number.NaN,
                Infinity,
                -Infinity,
            ];

            for (const value of specialValues) {
                await api.updateHistoryLimit(value);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "update-history-limit",
                    value
                );
            }
        });
    });

    describe("Property-based testing with fast-check", () => {
        it("should handle various history limit values for get operations", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: -1000, max: 10_000 }),
                    async (limit) => {
                        mockIpcRenderer.invoke.mockResolvedValue(limit);

                        const result = await api.getHistoryLimit();
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "get-history-limit"
                        );
                        expect(result).toBe(limit);
                    }
                ),
                { numRuns: 30 }
            );
        });

        it("should handle various limit updates with property-based testing", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 1, max: 3650 }), // 1 day to 10 years
                    async (limit) => {
                        mockIpcRenderer.invoke.mockResolvedValue(undefined);

                        await api.updateHistoryLimit(limit);
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "update-history-limit",
                            limit
                        );
                    }
                ),
                { numRuns: 25 }
            );
        });

        it("should handle floating point limits with property-based testing", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.float({ min: 0.1, max: 999.9 }),
                    async (limit) => {
                        mockIpcRenderer.invoke.mockResolvedValue(limit);

                        const result = await api.getHistoryLimit();
                        expect(result).toBe(limit);
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle various error scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc
                            .string({ minLength: 1 })
                            .map((msg) => new Error(msg)),
                        fc.constant(new TypeError("Type error")),
                        fc.constant(new RangeError("Range error"))
                    ),
                    async (error) => {
                        mockIpcRenderer.invoke.mockRejectedValue(error);

                        await expect(api.getHistoryLimit()).rejects.toThrow(
                            error.message
                        );
                    }
                ),
                { numRuns: 15 }
            );
        });

        it("should handle rapid sequential operations", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(fc.integer({ min: 1, max: 365 }), {
                        minLength: 1,
                        maxLength: 10,
                    }),
                    async (limits) => {
                        mockIpcRenderer.invoke.mockResolvedValue(undefined);

                        const promises = limits.map((limit) =>
                            api.updateHistoryLimit(limit)
                        );

                        await Promise.all(promises);
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(
                            limits.length
                        );
                    }
                ),
                { numRuns: 10 }
            );
        });
    });

    describe("Integration and workflow scenarios", () => {
        it("should handle complete settings workflow", async () => {
            // Get current limit
            mockIpcRenderer.invoke.mockResolvedValueOnce(30);
            const currentLimit = await api.getHistoryLimit();
            expect(currentLimit).toBe(30);

            // Update to new limit
            mockIpcRenderer.invoke.mockResolvedValueOnce(undefined);
            await api.updateHistoryLimit(60);

            // Verify new limit
            mockIpcRenderer.invoke.mockResolvedValueOnce(60);
            const newLimit = await api.getHistoryLimit();
            expect(newLimit).toBe(60);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(3);
        });

        it("should handle settings backup and restore scenario", async () => {
            // Get current settings for backup
            const originalLimit = 30;
            mockIpcRenderer.invoke.mockResolvedValueOnce(originalLimit);
            const backup = await api.getHistoryLimit();

            // Update to temporary limit
            mockIpcRenderer.invoke.mockResolvedValueOnce(undefined);
            await api.updateHistoryLimit(90);

            // Restore from backup
            mockIpcRenderer.invoke.mockResolvedValueOnce(undefined);
            await api.updateHistoryLimit(backup);

            // Verify restoration
            mockIpcRenderer.invoke.mockResolvedValueOnce(originalLimit);
            const restored = await api.getHistoryLimit();

            expect(restored).toBe(originalLimit);
        });

        it("should handle settings validation workflow", async () => {
            const testLimits = [
                1,
                30,
                90,
                365,
            ];

            for (const limit of testLimits) {
                // Try to update
                mockIpcRenderer.invoke.mockResolvedValueOnce(undefined);
                await api.updateHistoryLimit(limit);

                // Verify the update
                mockIpcRenderer.invoke.mockResolvedValueOnce(limit);
                const verified = await api.getHistoryLimit();
                expect(verified).toBe(limit);
            }
        });

        it("should handle settings migration scenario", async () => {
            // Simulate migration from old default to new default
            const oldDefault = 7;
            const newDefault = 30;

            mockIpcRenderer.invoke.mockResolvedValueOnce(oldDefault);
            const currentSetting = await api.getHistoryLimit();

            if (currentSetting === oldDefault) {
                mockIpcRenderer.invoke.mockResolvedValueOnce(undefined);
                await api.updateHistoryLimit(newDefault);
            }

            mockIpcRenderer.invoke.mockResolvedValueOnce(newDefault);
            const migrated = await api.getHistoryLimit();

            expect(migrated).toBe(newDefault);
        });

        it("should handle settings synchronization scenario", async () => {
            const syncedLimit = 45;

            // Multiple components checking and syncing
            const promises = Array.from({ length: 3 }, async () => {
                // Each component gets current setting
                mockIpcRenderer.invoke.mockResolvedValueOnce(syncedLimit);
                const current = await api.getHistoryLimit();

                // Update if needed
                if (current !== syncedLimit) {
                    mockIpcRenderer.invoke.mockResolvedValueOnce(undefined);
                    await api.updateHistoryLimit(syncedLimit);
                }

                return current;
            });

            const results = await Promise.all(promises);

            for (const result of results) {
                expect(result).toBe(syncedLimit);
            }
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle database connection errors", async () => {
            const dbError = new Error("Database connection failed");
            mockIpcRenderer.invoke.mockRejectedValue(dbError);

            await expect(api.getHistoryLimit()).rejects.toThrow(
                "Database connection failed"
            );
            await expect(api.updateHistoryLimit(30)).rejects.toThrow(
                "Database connection failed"
            );
        });

        it("should handle permission errors", async () => {
            const permissionError = new Error(
                "Insufficient permissions to modify settings"
            );
            mockIpcRenderer.invoke.mockRejectedValue(permissionError);

            await expect(api.updateHistoryLimit(30)).rejects.toThrow(
                "Insufficient permissions"
            );
        });

        it("should handle disk space errors", async () => {
            const diskError = new Error(
                "Insufficient disk space to store settings"
            );
            mockIpcRenderer.invoke.mockRejectedValue(diskError);

            await expect(api.updateHistoryLimit(365)).rejects.toThrow(
                "Insufficient disk space"
            );
        });

        it("should handle corrupted settings data", async () => {
            // Corrupted data returns non-number
            mockIpcRenderer.invoke.mockResolvedValue("corrupted");

            const result = await api.getHistoryLimit();

            expect(result).toBe("corrupted");
        });

        it("should handle extremely large limits", async () => {
            const extremeLimit = Number.MAX_SAFE_INTEGER;
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            await api.updateHistoryLimit(extremeLimit);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "update-history-limit",
                extremeLimit
            );
        });

        it("should handle rapid fire updates", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            // Fire 100 updates rapidly
            const promises = Array.from({ length: 100 }, (_, i) =>
                api.updateHistoryLimit(i + 1)
            );

            await Promise.all(promises);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(100);
        });

        it("should handle mixed success and failure scenarios", async () => {
            const responses = [
                30, // Success
                Promise.reject(new Error("Temporary failure")), // Failure
                60, // Success
                Promise.reject(new Error("Another failure")), // Failure
            ];

            let callIndex = 0;
            mockIpcRenderer.invoke.mockImplementation(() => {
                const response = responses[callIndex++];
                return response instanceof Promise
                    ? response
                    : Promise.resolve(response);
            });

            // First call succeeds
            const first = await api.getHistoryLimit();
            expect(first).toBe(30);

            // Second call fails
            await expect(api.getHistoryLimit()).rejects.toThrow(
                "Temporary failure"
            );

            // Third call succeeds
            const third = await api.getHistoryLimit();
            expect(third).toBe(60);

            // Fourth call fails
            await expect(api.getHistoryLimit()).rejects.toThrow(
                "Another failure"
            );
        });

        it("should handle timeout scenarios", async () => {
            const timeoutError = new Error("Operation timed out");
            mockIpcRenderer.invoke.mockRejectedValue(timeoutError);

            await expect(api.getHistoryLimit()).rejects.toThrow(
                "Operation timed out"
            );
            await expect(api.updateHistoryLimit(30)).rejects.toThrow(
                "Operation timed out"
            );
        });
    });

    describe("Type safety and contract validation", () => {
        it("should maintain proper typing for getHistoryLimit", async () => {
            const numericLimit = 42;
            mockIpcRenderer.invoke.mockResolvedValue(numericLimit);

            const result = await api.getHistoryLimit();

            // Should be assignable to number type based on interface
            expect(typeof result).toBe("number");
            expect(result).toBe(numericLimit);
        });

        it("should maintain proper typing for updateHistoryLimit", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            const result = await api.updateHistoryLimit(30);

            // Should return void/undefined based on interface
            expect(result).toBeUndefined();
        });

        it("should handle function context properly", async () => {
            const { getHistoryLimit, updateHistoryLimit } = api;

            mockIpcRenderer.invoke.mockResolvedValue(30);
            const limit = await getHistoryLimit();
            expect(limit).toBe(30);

            mockIpcRenderer.invoke.mockResolvedValue(undefined);
            const updateResult = await updateHistoryLimit(60);
            expect(updateResult).toBeUndefined();
        });

        it("should return Promise types correctly", () => {
            const getPromise = api.getHistoryLimit();
            const updatePromise = api.updateHistoryLimit(30);

            expect(getPromise).toBeInstanceOf(Promise);
            expect(updatePromise).toBeInstanceOf(Promise);
        });

        it("should handle method signature compatibility", async () => {
            // These should compile without TypeScript errors
            mockIpcRenderer.invoke.mockResolvedValue(30);

            // No arguments
            const result1 = await api.getHistoryLimit();
            expect(result1).toBe(30);

            // With arguments (should still work due to ...args signature)
            const result2 = await api.getHistoryLimit("extra" as never);
            expect(result2).toBe(30);

            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            // Single argument
            await api.updateHistoryLimit(60);

            // Multiple arguments (should work due to ...args signature)
            await api.updateHistoryLimit(90, "extra" as never);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(4);
        });
    });

    describe("Performance and optimization scenarios", () => {
        it("should handle high-frequency polling", async () => {
            const limit = 30;
            mockIpcRenderer.invoke.mockResolvedValue(limit);

            const start = Date.now();

            // Simulate polling every 100ms for 1 second
            const pollPromises = Array.from({ length: 10 }, async (_, i) => {
                await new Promise((resolve) => setTimeout(resolve, i * 100));
                return api.getHistoryLimit();
            });

            const results = await Promise.all(pollPromises);
            const duration = Date.now() - start;

            expect(results).toHaveLength(10);
            for (const result of results) {
                expect(result).toBe(limit);
            }
            expect(duration).toBeLessThan(2000); // Should complete efficiently
        });

        it("should handle burst configuration updates", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(undefined);

            const start = Date.now();

            // Burst of 50 updates
            const updates = Array.from({ length: 50 }, (_, i) =>
                api.updateHistoryLimit(i + 1)
            );

            await Promise.all(updates);
            const duration = Date.now() - start;

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(50);
            expect(duration).toBeLessThan(5000); // Should handle burst efficiently
        });

        it("should handle mixed read/write workload", async () => {
            let currentLimit = 30;

            mockIpcRenderer.invoke.mockImplementation((channel, ...args) => {
                if (channel === "get-history-limit") {
                    return Promise.resolve(currentLimit);
                } else if (channel === "update-history-limit") {
                    currentLimit = args[0] as number;
                    return Promise.resolve(undefined);
                }
                return Promise.reject(new Error("Unknown channel"));
            });

            // Mixed workload: read, write, read, write...
            await api.updateHistoryLimit(60);
            const limit1 = await api.getHistoryLimit();
            expect(limit1).toBe(60);

            await api.updateHistoryLimit(90);
            const limit2 = await api.getHistoryLimit();
            expect(limit2).toBe(90);

            await api.updateHistoryLimit(120);
            const limit3 = await api.getHistoryLimit();
            expect(limit3).toBe(120);
        });
    });
});
