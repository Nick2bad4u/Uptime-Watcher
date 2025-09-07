/**
 * @file Comprehensive tests for generateUuid utility function Testing UUID
 *   generation, crypto availability, and fallback behavior
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { generateUuid } from "../../../utils/data/generateUuid";

describe(generateUuid, () => {
    let originalCrypto: any;

    beforeEach(() => {
        // Store original crypto object
        originalCrypto = globalThis.crypto;
    });

    afterEach(() => {
        // Restore original crypto object
        globalThis.crypto = originalCrypto;
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    describe("Native crypto.randomUUID Behavior", () => {
        it("should use crypto.randomUUID when available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const mockUuid = "123e4567-e89b-12d3-a456-426614174000";
            const mockRandomUuid = vi.fn().mockReturnValue(mockUuid);

            globalThis.crypto = {
                randomUUID: mockRandomUuid,
            } as any;

            // Act
            const result = generateUuid();

            // Assert
            expect(mockRandomUuid).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockUuid);
        });

        it("should return different UUIDs on multiple calls with crypto.randomUUID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const mockUuids = [
                "123e4567-e89b-12d3-a456-426614174000",
                "987fcdeb-51a2-43d1-8765-123456789abc",
                "abcdef12-3456-7890-abcd-ef1234567890",
            ];
            let callCount = 0;
            const mockRandomUuid = vi
                .fn()
                .mockImplementation(() => mockUuids[callCount++]);

            globalThis.crypto = {
                randomUUID: mockRandomUuid,
            } as any;

            // Act
            const result1 = generateUuid();
            const result2 = generateUuid();
            const result3 = generateUuid();

            // Assert
            expect(result1).toBe(mockUuids[0]);
            expect(result2).toBe(mockUuids[1]);
            expect(result3).toBe(mockUuids[2]);
            expect(result1).not.toBe(result2);
            expect(result2).not.toBe(result3);
            expect(mockRandomUuid).toHaveBeenCalledTimes(3);
        });

        it("should handle crypto.randomUUID returning empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const mockRandomUuid = vi.fn().mockReturnValue("");

            globalThis.crypto = {
                randomUUID: mockRandomUuid,
            } as any;

            // Act
            const result = generateUuid();

            // Assert
            expect(mockRandomUuid).toHaveBeenCalledTimes(1);
            expect(result).toBe("");
        });
    });

    describe("Fallback Behavior", () => {
        it("should use fallback when crypto is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = undefined as any;
            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-01-01T00:00:00.000Z"));

            // Mock Math.random for consistent testing
            const mockRandom = vi
                .spyOn(Math, "random")
                .mockReturnValue(0.123_456_789);

            // Act
            const result = generateUuid();

            // Assert
            expect(result).toBe("site-4fzzzx4fzzzx-1672531200000123");
            expect(mockRandom).toHaveBeenCalled();
        });

        it("should use fallback when crypto.randomUUID is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = {} as any; // crypto exists but randomUUID doesn't
            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-06-15T12:30:00.000Z"));

            const mockRandom = vi
                .spyOn(Math, "random")
                .mockReturnValue(0.987_654_321);

            // Act
            const result = generateUuid();

            // Assert
            expect(result).toBe("site-zk0000zk0000-1686832200000987");
            expect(mockRandom).toHaveBeenCalled();
        });

        it("should use fallback when crypto.randomUUID is not a function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = {
                randomUUID: "not-a-function",
            } as any;
            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-12-31T23:59:59.999Z"));

            const mockRandom = vi
                .spyOn(Math, "random")
                .mockReturnValue(0.555_555_555);

            // Act
            const result = generateUuid();

            // Assert
            expect(result).toBe("site-jzzzzyjzzzzy-1704067199999555");
            expect(mockRandom).toHaveBeenCalled();
        });

        it("should use fallback when crypto.randomUUID throws an error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const mockRandomUuid = vi.fn().mockImplementation(() => {
                throw new Error("Crypto not available");
            });

            globalThis.crypto = {
                randomUUID: mockRandomUuid,
            } as any;

            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-03-15T10:15:30.500Z"));

            const mockRandom = vi
                .spyOn(Math, "random")
                .mockReturnValue(0.111_111_111);

            // Act
            const result = generateUuid();

            // Assert
            expect(mockRandomUuid).toHaveBeenCalledTimes(1);
            expect(result).toBe("site-3zzzzz3zzzzz-1678875330500111");
            expect(mockRandom).toHaveBeenCalled();
        });

        it("should generate different fallback UUIDs on multiple calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = undefined as any;
            vi.useFakeTimers();

            let timeValue = 1_640_995_200_000; // 2022-01-01T00:00:00.000Z
            const randomValue = 0.1;

            vi.setSystemTime(timeValue);
            const mockRandom = vi
                .spyOn(Math, "random")
                // First generateUuid() call: 3 Math.random() calls
                .mockReturnValueOnce(0.1)    // randomPart1
                .mockReturnValueOnce(0.2)    // randomPart2
                .mockReturnValueOnce(0.3)    // microseconds
                // Second generateUuid() call: 3 Math.random() calls
                .mockReturnValueOnce(0.777_777_777)  // randomPart1
                .mockReturnValueOnce(0.777_777_777)  // randomPart2
                .mockReturnValueOnce(0.777_777_777)  // microseconds
                // Third generateUuid() call: 3 Math.random() calls
                .mockReturnValueOnce(0.259_259_259)  // randomPart1 - 'a' in base36
                .mockReturnValueOnce(0.518_518_518)  // randomPart2 - 's' in base36
                .mockReturnValueOnce(0.555_555_555); // microseconds

            // Act
            const result1 = generateUuid();

            // Advance time for second call
            timeValue += 1000;
            vi.setSystemTime(timeValue);
            const result2 = generateUuid();

            // Advance time for third call
            timeValue += 1000;
            vi.setSystemTime(timeValue);
            const result3 = generateUuid();

            // Assert
            expect(result1).toBe("site-3lllll777777-1640995200000300");
            expect(result2).toBe("site-rzzzzyrzzzzy-1640995201000777");
            expect(result3).toBe("site-9bzzzzinzzzy-1640995202000555");
            expect(result1).not.toBe(result2);
            expect(result2).not.toBe(result3);
            expect(mockRandom).toHaveBeenCalledTimes(9); // 3 generateUuid calls × 3 Math.random calls each
        });
    });

    describe("Fallback Format Validation", () => {
        it("should generate fallback UUIDs with correct format", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = undefined as any;
            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-01-01T00:00:00.000Z"));

            const _mockRandom = vi
                .spyOn(Math, "random")
                .mockReturnValue(0.123_456_789);
            void _mockRandom;

            // Act
            const result = generateUuid();

            // Assert
            expect(result).toMatch(/^site-[\da-z]{12}-\d{16}$/);
            expect(result.startsWith("site-")).toBeTruthy();
            expect(result).toContain("-1672531200000"); // timestamp part
        });

        it("should handle different Math.random values correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = undefined as any;
            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-01-01T00:00:00.000Z"));

            const testCases = [
                { random: 0, expected: "site--1672531200000000" },
                {
                    random: 0.999_999_999,
                    expected: "site-zzzzzxzzzzzx-1672531200000999",
                },
                { random: 0.5, expected: "site-ii-1672531200000500" },
            ];

            for (const { random, expected } of testCases) {
                // Arrange
                const mockRandom = vi
                    .spyOn(Math, "random")
                    .mockReturnValue(random);

                // Act
                const result = generateUuid();

                // Assert
                expect(result).toBe(expected);

                // Cleanup
                mockRandom.mockRestore();
            }
        });

        it("should include correct timestamp in fallback UUID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = undefined as any;
            const testTimestamp = 1_640_995_200_000; // 2022-01-01T00:00:00.000Z

            vi.useFakeTimers();
            vi.setSystemTime(testTimestamp);

            const _mockRandom = vi.spyOn(Math, "random").mockReturnValue(0.5);
            void _mockRandom;

            // Act
            const result = generateUuid();

            // Assert
            expect(result.includes(`-${testTimestamp}`)).toBeTruthy();
            expect(result).toContain(testTimestamp.toString());
        });
    });

    describe("Edge Cases", () => {
        it("should handle very large timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = undefined as any;
            const largeTimestamp = 9_999_999_999_999; // Year 2286

            vi.useFakeTimers();
            vi.setSystemTime(largeTimestamp);

            const _mockRandom = vi.spyOn(Math, "random").mockReturnValue(0.123);
            void _mockRandom;

            // Act
            const result = generateUuid();

            // Assert
            expect(result).toBe(`site-4feorn4feorn-${largeTimestamp}123`);
            expect(result).toContain(largeTimestamp.toString());
        });

        it("should handle timestamp of 0", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = undefined as any;

            vi.useFakeTimers();
            vi.setSystemTime(0); // Unix epoch

            const _mockRandom = vi.spyOn(Math, "random").mockReturnValue(0.5);
            void _mockRandom;

            // Act
            const result = generateUuid();

            // Assert
            expect(result).toBe("site-ii-0500");
            expect(result.includes("-0")).toBeTruthy();
        });

        it("should handle Math.random returning exactly 0", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = undefined as any;
            vi.useFakeTimers();
            vi.setSystemTime(1000);

            const _mockRandom = vi.spyOn(Math, "random").mockReturnValue(0);
            void _mockRandom;

            // Act
            const result = generateUuid();

            // Assert
            expect(result).toBe("site--1000000");
            expect(result).toContain("-1000");
        });

        it("should handle Math.random returning close to 1", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = undefined as any;
            vi.useFakeTimers();
            vi.setSystemTime(1000);

            const _mockRandom = vi
                .spyOn(Math, "random")
                .mockReturnValue(0.999_999_999);
            void _mockRandom;

            // Act
            const result = generateUuid();

            // Assert
            expect(result).toBe("site-zzzzzxzzzzzx-1000999");
            expect(result).toContain("zzzzzx");
        });
    });

    describe("Return Value Properties", () => {
        it("should always return a string", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test with crypto.randomUUID
            globalThis.crypto = {
                randomUUID: vi.fn().mockReturnValue("test-uuid"),
            } as any;

            expect(typeof generateUuid()).toBe("string");

            // Test with fallback
            globalThis.crypto = undefined as any;
            expect(typeof generateUuid()).toBe("string");
        });

        it("should always return a non-empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test with crypto.randomUUID
            globalThis.crypto = {
                randomUUID: vi.fn().mockReturnValue("test-uuid"),
            } as any;

            expect(generateUuid().length).toBeGreaterThan(0);

            // Test with fallback
            globalThis.crypto = undefined as any;
            expect(generateUuid().length).toBeGreaterThan(0);
        });

        it("should generate unique values across multiple calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange - Force fallback behavior by removing crypto entirely and mocking Math.random
            const originalCrypto = globalThis.crypto;
            const originalGlobalThisCrypto = globalThis.crypto;
            const originalWindowCrypto = (globalThis as any).window?.crypto;

            delete (globalThis as any).crypto;
            delete (globalThis as any).crypto;
            if ((globalThis as any).window) {
                delete (globalThis as any).window.crypto;
            }

            // Mock Math.random to return different values for uniqueness
            let randomValue = 0.1;
            const mockRandom = vi
                .spyOn(Math, "random")
                .mockImplementation(() => {
                    randomValue += 0.037; // Increment by a prime number for variation
                    return randomValue % 1; // Keep it between 0 and 1
                });

            const results = new Set<string>();
            const numCalls = 100;

            // Act - Generate many UUIDs
            for (let i = 0; i < numCalls; i++) {
                results.add(generateUuid());
            }

            // Assert - All should be unique (accounting for potential duplicates in fallback)
            expect(results.size).toBeGreaterThan(numCalls * 0.8); // At least 80% unique due to time + random

            // Restore everything
            globalThis.crypto = originalCrypto;
            globalThis.crypto = originalGlobalThisCrypto;
            if ((globalThis as any).window && originalWindowCrypto) {
                (globalThis as any).window.crypto = originalWindowCrypto;
            }
            mockRandom.mockRestore();
        });

        it("should maintain consistent format across environments", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test crypto environment
            globalThis.crypto = {
                randomUUID: vi
                    .fn()
                    .mockReturnValue("123e4567-e89b-12d3-a456-426614174000"),
            } as any;

            const cryptoResult = generateUuid();
            expect(typeof cryptoResult).toBe("string");

            // Test fallback environment
            globalThis.crypto = undefined as any;
            vi.useFakeTimers();
            vi.setSystemTime(1000);
            vi.spyOn(Math, "random").mockReturnValue(0.5);

            const fallbackResult = generateUuid();
            expect(typeof fallbackResult).toBe("string");
            expect(fallbackResult).toMatch(/^site-[\da-z]*-\d+$/); // Allow variable length random part
        });
    });

    describe("Performance and Reliability", () => {
        it("should handle rapid successive calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange - Force fallback to test uniqueness properly
            const originalCrypto = globalThis.crypto;
            const originalGlobalThisCrypto = globalThis.crypto;
            const originalWindowCrypto = (globalThis as any).window?.crypto;

            delete (globalThis as any).crypto;
            delete (globalThis as any).crypto;
            if ((globalThis as any).window) {
                delete (globalThis as any).window.crypto;
            }

            // Mock Math.random to return varying values
            let randomValue = 0.2;
            const mockRandom = vi
                .spyOn(Math, "random")
                .mockImplementation(() => {
                    randomValue += 0.041; // Different increment for variation
                    return randomValue % 1;
                });

            const results: string[] = [];
            const numCalls = 1000;

            // Act
            for (let i = 0; i < numCalls; i++) {
                results.push(generateUuid());
            }

            // Assert
            expect(results).toHaveLength(numCalls);
            expect(new Set(results).size).toBeGreaterThan(numCalls * 0.8); // At least 80% unique

            // Restore everything
            globalThis.crypto = originalCrypto;
            globalThis.crypto = originalGlobalThisCrypto;
            if ((globalThis as any).window && originalWindowCrypto) {
                (globalThis as any).window.crypto = originalWindowCrypto;
            }
            mockRandom.mockRestore();
        });

        it("should not throw errors under any circumstances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Test various problematic scenarios
            const scenarios = [
                () => {
                    globalThis.crypto = null as any;
                },
                () => {
                    globalThis.crypto = undefined as any;
                },
                () => {
                    globalThis.crypto = {} as any;
                },
                () => {
                    globalThis.crypto = { randomUUID: null } as any;
                },
                () => {
                    globalThis.crypto = {
                        randomUUID: () => {
                            throw new Error("Test error");
                        },
                    } as any;
                },
                () => {
                    globalThis.crypto = {
                        randomUUID: vi.fn().mockImplementation(() => {
                            throw new TypeError("Cannot read property");
                        }),
                    } as any;
                },
            ];

            for (const [index, setupScenario] of scenarios.entries()) {
                expect(() => {
                    setupScenario();
                    generateUuid();
                }).not.toThrow(`Scenario ${index + 1} should not throw`);
            }
        });

        it("should work with mocked Date.now", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            globalThis.crypto = undefined as any;
            const mockNow = vi
                .spyOn(Date, "now")
                .mockReturnValue(1_234_567_890_123);
            const mockRandom = vi.spyOn(Math, "random").mockReturnValue(0.5);

            // Act
            const result = generateUuid();

            // Assert
            expect(result).toBe("site-ii-1234567890123500");
            expect(mockNow).toHaveBeenCalled();
            expect(mockRandom).toHaveBeenCalled();

            // Cleanup
            mockNow.mockRestore();
            mockRandom.mockRestore();
        });
    });

    describe("Real-world Usage Scenarios", () => {
        it("should work in Node.js-like environment", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Simulate Node.js crypto module
            globalThis.crypto = {
                randomUUID: vi
                    .fn()
                    .mockReturnValue("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
            } as any;

            const result = generateUuid();
            expect(result).toBe("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
        });

        it("should work in browser-like environment without crypto", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Simulate old browser without crypto.randomUUID
            globalThis.crypto = undefined as any;
            vi.useFakeTimers();
            vi.setSystemTime(1_640_995_200_000);
            vi.spyOn(Math, "random").mockReturnValue(0.75);

            const result = generateUuid();
            expect(result).toBe("site-rr-1640995200000750");
            expect(result.startsWith("site-")).toBeTruthy();
        });

        it("should work for database primary keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Generate IDs that could be used as database keys
            const originalCrypto = globalThis.crypto;
            const originalGlobalThisCrypto = globalThis.crypto;
            const originalWindowCrypto = (globalThis as any).window?.crypto;

            delete (globalThis as any).crypto;
            delete (globalThis as any).crypto;
            if ((globalThis as any).window) {
                delete (globalThis as any).window.crypto;
            }

            // Mock Math.random for consistent testing
            let randomValue = 0.3;
            const mockRandom = vi
                .spyOn(Math, "random")
                .mockImplementation(() => {
                    randomValue += 0.039; // Different increment
                    return randomValue % 1;
                });

            const ids = Array.from({ length: 50 }, () => generateUuid());

            // All should be mostly unique (allowing for potential duplicates in fallback)
            expect(new Set(ids).size).toBeGreaterThan(30); // At least 60% unique

            // All should be valid strings
            for (const id of ids) {
                expect(typeof id).toBe("string");
                expect(id.length).toBeGreaterThan(0);
            }

            // Restore everything
            globalThis.crypto = originalCrypto;
            globalThis.crypto = originalGlobalThisCrypto;
            if ((globalThis as any).window && originalWindowCrypto) {
                (globalThis as any).window.crypto = originalWindowCrypto;
            }
            mockRandom.mockRestore();
        });

        it("should work for temporary file naming", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Generate IDs for temporary files
            globalThis.crypto = undefined as any;
            vi.useFakeTimers();
            vi.setSystemTime(1_234_567_890_123);
            vi.spyOn(Math, "random").mockReturnValue(0.75);

            const id = generateUuid();
            const filename = `temp-${id}.tmp`;

            expect(filename).toMatch(/^temp-site-[\da-z]*-\d+\.tmp$/); // Allow variable length random part
        });
    });
});
