/**
 * Test to cover the specific error cases in cacheKeys.ts lines 363 and 375
 */

import { describe, expect, it } from "vitest";
import { parseCacheKey } from "../../utils/cacheKeys";

describe("Cache Keys - Error Coverage", () => {
    it("should throw error for 2-part key with empty prefix (line 363)", () => {
        expect(() => {
            parseCacheKey(":identifier" as any);
        }).toThrow("Invalid cache key format: :identifier");
    });

    it("should handle 2-part key with empty identifier", () => {
        const result = parseCacheKey("prefix:" as any);
        expect(result).toEqual({
            prefix: "prefix",
            identifier: "",
        });
    });

    it("should throw error for 3-part key with empty prefix (line 375)", () => {
        expect(() => {
            parseCacheKey(":operation:identifier" as any);
        }).toThrow("Invalid cache key format: :operation:identifier");
    });

    it("should throw error for 3-part key with empty operation (line 375)", () => {
        expect(() => {
            parseCacheKey("prefix::identifier" as any);
        }).toThrow("Invalid cache key format: prefix::identifier");
    });

    it("should throw error for 3-part key with empty identifier (line 375)", () => {
        expect(() => {
            parseCacheKey("prefix:operation:" as any);
        }).toThrow("Invalid cache key format: prefix:operation:");
    });

    it("should throw error for all empty parts in 2-part key", () => {
        expect(() => {
            parseCacheKey(":" as any);
        }).toThrow("Invalid cache key format: :");
    });

    it("should throw error for all empty parts in 3-part key", () => {
        expect(() => {
            parseCacheKey("::" as any);
        }).toThrow("Invalid cache key format: ::");
    });
});
