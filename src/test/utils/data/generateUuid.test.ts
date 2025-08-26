/**
 * @file Tests for generateUuid utility function
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateUuid } from "../../../utils/data/generateUuid";

describe("generateUuid", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
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
                .fn()
                .mockReturnValue("550e8400-e29b-41d4-a716-446655440000");

            // Mock crypto object
            globalThis.crypto = {
                randomUUID: mockRandomUUID,
            } as any;

            const result = generateUuid();

            expect(mockRandomUUID).toHaveBeenCalledTimes(1);
            expect(result).toBe("550e8400-e29b-41d4-a716-446655440000");
        });

        it("should handle crypto.randomUUID throwing an error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockRandomUUID = vi.fn().mockImplementation(() => {
                throw new Error("randomUUID not available");
            });

            globalThis.crypto = {
                randomUUID: mockRandomUUID,
            } as any;

            const result = generateUuid();

            expect(mockRandomUUID).toHaveBeenCalledTimes(1);
            expect(result).toMatch(/^site-[\da-z]+-\d+$/);
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
            expect(result.startsWith("site-")).toBe(true);

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
            expect(result.startsWith("site-")).toBe(true);
        });

        it("should use fallback when crypto.randomUUID is not a function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            globalThis.crypto = {
                randomUUID: "not a function",
            } as any;

            const result = generateUuid();

            expect(result).toMatch(/^site-[\da-z]+-\d+$/);
            expect(result.startsWith("site-")).toBe(true);
        });

        it("should generate unique fallback UUIDs on multiple calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalCrypto = globalThis.crypto;
            globalThis.crypto = undefined as any;

            const results = new Set();
            const numCalls = 20;

            for (let i = 0; i < numCalls; i++) {
                results.add(generateUuid());
            }

            // All should be unique
            expect(results.size).toBe(numCalls);

            // Restore original
            globalThis.crypto = originalCrypto;
        });
    });

    describe("Fallback Format Validation", () => {
        beforeEach(() => {
            // Force fallback behavior
            globalThis.crypto = undefined as any;
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should always start with "site-"', async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateUuid();
            expect(result.startsWith("site-")).toBe(true);
        });

        it("should contain timestamp", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const beforeTimestamp = Date.now();
            const result = generateUuid();
            const afterTimestamp = Date.now();

            const parts = result.split("-");
            expect(parts).toHaveLength(3);
            expect(parts[0]).toBe("site");

            const extractedTimestamp = Number.parseInt(parts[2]!, 10);
            expect(extractedTimestamp).toBeGreaterThanOrEqual(beforeTimestamp);
            expect(extractedTimestamp).toBeLessThanOrEqual(afterTimestamp);
        });

        it("should have random part between prefix and timestamp", async ({
            task,
            annotate,
        }) => {
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

            expect(result).toMatch(/^site-[\da-z]+-9{13}$/);
            expect(result.includes("9999999999999")).toBe(true);

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

            expect(result).toMatch(/^site-[\da-z]+-0$/);
            expect(result.endsWith("-0")).toBe(true);

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

            expect(filename.startsWith("temp-")).toBe(true);
            expect(filename.endsWith(".tmp")).toBe(true);
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
});
