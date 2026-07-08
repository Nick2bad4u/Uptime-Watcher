/**
 * @file Tests for generateUuid utility function
 */

import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateUuid } from "../../../utils/data/generateUuid";

const originalCrypto = crypto;
const FALLBACK_ID_REGEX =
    /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/v;
const SECURE_RANDOM_UNAVAILABLE_MESSAGE =
    "Secure random ID generation is unavailable";
const createMockGetRandomValues = (): Crypto["getRandomValues"] =>
    ((array: Uint8Array): Uint8Array => {
        for (const [index] of array.entries()) {
            array[index] = index + 1;
        }
        return array;
    }) as Crypto["getRandomValues"];

describe(generateUuid, () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        globalThis.crypto = originalCrypto;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        globalThis.crypto = originalCrypto;
    });

    describe("basic Functionality", () => {
        it("should return a string", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateUuid();

            expect(result).toBeTypeOf("string");
            expect(result.length).toBeGreaterThan(0);
        });

        it("should generate unique values on multiple calls", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const results = new Set();
            const numCalls = 100;

            for (let i = 0; i < numCalls; i++) {
                results.add(generateUuid());
            }

            // All should be unique
            expect(results.size).toBe(numCalls);
        });
    });

    describe("native crypto.randomUUID Behavior", () => {
        it("should use crypto.randomUUID when available", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockRandomUUID = vi.fn(
                () => "550e8400-e29b-41d4-a716-446655440000"
            );
            const original = crypto;

            try {
                globalThis.crypto = {
                    ...original,
                    randomUUID: mockRandomUUID,
                } as unknown as Crypto;

                const result = generateUuid();

                expect(mockRandomUUID).toHaveBeenCalledTimes(1);
                expect(result).toBe("550e8400-e29b-41d4-a716-446655440000");
            } finally {
                globalThis.crypto = original;
            }
        });

        it("should use fallback when crypto.randomUUID throws an error", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const failure = new Error("randomUUID not available");
            const mockRandomUUID = vi.fn(() => {
                throw failure;
            });
            const original = crypto;

            try {
                globalThis.crypto = {
                    ...original,
                    getRandomValues: createMockGetRandomValues(),
                    randomUUID: mockRandomUUID,
                };

                const result = generateUuid();

                expect(result).toMatch(FALLBACK_ID_REGEX);
                expect(mockRandomUUID).toHaveBeenCalledTimes(1);
            } finally {
                globalThis.crypto = original;
            }
        });
    });

    describe("fallback Behavior", () => {
        it("should fail closed when crypto is undefined", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalCrypto = crypto;
            globalThis.crypto = undefined as any;

            expect(() => generateUuid()).toThrow(
                SECURE_RANDOM_UNAVAILABLE_MESSAGE
            );

            // Restore original
            globalThis.crypto = originalCrypto;
        });

        it("should use fallback when crypto.randomUUID is undefined", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.stubGlobal("crypto", {
                getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
                randomUUID: undefined,
            });

            const result = generateUuid();

            expect(result).toMatch(FALLBACK_ID_REGEX);
        });

        it("should use fallback when crypto.randomUUID is not a function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.stubGlobal("crypto", {
                getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
                randomUUID: "not-a-function",
            });

            const result = generateUuid();

            expect(result).toMatch(FALLBACK_ID_REGEX);
        });

        it("should use consistent secure fallback format across calls", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.stubGlobal("crypto", {
                getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
            });

            const results = Array.from({ length: 10 }, () => generateUuid());

            for (const result of results) {
                expect(result).toMatch(FALLBACK_ID_REGEX);
            }
        });
    });

    describe("edge Cases", () => {
        it("should fail closed instead of using timestamp fallbacks", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            globalThis.crypto = undefined as any;

            expect(() => generateUuid()).toThrow(
                SECURE_RANDOM_UNAVAILABLE_MESSAGE
            );
        });
    });

    describe("performance and Reliability", () => {
        it("should handle rapid successive calls", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const results: string[] = [];
            const numCalls = 1000;

            for (let i = 0; i < numCalls; i++) {
                results.push(generateUuid());
            }

            // Assert
            expect(results).toHaveLength(numCalls);
            expect(new Set(results).size).toBe(numCalls); // All unique
        });

        it("should work consistently across different test environments", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test multiple scenarios
            const nativeResult = generateUuid();

            expect(nativeResult).toBeTypeOf("string");
            expect(nativeResult.length).toBeGreaterThan(0);

            // Force fallback
            const originalCrypto = crypto;
            globalThis.crypto = undefined as any;

            expect(() => generateUuid()).toThrow(
                SECURE_RANDOM_UNAVAILABLE_MESSAGE
            );

            // Restore
            globalThis.crypto = originalCrypto;
        });
    });

    describe("real-world Usage Scenarios", () => {
        it("should work for database primary keys", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const ids = Array.from({ length: 50 }, () => generateUuid());

            // All should be unique
            expect(new Set(ids).size).toBe(50);

            // All should be valid strings
            for (const id of ids) {
                expect(id).toBeTypeOf("string");
                expect(id.length).toBeGreaterThan(0);
            }
        });

        it("should work for temporary file naming", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const id = generateUuid();
            const filename = `temp-${id}.tmp`;

            expect(filename.startsWith("temp-")).toBe(true);
            expect(filename.endsWith(".tmp")).toBe(true);
            expect(filename.length).toBeGreaterThan(10);
        });

        it("should work for component keys in React", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const items = Array.from({ length: 10 }, () => ({
                id: generateUuid(),
                name: "Item",
            }));

            const ids = items.map((item) => item.id);

            expect(new Set(ids).size).toBe(10); // All unique
        });
    });

    describe("environment validation", () => {
        it("should use fallback when crypto.randomUUID is undefined", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Fallback Behavior", "type");

            vi.stubGlobal("crypto", {
                getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
                randomUUID: undefined,
            });

            const result = generateUuid();

            expect(result).toMatch(FALLBACK_ID_REGEX);
        });

        it("should use fallback when crypto.randomUUID is not a function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Fallback Behavior", "type");

            (crypto as unknown as { randomUUID: unknown }).randomUUID =
                "not a function";

            const result = generateUuid();

            expect(result).toMatch(FALLBACK_ID_REGEX);
        });

        it("should fail closed when crypto is unavailable", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Fallback Behavior", "type");

            Reflect.deleteProperty(globalThis, "crypto");

            expect(() => generateUuid()).toThrow(
                SECURE_RANDOM_UNAVAILABLE_MESSAGE
            );

            globalThis.crypto = originalCrypto;
        });
    });
});
