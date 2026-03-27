/**
 * @file Function coverage tests for shared/utils/cacheKeys.ts
 *
 *   Tests all exported functions to achieve 100% function coverage. Currently
 *   shows 50% function coverage - targeting isStandardizedCacheKey and
 *   parseCacheKey functions.
 */

import { describe, expect, it } from "vitest";
import { isStandardizedCacheKey, parseCacheKey } from "../../utils/cacheKeys";

describe("Cache Keys Function Coverage", () => {
    describe(isStandardizedCacheKey, () => {
        it("should return true for valid 2-part cache keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            expect(isStandardizedCacheKey("site:site-123")).toBeTruthy();
            expect(isStandardizedCacheKey("monitor:monitor-456")).toBeTruthy();
        });

        it("should return true for valid 3-part cache keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            expect(
                isStandardizedCacheKey("site:loading:site-123")
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey("monitor:checking:monitor-456")
            ).toBeTruthy();
        });

        it("should return false for keys with too few parts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey("site")).toBeFalsy();
        });

        it("should return false for keys with too many parts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                isStandardizedCacheKey("site:loading:site-123:extra")
            ).toBeFalsy();
        });

        it("should return false for keys with empty prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey(":site-123")).toBeFalsy();
        });

        it("should return false for 3-part keys with empty operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey("site::site-123")).toBeFalsy();
        });

        it("should return false for invalid prefixes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey("invalid:site-123")).toBeFalsy();
        });
    });

    describe(parseCacheKey, () => {
        it("should parse valid 2-part cache keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            const result = parseCacheKey("site:site-123" as any);
            expect(result).toEqual({
                prefix: "site",
                identifier: "site-123",
            });
        });

        it("should parse valid 3-part cache keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            const result = parseCacheKey("site:loading:site-123" as any);
            expect(result).toEqual({
                prefix: "site",
                operation: "loading",
                identifier: "site-123",
            });
        });

        it("should throw error for empty identifier in 2-part keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(() => parseCacheKey("site:" as any)).toThrow(
                "Invalid cache key format: site:"
            );
        });

        it("should throw error for empty prefix in 2-part keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => parseCacheKey(":site-123" as any)).toThrow(
                "Invalid cache key format:"
            );
        });

        it("should throw error for missing parts in 3-part keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => parseCacheKey(":loading:site-123" as any)).toThrow(
                "Invalid cache key format:"
            );
            expect(() => parseCacheKey("site::site-123" as any)).toThrow(
                "Invalid cache key format:"
            );
            expect(() => parseCacheKey("site:loading:" as any)).toThrow(
                "Invalid cache key format:"
            );
        });
    });

    describe("Integration tests", () => {
        it("should validate and parse keys consistently", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const key = "site:loading:site-123";

            // Check validation first
            expect(isStandardizedCacheKey(key)).toBeTruthy();

            // Then parse successfully
            const parsed = parseCacheKey(key as any);
            expect(parsed.prefix).toBe("site");
            expect(parsed.operation).toBe("loading");
            expect(parsed.identifier).toBe("site-123");
        });
    });
});
