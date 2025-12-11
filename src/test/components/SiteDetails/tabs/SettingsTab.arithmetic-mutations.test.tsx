/**
 * Arithmetic mutation tests for SettingsTab.tsx
 *
 * Targets arithmetic operations to kill arithmetic operator mutations. These
 * tests ensure proper calculations in interval display, retry calculations, and
 * duration formatting.
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import { SettingsTab } from "../../../../components/SiteDetails/tabs/SettingsTab";
import type { Monitor, Site } from "@shared/types";
import { calculateMaxDuration } from "../../../../utils/duration";
import {
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

let sampledSiteName: string;
let sampledSiteIdentifier: string;
let sampledMonitorUrl: string;
const monitorIdentifierRef = { value: "" };

// Mock all external dependencies
vi.mock("../../../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../../../theme/useTheme", () => ({
    useTheme: () => ({
        currentTheme: {
            name: "light",
            isDark: false,
            spacing: {
                xs: "4px",
                sm: "8px",
                md: "16px",
                lg: "24px",
                xl: "32px",
                "2xl": "40px",
                "3xl": "48px",
            },
            typography: {
                fontSize: {
                    xs: "12px",
                    sm: "14px",
                    base: "16px",
                    lg: "18px",
                    xl: "20px",
                    "2xl": "24px",
                    "3xl": "30px",
                    "4xl": "36px",
                },
                fontFamily: {
                    sans: [
                        "Inter",
                        "system-ui",
                        "sans-serif",
                    ],
                    mono: ["JetBrains Mono", "monospace"],
                },
                fontWeight: {
                    normal: "400",
                    medium: "500",
                    semibold: "600",
                    bold: "700",
                },
                lineHeight: {
                    tight: "1.25",
                    normal: "1.5",
                    relaxed: "1.75",
                },
            },
            colors: {
                background: {
                    primary: "#ffffff",
                    secondary: "#f9fafb",
                    tertiary: "#f3f4f6",
                    modal: "#ffffff",
                },
                text: {
                    primary: "#111827",
                    secondary: "#6b7280",
                    tertiary: "#9ca3af",
                    inverse: "#ffffff",
                },
                primary: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
                error: "#ef4444",
                warning: "#f59e0b",
                info: "#3b82f6",
                success: "#10b981",
                errorAlert: "#fef2f2",
                surface: {
                    primary: "#ffffff",
                    secondary: "#f8fafc",
                    elevated: "#f1f5f9",
                    base: "#ffffff",
                    overlay: "rgba(0, 0, 0, 0.5)",
                },
                border: {
                    primary: "#e2e8f0",
                    secondary: "#cbd5e1",
                    focus: "#3b82f6",
                },
                hover: {
                    light: "#f9fafb",
                    medium: "#e5e7eb",
                    dark: "#d1d5db",
                },
                status: {
                    up: "#10b981",
                    down: "#ef4444",
                    pending: "#f59e0b",
                    unknown: "#6b7280",
                    paused: "#8b5cf6",
                    mixed: "#f59e0b",
                },
            },
            borderRadius: {
                none: "0px",
                sm: "2px",
                md: "6px",
                lg: "8px",
                xl: "12px",
                full: "9999px",
            },
            shadows: {
                sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            },
        },
        getColor: vi.fn(),
    }),
    useThemeClasses: () => ({
        getBackgroundClass: vi.fn(() => ({ backgroundColor: "#ffffff" })),
        getBorderClass: vi.fn(() => ({ borderColor: "#e2e8f0" })),
        getColor: vi.fn(),
        getStatusClass: vi.fn(() => ({ color: "#10b981" })),
        getSurfaceClass: vi.fn(() => ({ backgroundColor: "#ffffff" })),
        getTextClass: vi.fn(() => ({ color: "#111827" })),
    }),
    useAvailabilityColors: () => ({
        getAvailabilityColor: vi.fn(() => "#10b981"),
        getAvailabilityDescription: vi.fn(() => "Excellent"),
        getAvailabilityVariant: vi.fn(() => "success" as const),
    }),
    useStatusColors: () => ({
        down: "#ef4444",
        pending: "#f59e0b",
        unknown: "#6b7280",
        up: "#10b981",
    }),
    useThemeValue: () => "mockValue",
}));

vi.mock("../../../../utils/monitorTypeHelper", () => ({
    getMonitorTypeConfig: vi.fn().mockResolvedValue({
        fields: [
            {
                label: "URL",
                required: true,
                name: "url",
            },
        ],
    }),
}));

vi.mock("../../../../utils/fallbacks", () => ({
    getMonitorDisplayIdentifier: vi.fn(() => monitorIdentifierRef.value),
    getMonitorTypeDisplayLabel: vi.fn().mockReturnValue("URL"),
    UiDefaults: {
        unknownLabel: "Unknown",
        loadingLabel: "Loading...",
    },
}));

vi.mock("../../../../utils/time", () => ({
    formatRetryAttemptsText: vi.fn(
        (attempts: number) => `${attempts + 1} attempts + backoff`
    ),
    getIntervalLabel: vi.fn((interval: number) => `${interval / 1000}s`),
}));

vi.mock("../../../../constants", () => ({
    CHECK_INTERVALS: [
        30_000,
        60_000,
        300_000,
        600_000,
    ],
    TIMEOUT_CONSTRAINTS: { MIN: 1000, MAX: 30_000, STEP: 1000 },
    RETRY_CONSTRAINTS: { MIN: 0, MAX: 5, STEP: 1 },
    DEFAULT_HISTORY_LIMIT: 500,
    TRANSITION_ALL: "all 0.2s ease-in-out",
    ARIA_LABEL: "aria-label",
}));

const initializeSampledSiteData = () => {
    sampledSiteName = sampleOne(siteNameArbitrary);
    sampledSiteIdentifier = sampleOne(siteIdentifierArbitrary);
    sampledMonitorUrl = sampleOne(siteUrlArbitrary);
    monitorIdentifierRef.value = sampledMonitorUrl;
};

initializeSampledSiteData();

describe("SettingsTab arithmetic mutations", () => {
    const mockSite: Site = {
        identifier: sampledSiteIdentifier,
        name: sampledSiteName,
        monitoring: true,
        monitors: [],
    };

    const mockMonitor: Monitor = {
        id: "monitor-1",
        type: "http",
        url: sampledMonitorUrl,
        checkInterval: 60_000,
        timeout: 30_000,
        retryAttempts: 3,
        monitoring: true,
        status: "up",
        responseTime: 150,
        history: [],
    };

    const defaultProps = {
        currentSite: mockSite,
        handleIntervalChange: vi.fn(),
        handleRemoveSite: vi.fn(),
        handleRetryAttemptsChange: vi.fn(),
        handleSaveInterval: vi.fn(),
        handleSaveName: vi.fn(),
        handleSaveRetryAttempts: vi.fn(),
        handleSaveTimeout: vi.fn(),
        handleTimeoutChange: vi.fn(),
        hasUnsavedChanges: false,
        intervalChanged: false,
        isLoading: false,
        localName: sampledSiteName,
        retryAttemptsChanged: false,
        selectedMonitor: mockMonitor,
        setLocalName: vi.fn(),
        timeoutChanged: false,
        localCheckInterval: 60_000,
        localRetryAttempts: 3,
        localTimeout: 30,
    };

    describe("Line 466: Math.round(localCheckInterval / 1000) mutation", () => {
        it("should correctly convert 60000ms to 60s (kills / -> * mutation)", () => {
            const props = {
                ...defaultProps,
                localCheckInterval: 60_000, // 60000ms should show as 60s
            };

            render(<SettingsTab {...props} />);

            // Should display "Monitor checks every 60 seconds"
            expect(
                screen.getByText(/Monitor checks every 60 seconds/)
            ).toBeInTheDocument();

            // Mutation (/ 1000 -> * 1000) would yield 60,000,000 which would be incorrect
            expect(
                screen.queryByText(/Monitor checks every 60{7} seconds/)
            ).not.toBeInTheDocument();
        });

        it("should handle sub-second intervals correctly", () => {
            const props = {
                ...defaultProps,
                localCheckInterval: 500, // 500ms should round to 1s
            };
            render(<SettingsTab {...props} />);

            // Should display "Monitor checks every 1 seconds" (Math.round(0.5) = 1)
            expect(
                screen.getByText(/Monitor checks every 1 seconds/)
            ).toBeInTheDocument();

            // Mutation (/ 1000 -> * 1000) would yield 500,000 which would be incorrect
            expect(
                screen.queryByText(/Monitor checks every 50{5} seconds/)
            ).not.toBeInTheDocument();
        });
    });

    describe("Line 561: localRetryAttempts + 1 mutation", () => {
        it("should calculate total attempts correctly (kills + -> - mutation)", () => {
            const props = {
                ...defaultProps,
                localRetryAttempts: 3,
                localTimeout: 30,
            };

            render(<SettingsTab {...props} />);

            // Should display "4 attempts" (3 + 1 = 4) - target the specific span with just the attempts text
            expect(
                screen.getByText("4 attempts + backoff")
            ).toBeInTheDocument();

            // Mutation (+ 1 -> - 1) would yield 2 attempts which would be incorrect
            expect(
                screen.queryByText(/2 attempts \+ backoff/)
            ).not.toBeInTheDocument();
        });

        it("should handle zero retries correctly", () => {
            const props = {
                ...defaultProps,
                localRetryAttempts: 0,
                localTimeout: 30,
            };

            render(<SettingsTab {...props} />);

            // Should display "1 attempts" (0 + 1 = 1)
            expect(
                screen.getByText(/1 attempts \+ backoff/)
            ).toBeInTheDocument();

            // Mutation (+ 1 -> - 1) would yield -1 attempts which would be incorrect
            expect(
                screen.queryByText(/-1 attempts \+ backoff/)
            ).not.toBeInTheDocument();
        });
    });

    describe("calculateMaxDuration arithmetic mutations", () => {
        describe("timeout * totalAttempts multiplication", () => {
            it("should calculate timeout time correctly (kills * -> / mutation)", () => {
                // Test timeout: 10s, retryAttempts: 2
                // totalAttempts = 2 + 1 = 3
                // timeoutTime = 10 * 3 = 30s
                const result = calculateMaxDuration(10, 2);

                // Should include the timeout portion in total calculation
                // With 2 retries, backoff = 0.5 + 1.0 = 1.5s
                // Total = 30 + 1.5 = 31.5s -> Math.ceil = 32s
                expect(result).toBe("32s");

                // Mutation (* -> /) would yield 10 / 3 = 3.33s timeoutTime
                // Total would be much smaller, definitely not 32s
            });
        });

        describe("retryAttempts + 1 addition", () => {
            it("should calculate total attempts correctly (kills + -> - mutation)", () => {
                // Test with 1 retry attempt
                const result = calculateMaxDuration(5, 1);

                // TotalAttempts = 1 + 1 = 2
                // timeoutTime = 5 * 2 = 10s
                // backoffTime = 0.5s (one retry)
                // total = 10 + 0.5 = 10.5s -> Math.ceil = 11s
                expect(result).toBe("11s");

                // Mutation (+ 1 -> - 1) would yield totalAttempts = 0
                // timeoutTime = 5 * 0 = 0, total would be much smaller
            });
        });

        describe("0.5 * 2 ** index exponential backoff", () => {
            it("should calculate exponential backoff correctly (kills * -> / and ** -> + mutations)", () => {
                // Test with multiple retries to verify exponential calculation
                const result = calculateMaxDuration(1, 3); // Very short timeout to isolate backoff effect

                // totalAttempts = 3 + 1 = 4
                // timeoutTime = 1 * 4 = 4s
                // backoffTime for 3 retries: 0.5*2^0 + 0.5*2^1 + 0.5*2^2 = 0.5 + 1.0 + 2.0 = 3.5s
                // total = 4 + 3.5 = 7.5s -> Math.ceil = 8s
                expect(result).toBe("8s");

                // Mutation (* -> /) would yield 0.5 / 2^index, much smaller values
                // Mutation (** -> +) would yield 0.5 * (2 + index), linear instead of exponential
            });

            it("should cap backoff at 5 seconds per attempt", () => {
                // Test with many retries to verify the cap
                const result = calculateMaxDuration(1, 5); // 5 retries

                // totalAttempts = 5 + 1 = 6
                // timeoutTime = 1 * 6 = 6s
                // backoffTime for 5 retries: 0.5 + 1.0 + 2.0 + 4.0 + 5.0 = 12.5s (last two capped at 5)
                // total = 6 + 12.5 = 18.5s -> Math.ceil = 19s
                expect(result).toBe("19s");
            });
        });

        describe("Math.ceil(totalTime / 60) division for minutes", () => {
            it("should convert to minutes correctly (kills / -> * mutation)", () => {
                // Create a scenario that results in minutes
                const result = calculateMaxDuration(30, 2); // 30s timeout, 2 retries

                // totalAttempts = 2 + 1 = 3
                // timeoutTime = 30 * 3 = 90s
                // backoffTime = 0.5 + 1.0 = 1.5s
                // total = 90 + 1.5 = 91.5s -> Math.ceil = 92s
                // Since 92s >= 60s, convert: Math.ceil(92 / 60) = Math.ceil(1.53) = 2m
                expect(result).toBe("2m");

                // Mutation (/ 60 -> * 60) would yield Math.ceil(92 * 60) = 5520m which is wrong
            });
        });

        describe("Math.ceil(totalTime / 3600) division for hours", () => {
            it("should convert to hours correctly (kills / -> * mutation)", () => {
                // Create a scenario that results in hours
                const result = calculateMaxDuration(600, 5); // 10min timeout, 5 retries

                // totalAttempts = 5 + 1 = 6
                // timeoutTime = 600 * 6 = 3600s
                // backoffTime = 0.5 + 1.0 + 2.0 + 4.0 + 5.0 = 12.5s
                // total = 3600 + 12.5 = 3612.5s -> Math.ceil = 3613s
                // Since 3613s >= 3600s, convert: Math.ceil(3613 / 3600) = Math.ceil(1.003) = 2h
                expect(result).toBe("2h");

                // Mutation (/ 3600 -> * 3600) would yield Math.ceil(3613 * 3600) = massive number
            });
        });

        describe("Edge cases and comprehensive arithmetic validation", () => {
            it("should handle zero retries (no backoff)", () => {
                const result = calculateMaxDuration(15, 0);

                // TotalAttempts = 0 + 1 = 1
                // timeoutTime = 15 * 1 = 15s
                // backoffTime = 0s (no retries)
                // total = 15 + 0 = 15s
                expect(result).toBe("15s");
            });

            it("should handle very large values correctly", () => {
                // Test boundary between minutes and hours
                const result = calculateMaxDuration(1200, 1); // 20min timeout, 1 retry

                // totalAttempts = 1 + 1 = 2
                // timeoutTime = 1200 * 2 = 2400s
                // backoffTime = 0.5s
                // total = 2400 + 0.5 = 2400.5s -> Math.ceil = 2401s
                // Since 2401s < 3600s but >= 60s: Math.ceil(2401 / 60) = Math.ceil(40.02) = 41m
                expect(result).toBe("41m");
            });
        });
    });

    describe("Integration test - multiple arithmetic operations working together", () => {
        it("should display all arithmetic calculations correctly in UI", () => {
            const props = {
                ...defaultProps,
                localCheckInterval: 30_000, // 30s
                localRetryAttempts: 2,
                localTimeout: 10,
            };

            render(<SettingsTab {...props} />);

            // Check interval display: Math.round(30000 / 1000) = 30 seconds
            expect(
                screen.getByText(/Monitor checks every 30 seconds/)
            ).toBeInTheDocument();

            // Check retry attempts display: 2 + 1 = 3 attempts - target the specific span
            expect(
                screen.getByText("3 attempts + backoff")
            ).toBeInTheDocument();

            // Check max duration calculation appears (calculateMaxDuration with all its arithmetic)
            // timeout=10, retryAttempts=2 -> should be around 22s total
            expect(
                screen.getByText(/Maximum check duration/)
            ).toBeInTheDocument();
        });
    });
});
