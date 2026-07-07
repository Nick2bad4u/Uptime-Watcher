/**
 * Arithmetic mutation tests for SettingsTab.tsx
 *
 * Targets arithmetic operations to kill arithmetic operator mutations. These
 * tests ensure proper calculations in interval display, retry calculations, and
 * duration formatting.
 */

import type { Monitor, Site } from "@shared/types";

import "@testing-library/jest-dom";
import {
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsTab } from "../../../../components/SiteDetails/tabs/SettingsTab";

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
        localCheckIntervalMs: 60_000,
        localRetryAttempts: 3,
        localTimeoutSeconds: 30,
    };

    describe("Line 466: Math.round(localCheckIntervalMs / 1000) mutation", () => {
        it("should correctly convert 60000ms to 60s (kills / -> * mutation)", () => {
            const props = {
                ...defaultProps,
                localCheckIntervalMs: 60_000, // 60000ms should show as 60s
            };

            render(<SettingsTab {...props} />);

            // Remains readable with the new help callout formatting.
            expect(screen.getByText(/Current:\s*60s/v)).toBeInTheDocument();

            // Mutation (/ 1000 -> * 1000) would yield 60,000,000 which would be incorrect
            expect(
                screen.queryByText(/Currently:\s*60{7}s/v)
            ).not.toBeInTheDocument();
        });

        it("should handle sub-second intervals correctly", () => {
            const props = {
                ...defaultProps,
                localCheckIntervalMs: 500, // 500ms should round to 1s
            };
            render(<SettingsTab {...props} />);

            // (Math.round(0.5) = 1)
            expect(
                screen.getByText(
                    /How often Uptime Watcher runs a check for this monitor/v
                )
            ).toBeInTheDocument();

            // Mutation (/ 1000 -> * 1000) would yield 500,000 which would be incorrect
            expect(
                screen.queryByText(/Currently:\s*50{5}s/v)
            ).not.toBeInTheDocument();
        });
    });

    describe("Line 561: localRetryAttempts + 1 mutation", () => {
        it("should calculate total attempts correctly (kills + -> - mutation)", () => {
            const props = {
                ...defaultProps,
                localRetryAttempts: 3,
                localTimeoutSeconds: 30,
            };

            render(<SettingsTab {...props} />);

            // Should display "4 attempts" (3 + 1 = 4) - target the specific span with just the attempts text
            expect(
                screen.getByText(/\b4 attempts \+ backoff\./v)
            ).toBeInTheDocument();

            // Mutation (+ 1 -> - 1) would yield 2 attempts which would be incorrect
            expect(
                screen.queryByText(/2 attempts \+ backoff/v)
            ).not.toBeInTheDocument();
        });

        it("should handle zero retries correctly", () => {
            const props = {
                ...defaultProps,
                localRetryAttempts: 0,
                localTimeoutSeconds: 30,
            };

            render(<SettingsTab {...props} />);

            // Should display "1 attempts" (0 + 1 = 1)
            expect(
                screen.getByText(/1 attempts \+ backoff/v)
            ).toBeInTheDocument();

            // Mutation (+ 1 -> - 1) would yield -1 attempts which would be incorrect
            expect(
                screen.queryByText(/-1 attempts \+ backoff/v)
            ).not.toBeInTheDocument();
        });
    });

    describe("Integration test - multiple arithmetic operations working together", () => {
        it("should display all arithmetic calculations correctly in UI", () => {
            const props = {
                ...defaultProps,
                localCheckIntervalMs: 30_000, // 30s
                localRetryAttempts: 2,
                localTimeoutSeconds: 10,
            };

            render(<SettingsTab {...props} />);

            expect(screen.getByText(/Current:\s*30s/v)).toBeInTheDocument();

            // Check retry attempts display: 2 + 1 = 3 attempts - target the specific span
            expect(
                screen.getByText(/\b3 attempts \+ backoff\./v)
            ).toBeInTheDocument();

            // Check max duration calculation appears.
            // timeout=10, retryAttempts=2 -> should be around 22s total
            expect(
                screen.getByText(/Maximum check duration/v)
            ).toBeInTheDocument();
        });
    });
});
