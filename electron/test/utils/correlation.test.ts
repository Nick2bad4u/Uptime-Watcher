/**
 * Test suite for correlation
 *
 * @module Correlation
 *
 * @file Tests for correlation identifier generation.
 *
 * @since 2025-08-11
 *
 * @category Utilities
 *
 * @tags ["correlation", "utilities"]
 */

import { generateCorrelationId } from "@shared/utils/correlation";
import { describe, expect, it } from "vitest";

describe("Correlation Utility", () => {
    describe(generateCorrelationId, () => {
        it("should generate a correlation ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: correlation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const id = generateCorrelationId();

            expect(id).toBeDefined();
            expect(typeof id).toBe("string");
        });
        it("should generate IDs with correct length", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: correlation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const id = generateCorrelationId();

            // RandomBytes(8) => 8 bytes => 16 hex characters
            expect(id).toHaveLength(16);
        });
        it("should generate unique IDs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: correlation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const id1 = generateCorrelationId();
            const id2 = generateCorrelationId();

            expect(id1).not.toBe(id2);
        });
        it("should generate hex string", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: correlation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const id = generateCorrelationId();

            // Should only contain hex characters (0-9, a-f)
            expect(id).toMatch(/^[\da-f]+$/v);
        });
        it("should generate multiple unique IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: correlation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const ids = new Set();
            const count = 100;

            for (let i = 0; i < count; i++) {
                ids.add(generateCorrelationId());
            }

            // All IDs should be unique
            expect(ids.size).toBe(count);
        });
        it("should always return lowercase hex", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: correlation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            for (let i = 0; i < 10; i++) {
                const id = generateCorrelationId();
                expect(id).toBe(id.toLowerCase());
            }
        });
        it("should be cryptographically random", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: correlation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const ids = Array.from({ length: 1000 })
                .fill(0)
                .map(() => generateCorrelationId());

            // Check that we don't have obvious patterns
            // Test that no character appears in the same position too often
            for (let pos = 0; pos < 16; pos++) {
                const chars = ids.map((id) => id[pos]);
                const charCounts = chars.reduce<Record<string, number>>(
                    (acc, char) => {
                        if (char) {
                            acc[char] = (acc[char] || 0) + 1;
                        }
                        return acc;
                    },
                    {}
                );

                // No single character should appear more than 80% of the time
                // in any position (very conservative check for randomness)
                for (const count of Object.values(charCounts)) {
                    expect(count / ids.length).toBeLessThan(0.8);
                }
            }
        });
    });
});
