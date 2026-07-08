/**
 * Tests for UUID generation utility.
 */

import { fc, test } from "@fast-check/vitest";
import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateUuid } from "../utils/data/generateUuid";

const cryptoBaseline = webcrypto;
const FALLBACK_ID_REGEX =
    /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/v;
const SECURE_RANDOM_UNAVAILABLE_MESSAGE =
    "Secure random ID generation is unavailable";

const createMockGetRandomValues = () => {
    let callCount = 0;
    return vi.fn((buffer: Uint8Array): Uint8Array => {
        callCount += 1;
        let remaining = callCount;
        for (let index = buffer.length - 1; index >= 0; index -= 1) {
            buffer[index] = remaining % 256;
            remaining = Math.floor(remaining / 256);
        }
        return buffer;
    });
};

afterEach(() => {
    vi.stubGlobal("crypto", cryptoBaseline);
});

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
            expect(uuid).toMatch(
                /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/iv
            );
        });
    });

    describe("with crypto.randomUUID unavailable", () => {
        beforeEach(() => {
            vi.stubGlobal("crypto", {
                getRandomValues: createMockGetRandomValues(),
            });
        });

        it("should use secure fallback implementation when randomUUID is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const uuid = generateUuid();

            expect(uuid).toMatch(FALLBACK_ID_REGEX);
        });

        it("should fail closed when crypto is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.stubGlobal("crypto", undefined);

            expect(() => generateUuid()).toThrow(
                SECURE_RANDOM_UNAVAILABLE_MESSAGE
            );
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
                getRandomValues: createMockGetRandomValues(),
                // RandomUUID is not defined
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

            expect(uuid).toMatch(FALLBACK_ID_REGEX);
        });
    });

    describe("with crypto.randomUUID throwing error", () => {
        beforeEach(() => {
            // Mock crypto.randomUUID to throw an error
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => {
                    throw new Error("randomUUID not supported");
                }),
                getRandomValues: createMockGetRandomValues(),
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
            expect(uuid).toMatch(FALLBACK_ID_REGEX);
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
            expect(uuid1).toMatch(FALLBACK_ID_REGEX);
            expect(uuid2).toMatch(FALLBACK_ID_REGEX);
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
                    getRandomValues: createMockGetRandomValues(),
                });

                const uuid = generateUuid();
                expect(uuid).toMatch(FALLBACK_ID_REGEX);
            }
        });
    });

    describe("with crypto.randomUUID as non-function", () => {
        beforeEach(() => {
            // Mock crypto with randomUUID as a non-function value
            vi.stubGlobal("crypto", {
                randomUUID: "not-a-function",
                getRandomValues: createMockGetRandomValues(),
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

            expect(uuid).toMatch(FALLBACK_ID_REGEX);
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
                        .mockReturnValueOnce(
                            "00000000-0000-4000-8000-000000000001"
                        )
                        .mockReturnValueOnce(
                            "00000000-0000-4000-8000-000000000002"
                        )
                        .mockReturnValueOnce(
                            "00000000-0000-4000-8000-000000000003"
                        ),
                },
            });

            const uuid1 = generateUuid();
            const uuid2 = generateUuid();
            const uuid3 = generateUuid();

            expect(uuid1).toBe("00000000-0000-4000-8000-000000000001");
            expect(uuid2).toBe("00000000-0000-4000-8000-000000000002");
            expect(uuid3).toBe("00000000-0000-4000-8000-000000000003");
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

            vi.stubGlobal("crypto", {
                getRandomValues: createMockGetRandomValues(),
            });

            const ids: string[] = [];
            for (let i = 0; i < 10; i++) {
                ids.push(generateUuid());
            }

            // All should be valid and different
            for (const id of ids) {
                expect(id).toMatch(FALLBACK_ID_REGEX);
            }

            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    describe("return value validation", () => {
        it("should always return a string", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: cryptoBaseline,
                writable: true,
            });

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

            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: cryptoBaseline,
                writable: true,
            });

            const uuid = generateUuid();
            expect(uuid).not.toMatch(/\s/v);
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
                randomUUID: vi.fn(() => "00000000-0000-4000-8000-000000000999"),
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

            vi.stubGlobal("crypto", {
                getRandomValues: createMockGetRandomValues(),
            });

            const uuids: string[] = [];
            for (let i = 0; i < 5; i++) {
                uuids.push(generateUuid());
            }

            // All should be valid fallback format
            for (const uuid of uuids) {
                expect(typeof uuid).toBe("string");
                expect(uuid).toMatch(FALLBACK_ID_REGEX);
            }
        });

        it("should generate fallback IDs with correct structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.stubGlobal("crypto", {
                getRandomValues: createMockGetRandomValues(),
            });

            const uuid = generateUuid();

            expect(uuid).toMatch(FALLBACK_ID_REGEX);
        });
    });

    describe("Property-based tests for UUID generation", () => {
        test.prop([fc.integer({ min: 1, max: 1000 })])(
            "should generate unique UUIDs for any number of iterations",
            (iterations) => {
                vi.stubGlobal("crypto", {
                    getRandomValues: createMockGetRandomValues(),
                });

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
                Object.defineProperty(globalThis, "crypto", {
                    configurable: true,
                    value: cryptoBaseline,
                    writable: true,
                });

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
                        randomUUID: vi.fn(
                            () => "00000000-0000-4000-8000-000000000123"
                        ),
                    });
                } else {
                    vi.stubGlobal("crypto", {
                        getRandomValues: createMockGetRandomValues(),
                    });
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
                    expect(uuid).toBe("00000000-0000-4000-8000-000000000123");
                } else {
                    expect(uuid).toMatch(FALLBACK_ID_REGEX);
                }
            }
        );

        test.prop([fc.integer({ min: 10, max: 30 })])(
            "should maintain uniqueness under realistic concurrent generation",
            async (numRequests) => {
                vi.stubGlobal("crypto", {
                    getRandomValues: createMockGetRandomValues(),
                });

                // Generate UUIDs in a more realistic concurrent pattern
                // Simulate small delays that might occur in real usage
                const results = await Promise.all(
                    Array.from(
                        { length: numRequests },
                        (_, i) =>
                            new Promise<string>((resolve) => {
                                setTimeout(() => {
                                    resolve(generateUuid());
                                }, i);
                            })
                    )
                );

                const uniqueResults = new Set(results);

                expect(uniqueResults.size).toBe(results.length);
            }
        );

        test.prop([fc.constantFrom("undefined", "null", "object")])(
            "should handle various crypto states gracefully",
            (cryptoState) => {
                switch (cryptoState) {
                    case "null": {
                        vi.stubGlobal("crypto", null);
                        break;
                    }
                    case "object": {
                        vi.stubGlobal("crypto", {
                            getRandomValues: createMockGetRandomValues(),
                        });
                        break;
                    }
                    case "undefined": {
                        vi.stubGlobal("crypto", undefined);
                        break;
                    }
                }

                if (cryptoState !== "object") {
                    expect(() => generateUuid()).toThrow(
                        SECURE_RANDOM_UNAVAILABLE_MESSAGE
                    );
                    return;
                }

                const uuid = generateUuid();
                expect(typeof uuid).toBe("string");
                expect(uuid.length).toBeGreaterThan(0);
                expect(uuid).toMatch(FALLBACK_ID_REGEX);
            }
        );

        test.prop([fc.integer({ min: 1000, max: 2_000_000_000 })])(
            "should not include timestamps in secure fallback mode",
            (mockNow) => {
                vi.stubGlobal("crypto", {
                    getRandomValues: createMockGetRandomValues(),
                });
                vi.spyOn(Date, "now").mockReturnValue(mockNow);

                expect(generateUuid()).toMatch(FALLBACK_ID_REGEX);
            }
        );
    });
});
