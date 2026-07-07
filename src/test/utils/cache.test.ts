/**
 * Tests for the shared application caches.
 *
 * @remarks
 * The generic cache implementation is intentionally private; production code
 * consumes these preconfigured cache instances.
 */

import { CACHE_CONFIG } from "@shared/constants/cacheConfig";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppCaches } from "../../utils/cache";

const appCaches = [
    AppCaches.general,
    AppCaches.monitorTypes,
    AppCaches.uiHelpers,
] as const;

function cleanupAppCaches(): void {
    for (const cache of appCaches) {
        cache.cleanup();
    }
}

function clearAppCaches(): void {
    for (const cache of appCaches) {
        cache.clear();
    }
}

describe("AppCaches", () => {
    let mockNow: ReturnType<typeof vi.fn<() => number>>;

    beforeEach(() => {
        mockNow = vi.fn(() => 1000);
        vi.spyOn(Date, "now").mockImplementation(mockNow);
        clearAppCaches();
    });

    afterEach(() => {
        clearAppCaches();
        vi.restoreAllMocks();
    });

    it("exposes the cache operations used by production helpers", () => {
        for (const cache of appCaches) {
            expect(cache.size).toBe(0);
            expect(cache.get("missing")).toBeUndefined();
            expect(cache.has("missing")).toBe(false);
            expect(cache.delete("missing")).toBe(false);
            expect(cache.clear).toEqual(expect.any(Function));
            expect(cache.cleanup).toEqual(expect.any(Function));
            expect(cache.set).toEqual(expect.any(Function));
        }
    });

    it("stores, reads, overwrites, and deletes values", () => {
        AppCaches.general.set("theme", "dark");
        expect(AppCaches.general.get("theme")).toBe("dark");
        expect(AppCaches.general.has("theme")).toBe(true);
        expect(AppCaches.general.size).toBe(1);

        AppCaches.general.set("theme", "light");
        expect(AppCaches.general.get("theme")).toBe("light");
        expect(AppCaches.general.size).toBe(1);

        expect(AppCaches.general.delete("theme")).toBe(true);
        expect(AppCaches.general.get("theme")).toBeUndefined();
        expect(AppCaches.general.has("theme")).toBe(false);
        expect(AppCaches.general.size).toBe(0);
    });

    it("uses the configured default TTL for shared caches", () => {
        AppCaches.general.set("temporary", "value");
        AppCaches.monitorTypes.set("monitor-types", "value");
        AppCaches.uiHelpers.set("helper", "value");

        mockNow.mockReturnValue(1000 + CACHE_CONFIG.TEMPORARY.ttl + 1);
        expect(AppCaches.general.get("temporary")).toBeUndefined();

        mockNow.mockReturnValue(1000 + CACHE_CONFIG.MONITORS.ttl + 1);
        expect(AppCaches.monitorTypes.get("monitor-types")).toBeUndefined();

        mockNow.mockReturnValue(1000 + CACHE_CONFIG.VALIDATION.ttl + 1);
        expect(AppCaches.uiHelpers.get("helper")).toBeUndefined();
    });

    it("honors per-entry TTL overrides", () => {
        AppCaches.general.set("short", "value", 500);
        AppCaches.general.set("default", "value");

        mockNow.mockReturnValue(1501);

        expect(AppCaches.general.get("short")).toBeUndefined();
        expect(AppCaches.general.get("default")).toBe("value");
    });

    it("cleanup removes expired entries without removing live entries", () => {
        AppCaches.general.set("expired", "value", 500);
        AppCaches.general.set("live", "value", 2000);

        mockNow.mockReturnValue(1600);
        cleanupAppCaches();

        expect(AppCaches.general.get("expired")).toBeUndefined();
        expect(AppCaches.general.get("live")).toBe("value");
        expect(AppCaches.general.size).toBe(1);
    });

    it("clear removes every shared app cache entry", () => {
        AppCaches.general.set("general", "value");
        AppCaches.monitorTypes.set("monitorTypes", "value");
        AppCaches.uiHelpers.set("uiHelpers", "value");

        expect(AppCaches.general.size).toBe(1);
        expect(AppCaches.monitorTypes.size).toBe(1);
        expect(AppCaches.uiHelpers.size).toBe(1);

        clearAppCaches();

        for (const cache of appCaches) {
            expect(cache.size).toBe(0);
        }
    });

    it("evicts least recently used entries at the configured maximum size", () => {
        const { maxSize } = CACHE_CONFIG.VALIDATION;

        for (let index = 0; index < maxSize; index += 1) {
            mockNow.mockReturnValue(1000 + index);
            AppCaches.uiHelpers.set(`key-${index}`, `value-${index}`);
        }

        mockNow.mockReturnValue(2000);
        expect(AppCaches.uiHelpers.get("key-0")).toBe("value-0");

        mockNow.mockReturnValue(2001);
        AppCaches.uiHelpers.set("overflow", "value");

        expect(AppCaches.uiHelpers.size).toBe(maxSize);
        expect(AppCaches.uiHelpers.get("key-0")).toBe("value-0");
        expect(AppCaches.uiHelpers.get("key-1")).toBeUndefined();
        expect(AppCaches.uiHelpers.get("overflow")).toBe("value");
    });
});
