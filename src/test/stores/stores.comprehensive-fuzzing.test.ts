/**
 * Comprehensive fast-check fuzzing tests for Zustand stores.
 *
 * This test suite provides basic fuzzing coverage for available store methods
 * and properties.
 *
 * @packageDocumentation
 */

import type { UnknownRecord } from "type-fest";

import { fc, test as fcTest } from "@fast-check/vitest";
import { act, renderHook } from "@testing-library/react";
import { objectEntries, objectFromEntries, safeCastTo   } from "ts-extras";
import { describe, expect, it, test } from "vitest";

// Types
import type { AppSettings } from "../../stores/types";

import { useErrorStore } from "../../stores/error/useErrorStore";
import { useMonitorTypesStore } from "../../stores/monitor/useMonitorTypesStore";
// Import available stores for testing
import { useSettingsStore } from "../../stores/settings/useSettingsStore";
import { useUpdatesStore } from "../../stores/updates/useUpdatesStore";

// Custom arbitraries for store testing
const arbitraryTheme = fc.constantFrom("light", "dark", "system");

const arbitraryPartialSettings = fc.record({
    theme: fc.option(arbitraryTheme),
    autoStart: fc.option(fc.boolean()),
    historyLimit: fc.option(fc.integer({ min: 100, max: 10_000 })),
    minimizeToTray: fc.option(fc.boolean()),
    inAppAlertsEnabled: fc.option(fc.boolean()),
    inAppAlertsSoundEnabled: fc.option(fc.boolean()),
    systemNotificationsEnabled: fc.option(fc.boolean()),
    systemNotificationsSoundEnabled: fc.option(fc.boolean()),
});

describe("Stores Comprehensive Fuzzing", () => {
    describe("Settings Store", () => {
        it("should have store available", () => {
            const { result, unmount } = renderHook(() => useSettingsStore());
            try {
                expect(result.current).toBeDefined();
                expect(typeof result.current.settings).toBe("object");
            } finally {
                unmount();
            }
        });

        fcTest.prop([arbitraryPartialSettings])(
            "should handle settings updates",
            (partialSettings) => {
                const { result, unmount } = renderHook(() =>
                    useSettingsStore()
                );

                try {
                    expect(typeof result.current.updateSettings).toBe(
                        "function"
                    );

                    const cleanSettings = objectFromEntries(
                        objectEntries(partialSettings).map(([key, value]) => [
                            key,
                            value === null ? undefined : value,
                        ])
                    ) as Partial<AppSettings>;

                    expect(() => {
                        act(() => {
                            result.current.updateSettings(cleanSettings);
                        });
                    }).not.toThrow();
                } finally {
                    unmount();
                }
            }
        );
    });

    describe("Error Store", () => {
        it("should have error store available", () => {
            const { result, unmount } = renderHook(() => useErrorStore());
            try {
                expect(result.current).toBeDefined();
            } finally {
                unmount();
            }
        });

        fcTest.prop([fc.string()])(
            "should handle error setting",
            (errorMessage) => {
                const { result, unmount } = renderHook(() => useErrorStore());
                try {
                    expect(typeof result.current.setError).toBe("function");
                    expect(() => {
                        act(() => {
                            result.current.setError(errorMessage);
                        });
                    }).not.toThrow();
                } finally {
                    unmount();
                }
            }
        );

        it("should handle error clearing", () => {
            const { result, unmount } = renderHook(() => useErrorStore());
            try {
                expect(typeof result.current.clearError).toBe("function");
                expect(() => {
                    act(() => {
                        result.current.clearError();
                    });
                }).not.toThrow();
            } finally {
                unmount();
            }
        });
    });

    describe("Updates Store", () => {
        it("should have updates store available", () => {
            const { result, unmount } = renderHook(() => useUpdatesStore());
            try {
                expect(result.current).toBeDefined();
            } finally {
                unmount();
            }
        });

        it("should handle update status and progress", () => {
            const { result, unmount } = renderHook(() => useUpdatesStore());
            try {
                expect(typeof result.current.applyUpdateStatus).toBe(
                    "function"
                );
                expect(typeof result.current.setUpdateProgress).toBe(
                    "function"
                );
                expect(typeof result.current.updateStatus).toBe("string");
                expect(typeof result.current.updateProgress).toBe("number");

                act(() => {
                    result.current.applyUpdateStatus("checking");
                    result.current.setUpdateProgress(50);
                });
            } finally {
                unmount();
            }
        });
    });

    describe("Monitor Types Store", () => {
        it("should have monitor types store available", () => {
            const { result, unmount } = renderHook(() =>
                useMonitorTypesStore()
            );
            try {
                expect(result.current).toBeDefined();
                expect(Array.isArray(result.current.monitorTypes)).toBeTruthy();
            } finally {
                unmount();
            }
        });

        it("should not expose store-owned error actions", () => {
            const { result, unmount } = renderHook(() =>
                useMonitorTypesStore()
            );
            try {
                expect(
                    (safeCastTo<UnknownRecord>(result.current))["setError"]
                ).toBeUndefined();
                expect(
                    (safeCastTo<UnknownRecord>(result.current))["clearError"]
                ).toBeUndefined();
                expect(
                    (safeCastTo<UnknownRecord>(result.current))["setLoading"]
                ).toBeUndefined();
            } finally {
                unmount();
            }
        });
    });
});
