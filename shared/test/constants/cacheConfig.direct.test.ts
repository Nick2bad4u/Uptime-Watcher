/**
 * Direct function coverage tests for cache configuration.
 *
 * @file Simple tests to ensure 100% function coverage for CACHE_NAMES functions
 *   in shared/constants/cacheConfig.ts by directly calling each function.
 */

import { describe, expect, it } from "vitest";
import { CACHE_NAMES } from "../../../shared/constants/cacheConfig";

describe("cacheConfig - Direct Function Coverage", () => {
    it("should test monitors function without suffix", () => {
        const result = CACHE_NAMES.monitors();
        expect(result).toBe("monitors");
    });

    it("should test monitors function with suffix", () => {
        const result = CACHE_NAMES.monitors("test");
        expect(result).toBe("monitors-test");
    });

    it("should test settings function without suffix", () => {
        const result = CACHE_NAMES.settings();
        expect(result).toBe("settings");
    });

    it("should test settings function with suffix", () => {
        const result = CACHE_NAMES.settings("test");
        expect(result).toBe("settings-test");
    });

    it("should test sites function without suffix", () => {
        const result = CACHE_NAMES.sites();
        expect(result).toBe("sites");
    });

    it("should test sites function with suffix", () => {
        const result = CACHE_NAMES.sites("test");
        expect(result).toBe("sites-test");
    });

    it("should test temporary function", () => {
        const result = CACHE_NAMES.temporary("import");
        expect(result).toBe("temporary-import");
    });

    it("should test all conditional branches in all functions", () => {
        // Test all functions with empty string, undefined, and truthy values
        // to ensure branch coverage

        // monitors function branches
        expect(CACHE_NAMES.monitors()).toBe("monitors");
        expect(CACHE_NAMES.monitors(undefined)).toBe("monitors");
        expect(CACHE_NAMES.monitors("")).toBe("monitors-");
        expect(CACHE_NAMES.monitors("test")).toBe("monitors-test");

        // Settings function branches
        expect(CACHE_NAMES.settings()).toBe("settings");
        expect(CACHE_NAMES.settings(undefined)).toBe("settings");
        expect(CACHE_NAMES.settings("")).toBe("settings-");
        expect(CACHE_NAMES.settings("test")).toBe("settings-test");

        // Sites function branches
        expect(CACHE_NAMES.sites()).toBe("sites");
        expect(CACHE_NAMES.sites(undefined)).toBe("sites");
        expect(CACHE_NAMES.sites("")).toBe("sites-");
        expect(CACHE_NAMES.sites("test")).toBe("sites-test");

        // Temporary function (no conditional logic but ensure coverage)
        expect(CACHE_NAMES.temporary("")).toBe("temporary-");
        expect(CACHE_NAMES.temporary("test")).toBe("temporary-test");
        expect(CACHE_NAMES.temporary("import")).toBe("temporary-import");
        expect(CACHE_NAMES.temporary("export")).toBe("temporary-export");
    });
});
