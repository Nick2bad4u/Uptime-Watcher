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
import { renderHook, act } from "@testing-library/react";

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
    inAppAlertsEnabled: fc.option(fc.boolean()),
    inAppAlertsSoundEnabled: fc.option(fc.boolean()),
    systemNotificationsEnabled: fc.option(fc.boolean()),
    systemNotificationsSoundEnabled: fc.option(fc.boolean()),
});

describe("Stores Comprehensive Fuzzing", () => {
    describe("Settings Store", () => {
        test("should have store available", () => {
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
                    useSettingsStore());

                try {
                    expect(typeof result.current.updateSettings).toBe(
                        "function"
                    );

                    const cleanSettings = Object.fromEntries(
                        Object.entries(partialSettings).map(([key, value]) => [
                            key,
                            value === null ? undefined : value,
                        ])
                    ) as Partial<AppSettings>;

                    expect(() => {
                        act(() => {
                            result.current.updateSettings(cleanSettings);
                        });
                    }).not.toThrowError();
                } finally {
                    unmount();
                }
            }
        );
    });

    describe("Error Store", () => {
        test("should have error store available", () => {
            const { result, unmount } = renderHook(() => useErrorStore());
            try {
                expect(result.current).toBeDefined();
            } finally {
                unmount();
            }
        });

        fcTest.prop([fc.string()])("should handle error setting", (
            errorMessage
        ) => {
            const { result, unmount } = renderHook(() => useErrorStore());
            try {
                expect(typeof result.current.setError).toBe("function");
                expect(() => {
                    act(() => {
                        result.current.setError(errorMessage);
                    });
                }).not.toThrowError();
            } finally {
                unmount();
            }
        });

        test("should handle error clearing", () => {
            const { result, unmount } = renderHook(() => useErrorStore());
            try {
                expect(typeof result.current.clearError).toBe("function");
                expect(() => {
                    act(() => {
                        result.current.clearError();
                    });
                }).not.toThrowError();
            } finally {
                unmount();
            }
        });
    });

    describe("Updates Store", () => {
        test("should have updates store available", () => {
            const { result, unmount } = renderHook(() => useUpdatesStore());
            try {
                expect(result.current).toBeDefined();
            } finally {
                unmount();
            }
        });

        test("should handle update status and progress", () => {
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
        test("should have monitor types store available", () => {
            const { result, unmount } = renderHook(() =>
                useMonitorTypesStore());
            try {
                expect(result.current).toBeDefined();
                expect(Array.isArray(result.current.monitorTypes)).toBeTruthy();
            } finally {
                unmount();
            }
        });

        test("should handle error states", () => {
            const { result, unmount } = renderHook(() =>
                useMonitorTypesStore());
            try {
                expect(typeof result.current.setError).toBe("function");
                expect(typeof result.current.clearError).toBe("function");

                act(() => {
                    result.current.setError("test-error");
                    result.current.clearError();
                });
            } finally {
                unmount();
            }
        });
    });
});
