/**
 * Test to cover the specific error cases in cacheKeys.ts lines 363 and 375
 */

import { describe, expect, it } from "vitest";
import { parseCacheKey } from "../../utils/cacheKeys";

describe("Cache Keys - Error Coverage", () => {
    it("should throw error for 2-part key with empty prefix (line 363)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys.error-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

        expect(() => {
            parseCacheKey(":identifier" as any);
        }).toThrow("Invalid cache key format: :identifier");
    });

    it("should handle 2-part key with empty identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys.error-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

        const result = parseCacheKey("prefix:" as any);
        expect(result).toEqual({
            prefix: "prefix",
            identifier: "",
        });
    });

    it("should throw error for 3-part key with empty prefix (line 375)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys.error-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

        expect(() => {
            parseCacheKey(":operation:identifier" as any);
        }).toThrow("Invalid cache key format: :operation:identifier");
    });

    it("should throw error for 3-part key with empty operation (line 375)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys.error-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

        expect(() => {
            parseCacheKey("prefix::identifier" as any);
        }).toThrow("Invalid cache key format: prefix::identifier");
    });

    it("should throw error for 3-part key with empty identifier (line 375)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys.error-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

        expect(() => {
            parseCacheKey("prefix:operation:" as any);
        }).toThrow("Invalid cache key format: prefix:operation:");
    });

    it("should throw error for all empty parts in 2-part key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys.error-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

        expect(() => {
            parseCacheKey(":" as any);
        }).toThrow("Invalid cache key format: :");
    });

    it("should throw error for all empty parts in 3-part key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys.error-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

        expect(() => {
            parseCacheKey("::" as any);
        }).toThrow("Invalid cache key format: ::");
    });
});
