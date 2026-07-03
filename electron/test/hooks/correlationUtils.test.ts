/**
 * Tests for correlation utilities including correlation ID generation.
 */

import { generateCorrelationId } from "@shared/utils/correlation";
import { describe, expect, it } from "vitest";

describe("correlationUtils", () => {
    describe(generateCorrelationId, () => {
        it("should generate a unique correlation ID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: correlationUtils", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const id1 = generateCorrelationId();
            const id2 = generateCorrelationId();

            expect(id1).toBeDefined();
            expect(id2).toBeDefined();
            expect(id1).not.toBe(id2);
        });

        it("should generate a correlation ID with expected format", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: correlationUtils", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const id = generateCorrelationId();

            // Should be a 16-character hex string (8 bytes * 2 hex chars per byte)
            expect(id).toMatch(/^[\da-f]{16}$/v);
        });

        it("should generate different IDs on multiple calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: correlationUtils", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const ids = new Set();
            for (let i = 0; i < 100; i++) {
                ids.add(generateCorrelationId());
            }

            // All 100 IDs should be unique
            expect(ids.size).toBe(100);
        });
    });
});
