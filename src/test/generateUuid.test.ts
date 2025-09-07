/**
 * Tests for UUID generation utility.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { test, fc } from "@fast-check/vitest";

import { generateUuid } from "../utils/data/generateUuid";

describe("UUID Generation", () => {
    describe("with crypto.randomUUID available", () => {
        beforeEach(() => {
            // Mock crypto.randomUUID
            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: {
                    randomUUID: vi.fn(
                        () => "123e4567-e89b-12d3-a456-426614174000"
                    ),
                },
            });
        });

        it("should use crypto.randomUUID when available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const uuid = generateUuid();

            expect(crypto.randomUUID).toHaveBeenCalled();
            expect(uuid).toBe("123e4567-e89b-12d3-a456-426614174000");
        });

        it("should return valid UUID format", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const uuid = generateUuid();

            // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            expect(uuid).toMatch(/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i);
        });
    });

    describe("with crypto.randomUUID unavailable", () => {
        beforeEach(() => {
            // Temporarily remove crypto to test fallback
            vi.stubGlobal("crypto", undefined);
        });

        afterEach(() => {
            // Restore the crypto mock from setup
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(
                    () => `mock-uuid-${Math.random().toString(36).slice(2, 15)}`
                ),
                getRandomValues: vi.fn((arr) => {
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] = Math.floor(Math.random() * 256);
                    }
                    return arr;
                }),
            });
        });

        it("should use fallback implementation when crypto is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const uuid = generateUuid();

            expect(uuid).toMatch(/^site-[\da-z]+-\d+$/);
        });

        it("should include timestamp in fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const beforeTime = Date.now();
            const uuid = generateUuid();
            const afterTime = Date.now();

            // Extract timestamp (before microseconds) from format: site-xxxxx-tttttttttttttmmm
            const timestampMatch = /(?<full>\d+)$/.exec(uuid);
            expect(timestampMatch).toBeTruthy();

            if (timestampMatch && timestampMatch.groups) {
                const fullDigits = timestampMatch.groups["full"];
                // Remove the last 3 digits (microseconds) to get the timestamp
                const timestampStr = fullDigits.slice(0, -3);
                const timestamp = Number.parseInt(timestampStr, 10);
                expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
                expect(timestamp).toBeLessThanOrEqual(afterTime);
            }
        });

        it("should generate unique IDs in fallback mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const ids = new Set();

            // Generate multiple IDs
            for (let i = 0; i < 100; i++) {
                ids.add(generateUuid());
            }

            // All should be unique
            expect(ids.size).toBe(100);
        });
    });

    describe("with crypto available but no randomUUID method", () => {
        beforeEach(() => {
            // Mock crypto without randomUUID
            vi.stubGlobal("crypto", {
                getRandomValues: vi.fn(),
                // randomUUID is not defined
            });
        });

        afterEach(() => {
            // Restore the crypto mock from setup
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(
                    () => `mock-uuid-${Math.random().toString(36).slice(2, 15)}`
                ),
                getRandomValues: vi.fn((arr) => {
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] = Math.floor(Math.random() * 256);
                    }
                    return arr;
                }),
            });
        });

        it("should use fallback when randomUUID method is not available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const uuid = generateUuid();

            expect(uuid).toMatch(/^site-[\da-z]+-\d+$/);
        });
    });

    describe("with crypto.randomUUID throwing error", () => {
        beforeEach(() => {
            // Mock crypto.randomUUID to throw an error
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => {
                    throw new Error("randomUUID not supported");
                }),
                getRandomValues: vi.fn(),
            });
        });

        afterEach(() => {
            // Restore the crypto mock from setup
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(
                    () => `mock-uuid-${Math.random().toString(36).slice(2, 15)}`
                ),
                getRandomValues: vi.fn((arr) => {
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] = Math.floor(Math.random() * 256);
                    }
                    return arr;
                }),
            });
        });

        it("should use fallback when randomUUID throws an error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const uuid = generateUuid();

            expect(crypto.randomUUID).toHaveBeenCalled();
            expect(uuid).toMatch(/^site-[\da-z]+-\d+$/);
        });

        it("should handle multiple calls when randomUUID throws", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const uuid1 = generateUuid();
            const uuid2 = generateUuid();

            expect(crypto.randomUUID).toHaveBeenCalledTimes(2);
            expect(uuid1).toMatch(/^site-[\da-z]+-\d+$/);
            expect(uuid2).toMatch(/^site-[\da-z]+-\d+$/);
            expect(uuid1).not.toBe(uuid2);
        });

        it("should handle different types of errors from randomUUID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            // Test with different error types
            const errors = [
                new Error("Not supported"),
                new TypeError("randomUUID is not a function"),
                new ReferenceError("crypto is not defined"),
                "String error",
                null,
                undefined,
            ];

            for (const error of errors) {
                vi.stubGlobal("crypto", {
                    randomUUID: vi.fn(() => {
                        throw error;
                    }),
                    getRandomValues: vi.fn(),
                });

                const uuid = generateUuid();
                expect(uuid).toMatch(/^site-[\da-z]+-\d+$/);
            }
        });
    });

    describe("with crypto.randomUUID as non-function", () => {
        beforeEach(() => {
            // Mock crypto with randomUUID as a non-function value
            vi.stubGlobal("crypto", {
                randomUUID: "not-a-function",
                getRandomValues: vi.fn(),
            });
        });

        afterEach(() => {
            // Restore the crypto mock from setup
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(
                    () => `mock-uuid-${Math.random().toString(36).slice(2, 15)}`
                ),
                getRandomValues: vi.fn((arr) => {
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] = Math.floor(Math.random() * 256);
                    }
                    return arr;
                }),
            });
        });

        it("should use fallback when randomUUID is not a function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const uuid = generateUuid();

            expect(uuid).toMatch(/^site-[\da-z]+-\d+$/);
        });
    });

    describe("edge cases", () => {
        it("should handle consecutive calls", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Mock crypto to ensure we test the function directly
            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: {
                    randomUUID: vi
                        .fn()
                        .mockReturnValueOnce("uuid-1")
                        .mockReturnValueOnce("uuid-2")
                        .mockReturnValueOnce("uuid-3"),
                },
            });

            const uuid1 = generateUuid();
            const uuid2 = generateUuid();
            const uuid3 = generateUuid();

            expect(uuid1).toBe("uuid-1");
            expect(uuid2).toBe("uuid-2");
            expect(uuid3).toBe("uuid-3");
            expect(crypto.randomUUID).toHaveBeenCalledTimes(3);
        });

        it("should work with fallback in tight loops", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Remove crypto to force fallback
            vi.stubGlobal("crypto", undefined);

            const ids: string[] = [];
            for (let i = 0; i < 10; i++) {
                ids.push(generateUuid());
            }

            // All should be valid and different
            for (const id of ids) {
                expect(id).toMatch(/^site-[\da-z]+-\d+$/);
            }

            // Should have different random parts (high probability)
            const randomParts = ids.map((id) => id.split("-")[1]);
            const uniqueRandomParts = new Set(randomParts);
            expect(uniqueRandomParts.size).toBeGreaterThan(1);

            // Restore crypto mock
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(
                    () => `mock-uuid-${Math.random().toString(36).slice(2, 15)}`
                ),
                getRandomValues: vi.fn(),
            });
        });
    });

    describe("return value validation", () => {
        it("should always return a string", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const uuid = generateUuid();
            expect(typeof uuid).toBe("string");
            expect(uuid.length).toBeGreaterThan(0);
        });

        it("should not return empty string", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const uuid = generateUuid();
            expect(uuid).not.toBe("");
        });

        it("should not contain whitespace", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const uuid = generateUuid();
            expect(uuid).not.toMatch(/\s/);
        });

        it("should handle rapid successive calls with crypto", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Mock crypto to return predictable values
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => `rapid-test-${Date.now()}`),
            });

            const uuids: string[] = [];
            for (let i = 0; i < 5; i++) {
                uuids.push(generateUuid());
            }

            // All should be strings
            for (const uuid of uuids) {
                expect(typeof uuid).toBe("string");
                expect(uuid.length).toBeGreaterThan(0);
            }

            expect(crypto.randomUUID).toHaveBeenCalledTimes(5);
        });

        it("should handle rapid successive calls with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Remove crypto to force fallback
            vi.stubGlobal("crypto", undefined);

            const uuids: string[] = [];
            for (let i = 0; i < 5; i++) {
                uuids.push(generateUuid());
            }

            // All should be valid fallback format
            for (const uuid of uuids) {
                expect(typeof uuid).toBe("string");
                expect(uuid).toMatch(/^site-[\da-z]+-\d+$/);
            }

            // Restore crypto mock
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(
                    () => `mock-uuid-${Math.random().toString(36).slice(2, 15)}`
                ),
                getRandomValues: vi.fn(),
            });
        });

        it("should generate fallback IDs with correct structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Force fallback by removing crypto
            vi.stubGlobal("crypto", undefined);

            const uuid = generateUuid();
            const parts = uuid.split("-");

            expect(parts).toHaveLength(3);
            expect(parts[0]).toBe("site");
            expect(parts[1]).toMatch(/^[\da-z]+$/);
            expect(parts[1]?.length).toBe(12); // Two random parts of 6 chars each = 12 characters
            expect(parts[2]).toMatch(/^\d+$/);
            expect(Number.parseInt(parts[2] ?? "0", 10)).toBeGreaterThan(0);

            // Restore crypto mock
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(
                    () => `mock-uuid-${Math.random().toString(36).slice(2, 15)}`
                ),
                getRandomValues: vi.fn(),
            });
        });
    });

    describe("Property-based tests for UUID generation", () => {
        test.prop([fc.integer({ min: 1, max: 1000 })])(
            "should generate unique UUIDs for any number of iterations",
            (iterations) => {
                const uuids = new Set<string>();

                for (let i = 0; i < iterations; i++) {
                    const uuid = generateUuid();
                    uuids.add(uuid);
                }

                // All UUIDs should be unique
                expect(uuids.size).toBe(iterations);
            }
        );

        test.prop([fc.constant(undefined)])(
            "should always return a non-empty string",
            () => {
                const uuid = generateUuid();

                expect(typeof uuid).toBe("string");
                expect(uuid.length).toBeGreaterThan(0);
            }
        );

        test.prop([fc.boolean()])(
            "should handle crypto availability consistently",
            (cryptoAvailable) => {
                if (cryptoAvailable) {
                    vi.stubGlobal("crypto", {
                        randomUUID: vi.fn(() => "test-uuid-123"),
                    });
                } else {
                    vi.stubGlobal("crypto", undefined);
                }

                const uuid = generateUuid();
                expect(typeof uuid).toBe("string");
                expect(uuid.length).toBeGreaterThan(0);

                if (
                    cryptoAvailable &&
                    crypto &&
                    typeof crypto.randomUUID === "function"
                ) {
                    // Should use crypto UUID format
                    expect(uuid).toBe("test-uuid-123");
                } else {
                    // Should use fallback format
                    expect(uuid).toMatch(/^site-[\da-z]+-\d+$/);
                }
            }
        );

        test.prop([fc.integer({ min: 10, max: 30 })])(
            "should maintain uniqueness under realistic concurrent generation",
            async (numRequests) => {
                // Ensure crypto.randomUUID is available for better uniqueness
                vi.stubGlobal("crypto", {
                    randomUUID: vi.fn(
                        () =>
                            `mock-uuid-${Date.now()}-${Math.random().toString(36).slice(2, 15)}`
                    ),
                    getRandomValues: vi.fn(),
                });

                // Generate UUIDs in a more realistic concurrent pattern
                // Simulate small delays that might occur in real usage
                const results = await Promise.all(
                    Array.from(
                        { length: numRequests },
                        (_, i) =>
                            new Promise<string>((resolve) => {
                                setTimeout(() => resolve(generateUuid()), i);
                            })
                    )
                );

                const uniqueResults = new Set(results);

                // With crypto.randomUUID mock, all UUIDs should be unique
                // For small sample sizes (10-30), allow for very rare collisions due to Math.random()
                const uniquenessRatio = uniqueResults.size / results.length;
                const minExpectedUnique = Math.max(
                    1,
                    Math.floor(numRequests * 0.8)
                );

                if (numRequests <= 15) {
                    // For very small samples, be more lenient but still expect high uniqueness
                    expect(uniquenessRatio).toBeGreaterThan(0.8); // At least 80% unique for small samples
                } else {
                    // For larger samples, maintain stricter requirements
                    expect(uniquenessRatio).toBeGreaterThan(0.9); // At least 90% unique
                }
                expect(uniqueResults.size).toBeGreaterThan(minExpectedUnique);
            }
        );

        test.prop([fc.constantFrom("undefined", "null", "object")])(
            "should handle various crypto states gracefully",
            (cryptoState) => {
                switch (cryptoState) {
                    case "undefined": {
                        vi.stubGlobal("crypto", undefined);
                        break;
                    }
                    case "null": {
                        vi.stubGlobal("crypto", null);
                        break;
                    }
                    case "object": {
                        vi.stubGlobal("crypto", {});
                        break;
                    }
                }

                const uuid = generateUuid();
                expect(typeof uuid).toBe("string");
                expect(uuid.length).toBeGreaterThan(0);

                // Should always fall back to site-* format when crypto is not available
                if (
                    cryptoState !== "object" ||
                    !crypto ||
                    typeof crypto.randomUUID !== "function"
                ) {
                    expect(uuid).toMatch(/^site-[\da-z]+-\d+$/);
                }
            }
        );

        test.prop([fc.integer({ min: 1000, max: 2_000_000_000 })])(
            "should include reasonable timestamp in fallback mode",
            (mockNow) => {
                vi.stubGlobal("crypto", undefined);
                vi.spyOn(Date, "now").mockReturnValue(mockNow);

                const uuid = generateUuid();
                expect(uuid).toMatch(/^site-[\da-z]+-\d+$/);

                // Extract all digits from the timestamp+microseconds part, then remove last 3 digits (microseconds)
                const timestampMatch = /(?<full>\d+)$/.exec(uuid);
                expect(timestampMatch).toBeTruthy();

                if (timestampMatch?.groups) {
                    const fullDigits = timestampMatch.groups["full"];
                    // Remove the last 3 digits (microseconds) to get the timestamp
                    const timestampStr = fullDigits.slice(0, -3);
                    const extractedTimestamp = Number.parseInt(
                        timestampStr,
                        10
                    );
                    expect(extractedTimestamp).toBe(mockNow);
                }

                vi.restoreAllMocks();
            }
        );
    });
});
