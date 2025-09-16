/**
 * Comprehensive fast-check fuzzing tests for Zustand stores.
 *
 * This test suite provides basic fuzzing coverage for available store methods
 * and properties.
 *
 * @packageDocumentation
 */

import { describe, expect, test } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";
import { renderHook } from "@testing-library/react";

// Import available stores for testing
import { useSettingsStore } from "../../stores/settings/useSettingsStore";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useUpdatesStore } from "../../stores/updates/useUpdatesStore";
import { useMonitorTypesStore } from "../../stores/monitor/useMonitorTypesStore";

// Types
import type { AppSettings } from "../../stores/types";

// Custom arbitraries for store testing
const arbitraryTheme = fc.constantFrom("light", "dark", "system");

const arbitraryPartialSettings = fc.record({
    theme: fc.option(arbitraryTheme),
    autoStart: fc.option(fc.boolean()),
    historyLimit: fc.option(fc.integer({ min: 100, max: 10_000 })),
    minimizeToTray: fc.option(fc.boolean()),
    notifications: fc.option(fc.boolean()),
    soundAlerts: fc.option(fc.boolean()),
});

describe("Stores Comprehensive Fuzzing", () => {
    describe("Settings Store", () => {
        test("should have store available", () => {
            const { result } = renderHook(() => useSettingsStore());
            expect(result.current).toBeDefined();
            expect(typeof result.current.settings).toBe("object");
        });

        fcTest.prop([arbitraryPartialSettings])(
            "should handle settings updates",
            (partialSettings) => {
                const { result } = renderHook(() => useSettingsStore());

                expect(typeof result.current.updateSettings).toBe("function");

                expect(() => {
                    const cleanSettings = Object.fromEntries(
                        Object.entries(partialSettings).map(([key, value]) => [
                            key,
                            value === null ? undefined : value,
                        ])
                    ) as Partial<AppSettings>;

                    result.current.updateSettings(cleanSettings);
                }).not.toThrow();
            }
        );
    });

    describe("Error Store", () => {
        test("should have error store available", () => {
            const { result } = renderHook(() => useErrorStore());
            expect(result.current).toBeDefined();
        });

        fcTest.prop([fc.string()])(
            "should handle error setting",
            (errorMessage) => {
                const { result } = renderHook(() => useErrorStore());
                expect(typeof result.current.setError).toBe("function");
                expect(() =>
                    result.current.setError(errorMessage)
                ).not.toThrow();
            }
        );

        test("should handle error clearing", () => {
            const { result } = renderHook(() => useErrorStore());
            expect(typeof result.current.clearError).toBe("function");
            expect(() => result.current.clearError()).not.toThrow();
        });
    });

    describe("Updates Store", () => {
        test("should have updates store available", () => {
            const { result } = renderHook(() => useUpdatesStore());
            expect(result.current).toBeDefined();
        });

        test("should handle update status and progress", () => {
            const { result } = renderHook(() => useUpdatesStore());
            expect(typeof result.current.applyUpdateStatus).toBe("function");
            expect(typeof result.current.setUpdateProgress).toBe("function");
            expect(typeof result.current.updateStatus).toBe("string");
            expect(typeof result.current.updateProgress).toBe("number");
        });
    });

    describe("Monitor Types Store", () => {
        test("should have monitor types store available", () => {
            const { result } = renderHook(() => useMonitorTypesStore());
            expect(result.current).toBeDefined();
            expect(Array.isArray(result.current.monitorTypes)).toBeTruthy();
        });

        test("should handle error states", () => {
            const { result } = renderHook(() => useMonitorTypesStore());
            expect(typeof result.current.setError).toBe("function");
            expect(typeof result.current.clearError).toBe("function");
        });
    });
});
