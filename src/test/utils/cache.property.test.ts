/**
 * Property-based tests for the shared application cache instances.
 */

import { fc, test as fcTest } from "@fast-check/vitest";
import { beforeEach, describe, expect, vi } from "vitest";

import { AppCaches } from "../../utils/cache";

const appCaches = [
    AppCaches.general,
    AppCaches.monitorTypes,
    AppCaches.uiHelpers,
] as const;

function clearAppCaches(): void {
    for (const cache of appCaches) {
        cache.clear();
    }
}

describe("AppCaches property-based behavior", () => {
    let mockTime = 1_000_000;

    beforeEach(() => {
        mockTime = 1_000_000;
        vi.spyOn(Date, "now").mockImplementation(() => mockTime);
        clearAppCaches();
    });

    fcTest.prop([
        fc.array(fc.tuple(fc.string(), fc.string()), {
            maxLength: 50,
            minLength: 0,
        }),
    ])("stores the latest value for each key", (entries) => {
        const expectedValues = new Map<string, string>();

        for (const [key, value] of entries) {
            AppCaches.general.set(key, value);
            expectedValues.set(key, value);
        }

        expect(AppCaches.general.size).toBe(expectedValues.size);

        for (const [key, value] of expectedValues) {
            expect(AppCaches.general.get(key)).toBe(value);
            expect(AppCaches.general.has(key)).toBe(true);
        }
    });

    fcTest.prop([
        fc.array(fc.tuple(fc.string(), fc.string()), {
            maxLength: 30,
            minLength: 0,
        }),
    ])("clear removes all entries from every app cache", (entries) => {
        for (const [key, value] of entries) {
            AppCaches.general.set(key, value);
            AppCaches.monitorTypes.set(key, value);
            AppCaches.uiHelpers.set(key, value);
        }

        clearAppCaches();

        for (const cache of appCaches) {
            expect(cache.size).toBe(0);
            for (const [key] of entries) {
                expect(cache.get(key)).toBeUndefined();
            }
        }
    });

    fcTest.prop([
        fc.string(),
        fc.string(),
        fc.integer({ max: 10_000, min: 1 }),
    ])("expires values after per-entry TTL", (key, value, ttl) => {
        AppCaches.general.set(key, value, ttl);
        expect(AppCaches.general.get(key)).toBe(value);

        mockTime += ttl + 1;

        expect(AppCaches.general.get(key)).toBeUndefined();
        expect(AppCaches.general.has(key)).toBe(false);
    });

    fcTest.prop([
        fc.array(
            fc.tuple(
                fc.string(),
                fc.string(),
                fc.integer({ max: 2000, min: 1 })
            ),
            {
                maxLength: 15,
                minLength: 1,
            }
        ),
    ])("cleanup removes expired entries", (entries) => {
        const uniqueEntries = new Map<string, readonly [string, number]>();

        for (const [
            key,
            value,
            ttl,
        ] of entries) {
            AppCaches.general.set(key, value, ttl);
            uniqueEntries.set(key, [value, ttl]);
        }

        mockTime +=
            Math.max(...[...uniqueEntries.values()].map(([, ttl]) => ttl)) + 1;
        AppCaches.general.cleanup();

        expect(AppCaches.general.size).toBe(0);
        for (const key of uniqueEntries.keys()) {
            expect(AppCaches.general.get(key)).toBeUndefined();
        }
    });

    fcTest.prop([
        fc.array(fc.tuple(fc.string(), fc.string()), {
            maxLength: 250,
            minLength: 0,
        }),
    ])("delete removes only the requested keys", (entries) => {
        const uniqueEntries = new Map(entries);

        for (const [key, value] of uniqueEntries) {
            AppCaches.uiHelpers.set(key, value);
        }

        const keysToDelete = [...uniqueEntries.keys()].filter(
            (_key, index) => index % 2 === 0
        );

        for (const key of keysToDelete) {
            expect(AppCaches.uiHelpers.delete(key)).toBe(true);
        }

        for (const [key, value] of uniqueEntries) {
            if (keysToDelete.includes(key)) {
                expect(AppCaches.uiHelpers.get(key)).toBeUndefined();
            } else {
                expect(AppCaches.uiHelpers.get(key)).toBe(value);
            }
        }
    });
});
