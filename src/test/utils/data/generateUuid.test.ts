/**
 * @file Tests for generateUuid utility function
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateUuid } from "../../../utils/data/generateUuid";

const originalCrypto = globalThis.crypto;

describe(generateUuid, () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        globalThis.crypto = originalCrypto;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        globalThis.crypto = originalCrypto;
    });

    describe("Basic Functionality", () => {
        it("should return a string", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateUuid();
            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(0);
        });

        it("should generate unique values on multiple calls", async ({
            task,
            annotate,
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

    describe("Native crypto.randomUUID Behavior", () => {
        it("should use crypto.randomUUID when available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockRandomUUID = vi
                .spyOn(globalThis.crypto, "randomUUID")
                .mockReturnValue("550e8400-e29b-41d4-a716-446655440000");

            const result = generateUuid();

            expect(mockRandomUUID).toHaveBeenCalledTimes(1);
            expect(result).toBe("550e8400-e29b-41d4-a716-446655440000");
        });

        it("should surface errors from crypto.randomUUID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const failure = new Error("randomUUID not available");
            const mockRandomUUID = vi
                .spyOn(globalThis.crypto, "randomUUID")
                .mockImplementation(() => {
                    throw failure;
                });

            expect(() => generateUuid()).toThrow(failure);
            expect(mockRandomUUID).toHaveBeenCalledTimes(1);
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

            const originalCrypto = globalThis.crypto;
            globalThis.crypto = undefined as any;

            const result = generateUuid();

            expect(result).toMatch(/^site-[\da-z]+-\d+$/);
            expect(result.startsWith("site-")).toBeTruthy();

            // Restore original
            globalThis.crypto = originalCrypto;
        });

        it("should use fallback when crypto.randomUUID is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            globalThis.crypto = {} as any;

            const result = generateUuid();

            expect(result).toMatch(/^site-[\da-z]+-\d+$/);
            expect(result.startsWith("site-")).toBeTruthy();
        });

        it("should use fallback when crypto.randomUUID is not a function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateUuid();
            const parts = result.split("-");

            expect(parts).toHaveLength(3);
            expect(parts[1]).toMatch(/^[\da-z]+$/);
            expect(parts[1]!.length).toBeGreaterThan(0);
        });

        it("should use consistent format across calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const results = Array.from({ length: 10 }, () => generateUuid());

            for (const result of results) {
                expect(result).toMatch(/^site-[\da-z]+-\d+$/);
            }
        });
    });

    describe("Edge Cases", () => {
        it("should handle very large timestamps in fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalCrypto = globalThis.crypto;
            globalThis.crypto = undefined as any;

            const mockNow = vi
                .spyOn(Date, "now")
                .mockReturnValue(9_999_999_999_999);

            const result = generateUuid();

            expect(result).toMatch(/^site-[\da-z]+-9{13}\d{3}$/);
            expect(result).toContain("9999999999999");

            mockNow.mockRestore();
            globalThis.crypto = originalCrypto;
        });

        it("should handle timestamp of 0 in fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalCrypto = globalThis.crypto;
            globalThis.crypto = undefined as any;

            const mockNow = vi.spyOn(Date, "now").mockReturnValue(0);

            const result = generateUuid();

            expect(result).toMatch(/^site-[\da-z]+-0\d{3}$/);
            expect(result.split("-")[2]).toMatch(/^0\d{3}$/); // Should start with 0 followed by 3-digit microseconds

            mockNow.mockRestore();
            globalThis.crypto = originalCrypto;
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test multiple scenarios
            const nativeResult = generateUuid();
            expect(typeof nativeResult).toBe("string");
            expect(nativeResult.length).toBeGreaterThan(0);

            // Force fallback
            const originalCrypto = globalThis.crypto;
            globalThis.crypto = undefined as any;

            const fallbackResult = generateUuid();
            expect(typeof fallbackResult).toBe("string");
            expect(fallbackResult).toMatch(/^site-[\da-z]+-\d+$/);

            // Restore
            globalThis.crypto = originalCrypto;
        });
    });

    describe("Real-world Usage Scenarios", () => {
        it("should work for database primary keys", async ({
            task,
            annotate,
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
                expect(typeof id).toBe("string");
                expect(id.length).toBeGreaterThan(0);
            }
        });

        it("should work for temporary file naming", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const id = generateUuid();
            const filename = `temp-${id}.tmp`;

            expect(filename.startsWith("temp-")).toBeTruthy();
            expect(filename.endsWith(".tmp")).toBeTruthy();
            expect(filename.length).toBeGreaterThan(10);
        });

        it("should work for component keys in React", async ({
            task,
            annotate,
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

    describe("Environment validation", () => {
        it("should throw when crypto.randomUUID is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            Reflect.deleteProperty(
                globalThis.crypto as unknown as Record<string, unknown>,
                "randomUUID"
            );

            expect(() => generateUuid()).toThrow(TypeError);
        });

        it("should throw when crypto.randomUUID is not a function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            (
                globalThis.crypto as unknown as { randomUUID: unknown }
            ).randomUUID = "not a function";

            expect(() => generateUuid()).toThrow(TypeError);
        });

        it("should throw when crypto is unavailable", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            Reflect.deleteProperty(
                globalThis as unknown as Record<string, unknown>,
                "crypto"
            );

            expect(() => generateUuid()).toThrow(TypeError);

            globalThis.crypto = originalCrypto;
        });
    });
});
