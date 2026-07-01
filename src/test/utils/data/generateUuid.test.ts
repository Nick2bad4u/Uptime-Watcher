/**
 * @file Tests for generateUuid utility function
 */

import { webcrypto } from "node:crypto";
import { stringSplit } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateUuid } from "../../../utils/data/generateUuid";

const originalCrypto = crypto;

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
                    randomUUID: mockRandomUUID,
                };

                const result = generateUuid();

                expect(result).toMatch(/^site-[\da-z]+-\d+$/v);
                expect(mockRandomUUID).toHaveBeenCalledTimes(1);
            } finally {
                globalThis.crypto = original;
            }
        });
    });

    describe("fallback Behavior", () => {
        it("should use fallback when crypto is undefined", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalCrypto = crypto;
            globalThis.crypto = undefined as any;

            const result = generateUuid();

            expect(result).toMatch(/^site-[\da-z]+-\d+$/v);
            expect(result.startsWith("site-")).toBe(true);

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

            expect(result).toMatch(/^site-[\da-z]+-\d+$/v);
            expect(result.startsWith("site-")).toBe(true);
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
            const parts = stringSplit(result, "-");

            expect(parts).toHaveLength(3);
            expect(parts[1]).toMatch(/^[\da-z]+$/v);
            expect(parts[1]!.length).toBeGreaterThan(0);
        });

        it("should use consistent format across calls", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Force fallback by removing crypto
            const tempCrypto = crypto;
            globalThis.crypto = undefined as any;

            const results = Array.from({ length: 10 }, () => generateUuid());

            for (const result of results) {
                expect(result).toMatch(/^site-[\da-z]+-\d+$/v);
            }

            // Restore
            globalThis.crypto = tempCrypto;
        });
    });

    describe("edge Cases", () => {
        it("should handle very large timestamps in fallback", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalCrypto = crypto;
            globalThis.crypto = undefined as any;

            const mockNow = vi
                .spyOn(Date, "now")
                .mockReturnValue(9_999_999_999_999);

            const result = generateUuid();

            expect(result).toMatch(/^site-[\da-z]+-9{13}\d{3}$/v);
            expect(result).toContain("9999999999999");

            mockNow.mockRestore();
            globalThis.crypto = originalCrypto;
        });

        it("should handle timestamp of 0 in fallback", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalCrypto = crypto;
            globalThis.crypto = undefined as any;

            const mockNow = vi.spyOn(Date, "now").mockReturnValue(0);

            const result = generateUuid();

            expect(result).toMatch(/^site-[\da-z]+-0\d{3}$/v);
            expect(result.split("-", 3)[2]).toMatch(/^0\d{3}$/v); // Should start with 0 followed by 3-digit microseconds

            mockNow.mockRestore();
            globalThis.crypto = originalCrypto;
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

            const fallbackResult = generateUuid();

            expect(fallbackResult).toBeTypeOf("string");
            expect(fallbackResult).toMatch(/^site-[\da-z]+-\d+$/v);

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

            expect(result).toMatch(/^site-[\da-z]+-\d+$/v);
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

            expect(result).toMatch(/^site-[\da-z]+-\d+$/v);
        });

        it("should use fallback when crypto is unavailable", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Fallback Behavior", "type");

            Reflect.deleteProperty(globalThis, "crypto");

            const result = generateUuid();

            expect(result).toMatch(/^site-[\da-z]+-\d+$/v);

            globalThis.crypto = originalCrypto;
        });
    });
});
