/**
 * Comprehensive test for SettingsTab component to improve coverage. Tests
 * various props combinations, edge cases, and user interactions.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { SettingsTab } from "../../../../components/SiteDetails/tabs/SettingsTab";
import type { Monitor, Site } from "@shared/types";
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
vi.mock("../../../../constants", () => ({
    CHECK_INTERVALS: [
        30_000,
        60_000,
        300_000,
        600_000,
    ],
    TIMEOUT_CONSTRAINTS: { MIN: 1, MAX: 300, STEP: 1 },
    RETRY_CONSTRAINTS: { MIN: 0, MAX: 10, STEP: 1 },
    DEFAULT_HISTORY_LIMIT: 500,
    TRANSITION_ALL: "all 0.2s ease-in-out",
    ARIA_LABEL: "aria-label",
}));

vi.mock("../../../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        user: {
            action: vi.fn(),
        },
    },
}));

vi.mock("../../../../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({
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
                inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
            },
        },
        getColor: vi.fn(),
    })),
    useThemeClasses: vi.fn(() => ({
        getBackgroundClass: vi.fn(() => ({ backgroundColor: "#ffffff" })),
        getBorderClass: vi.fn(() => ({ borderColor: "#e2e8f0" })),
        getColor: vi.fn(),
        getStatusClass: vi.fn(() => ({ color: "#10b981" })),
        getSurfaceClass: vi.fn(() => ({ backgroundColor: "#ffffff" })),
        getTextClass: vi.fn(() => ({ color: "#111827" })),
    })),
    useAvailabilityColors: vi.fn(() => ({
        getAvailabilityColor: vi.fn(() => "#10b981"),
        getAvailabilityDescription: vi.fn(() => "Excellent"),
        getAvailabilityVariant: vi.fn(() => "success" as const),
    })),
    useStatusColors: vi.fn(() => ({
        down: "#ef4444",
        pending: "#f59e0b",
        unknown: "#6b7280",
        up: "#10b981",
    })),
    useThemeValue: vi.fn(() => "mockValue"),
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
    formatRetryAttemptsText: vi.fn().mockReturnValue("3 retry attempts"),
    getIntervalLabel: vi.fn().mockImplementation((interval) => {
        const value = typeof interval === "number" ? interval : interval.value;
        return `${value / 1000}s`;
    }),
}));

vi.mock("../../../../utils/duration", () => ({
    calculateMaxDuration: vi.fn().mockReturnValue("45 seconds"),
}));

vi.mock("../../../../utils/errorHandling", () => ({
    withUtilityErrorHandling: vi
        .fn()
        .mockImplementation(async (fn, _desc, fallback) => {
            try {
                return await fn();
            } catch {
                return fallback;
            }
        }),
}));

describe(SettingsTab, () => {
    let baseMockSite: Site;
    let baseMockMonitor: Monitor;
    let baseProps: any;

    beforeEach(() => {
        vi.clearAllMocks();

        sampledSiteName = sampleOne(siteNameArbitrary);
        sampledSiteIdentifier = sampleOne(siteIdentifierArbitrary);
        sampledMonitorUrl = sampleOne(siteUrlArbitrary);
        monitorIdentifierRef.value = sampledMonitorUrl;

        baseMockSite = {
            identifier: sampledSiteIdentifier,
            name: sampledSiteName,
            monitors: [],
            monitoring: true,
        };

        baseMockMonitor = {
            id: "monitor-1",
            type: "http",
            url: sampledMonitorUrl,
            timeout: 10_000,
            checkInterval: 60_000,
            retryAttempts: 3,
            monitoring: true,
            status: "up",
            responseTime: 250,
            lastChecked: new Date(),
            history: [
                {
                    timestamp: Date.now() - 60_000,
                    status: "up",
                    responseTime: 200,
                },
                {
                    timestamp: Date.now() - 120_000,
                    status: "up",
                    responseTime: 180,
                },
            ],
        };

        baseProps = {
            currentSite: baseMockSite,
            selectedMonitor: baseMockMonitor,
            localName: sampledSiteName,
            localCheckInterval: 60_000,
            localTimeout: 10,
            localRetryAttempts: 3,
            hasUnsavedChanges: false,
            intervalChanged: false,
            timeoutChanged: false,
            retryAttemptsChanged: false,
            isLoading: false,
            handleIntervalChange: vi.fn(),
            handleRemoveSite: vi.fn().mockResolvedValue(undefined),
            handleRetryAttemptsChange: vi.fn(),
            handleSaveInterval: vi.fn(),
            handleSaveName: vi.fn().mockResolvedValue(undefined),
            handleSaveRetryAttempts: vi.fn().mockResolvedValue(undefined),
            handleSaveTimeout: vi.fn().mockResolvedValue(undefined),
            handleTimeoutChange: vi.fn(),
            setLocalName: vi.fn(),
        };
    });

    describe("Component Rendering", () => {
        it("should render settings tab with all sections", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            expect(screen.getByTestId("settings-tab")).toBeInTheDocument();
            expect(screen.getByText("Site Configuration")).toBeInTheDocument();
            expect(
                screen.getByText("Monitoring Configuration")
            ).toBeInTheDocument();
            expect(screen.getByText("Site Information")).toBeInTheDocument();
            expect(screen.getByText("Danger Zone")).toBeInTheDocument();
        });

        it("should display site name input with current value", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            const siteNameInput = screen.getByDisplayValue(baseProps.localName);
            expect(siteNameInput).toBeInTheDocument();
            expect(siteNameInput).not.toBeDisabled();
        });

        it("should display disabled site identifier input", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            const identifierInput = screen.getByDisplayValue(
                baseMockMonitor.url as string
            );
            expect(identifierInput).toBeInTheDocument();
            expect(identifierInput).toBeDisabled();
        });

        it("should show check interval dropdown with options", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            const intervalSelect = screen.getByDisplayValue("60s");
            expect(intervalSelect).toBeInTheDocument();

            // Should have multiple interval options
            const options = screen.getAllByRole("option");
            expect(options.length).toBeGreaterThan(1);
        });

        it("should display timeout input with current value", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            const timeoutInput = screen.getByDisplayValue("10");
            expect(timeoutInput).toBeInTheDocument();
            expect(timeoutInput).toHaveAttribute("type", "number");
        });

        it("should display retry attempts input with current value", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            const retryInput = screen.getByPlaceholderText(
                "Enter retry attempts"
            ) as HTMLInputElement;
            expect(retryInput).toBeInTheDocument();
            expect(retryInput).toHaveAttribute("type", "number");
            expect(retryInput).toHaveValue(3);
        });
    });

    describe("Site Configuration", () => {
        it("should handle site name changes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            const siteNameInput = screen.getByDisplayValue(baseProps.localName);
            fireEvent.change(siteNameInput, {
                target: { value: "New Site Name" },
            });

            expect(baseProps.setLocalName).toHaveBeenCalledWith(
                "New Site Name"
            );
        });

        it("should show save button for site name when there are unsaved changes", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SettingsTab {...baseProps} hasUnsavedChanges={true} />);

            const saveButtons = screen.getAllByText("Save");
            expect(saveButtons[0]).not.toBeDisabled();
        });

        it("should disable save button when no changes", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SettingsTab {...baseProps} hasUnsavedChanges={false} />);

            // Use getAllByRole to get button elements instead of text
            const saveButtons = screen.getAllByRole("button", {
                name: /save/i,
            });
            expect(saveButtons[0]).toBeDisabled();
        });

        it("should call handleSaveName when save button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SettingsTab {...baseProps} hasUnsavedChanges={true} />);

            const saveButtons = screen.getAllByText("Save");
            expect(saveButtons[0]).toBeDefined();
            fireEvent.click(saveButtons[0]!);

            await waitFor(() => {
                expect(baseProps.handleSaveName).toHaveBeenCalledTimes(1);
            });
        });

        it("should show unsaved changes warning", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SettingsTab {...baseProps} hasUnsavedChanges={true} />);

            const unsavedBadge = screen.getByText("Unsaved changes");
            expect(unsavedBadge).toBeInTheDocument();
            expect(unsavedBadge.closest(".themed-badge")).not.toBeNull();
        });
    });

    describe("Monitoring Configuration", () => {
        it("should handle interval changes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            const intervalSelect = screen.getByDisplayValue("60s");
            fireEvent.change(intervalSelect, { target: { value: "300000" } });

            expect(baseProps.handleIntervalChange).toHaveBeenCalledTimes(1);
        });

        it("should enable save interval button when interval changed", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SettingsTab {...baseProps} intervalChanged={true} />);

            const saveButtons = screen.getAllByText("Save");
            expect(saveButtons[1]).not.toBeDisabled();
        });

        it("should call handleSaveInterval when save button clicked", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SettingsTab {...baseProps} intervalChanged={true} />);

            const saveButtons = screen.getAllByText("Save");
            expect(saveButtons[1]).toBeDefined();
            fireEvent.click(saveButtons[1]!);

            expect(baseProps.handleSaveInterval).toHaveBeenCalledTimes(1);
        });

        it("should handle timeout changes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            const timeoutInput = screen.getByDisplayValue("10");
            fireEvent.change(timeoutInput, { target: { value: "15" } });

            expect(baseProps.handleTimeoutChange).toHaveBeenCalledTimes(1);
        });

        it("should enable save timeout button when timeout changed", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SettingsTab {...baseProps} timeoutChanged={true} />);

            const saveButtons = screen.getAllByText("Save");
            expect(saveButtons[2]).not.toBeDisabled();
        });

        it("should call handleSaveTimeout when save button clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SettingsTab {...baseProps} timeoutChanged={true} />);

            const saveButtons = screen.getAllByText("Save");
            expect(saveButtons[2]).toBeDefined();
            fireEvent.click(saveButtons[2]!);

            await waitFor(() => {
                expect(baseProps.handleSaveTimeout).toHaveBeenCalledTimes(1);
            });
        });

        it("should handle retry attempts changes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            const retryInput = screen.getByPlaceholderText(
                "Enter retry attempts"
            );
            fireEvent.change(retryInput, { target: { value: "5" } });

            expect(baseProps.handleRetryAttemptsChange).toHaveBeenCalledTimes(
                1
            );
        });

        it("should enable save retry button when retry attempts changed", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SettingsTab {...baseProps} retryAttemptsChanged={true} />);

            const saveButtons = screen.getAllByText("Save");
            expect(saveButtons[3]).not.toBeDisabled();
        });

        it("should call handleSaveRetryAttempts when save button clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SettingsTab {...baseProps} retryAttemptsChanged={true} />);

            const saveButtons = screen.getAllByText("Save");
            expect(saveButtons[3]).toBeDefined();
            fireEvent.click(saveButtons[3]!);

            await waitFor(() => {
                expect(baseProps.handleSaveRetryAttempts).toHaveBeenCalledTimes(
                    1
                );
            });
        });

        it("should show maximum duration calculation when retry attempts > 0", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} localRetryAttempts={3} />);

            expect(screen.getByText(/maximum check duration/i)).toBeInTheDocument();
            expect(screen.getByText(/~\s*\d+s/)).toBeInTheDocument();
        });

        it("should not show maximum duration when retry attempts is 0", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} localRetryAttempts={0} />);

            expect(
                screen.queryByText(/Maximum check duration/)
            ).not.toBeInTheDocument();
        });
    });

    describe("Site Information", () => {
        it("should display history records count", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            expect(screen.getByText("History Records")).toBeInTheDocument();
            expect(screen.getByText("2")).toBeInTheDocument();
        });

        it("should display last checked time", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            expect(screen.getByText("Last Checked")).toBeInTheDocument();
            // Should show formatted date - use getAllByText to handle multiple dates
            const dateElements = screen.getAllByText(
                (content) => content.includes("/") && content.includes(":")
            );
            expect(dateElements.length).toBeGreaterThan(0);
        });

        it("should display 'Never' when lastChecked is null", () => {
            const monitorWithoutLastChecked = {
                ...baseMockMonitor,
                lastChecked: null,
            };

            render(
                <SettingsTab
                    {...baseProps}
                    selectedMonitor={monitorWithoutLastChecked}
                />
            );

            expect(screen.getByText("Never")).toBeInTheDocument();
        });
    });

    describe("Danger Zone", () => {
        it("should render remove site button", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Deletion", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Deletion", "type");

            render(<SettingsTab {...baseProps} />);

            // Check for both the heading and button, but test them separately
            expect(screen.getAllByText("Remove Site")).toHaveLength(2);
            expect(
                screen.getByText(/This action cannot be undone/)
            ).toBeInTheDocument();
        });

        it("should call handleRemoveSite when remove button clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Deletion", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Deletion", "type");

            render(<SettingsTab {...baseProps} />);

            // Get the button specifically (the one that's clickable)
            const removeButton = screen.getByRole("button", {
                name: /remove site/i,
            });
            fireEvent.click(removeButton);

            await waitFor(() => {
                expect(baseProps.handleRemoveSite).toHaveBeenCalledTimes(1);
            });
        });

        it("should disable remove button when loading", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(<SettingsTab {...baseProps} isLoading={true} />);

            const removeButton = screen.getByRole("button", {
                name: /remove site/i,
            });
            expect(removeButton).toBeDisabled();
        });
    });

    describe("Loading States", () => {
        it("should disable save buttons when loading", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(
                <SettingsTab
                    {...baseProps}
                    isLoading={true}
                    hasUnsavedChanges={true}
                />
            );

            // Get save buttons by role instead of text to avoid getting spans
            const saveButtons = screen.getAllByRole("button", {
                name: /save/i,
            });
            expect(saveButtons[0]).toBeDisabled();
        });

        it("should show loading state on remove button", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(<SettingsTab {...baseProps} isLoading={true} />);

            const removeButton = screen.getByRole("button", {
                name: /remove site/i,
            });
            expect(removeButton).toBeDisabled();
        });
    });

    describe("Edge Cases", () => {
        it("should handle monitor with empty history", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const monitorWithEmptyHistory = {
                ...baseMockMonitor,
                history: [],
            };

            render(
                <SettingsTab
                    {...baseProps}
                    selectedMonitor={monitorWithEmptyHistory}
                />
            );

            expect(screen.getByText("0")).toBeInTheDocument();
        });

        it("should handle monitor with undefined lastChecked", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const monitorWithUndefinedLastChecked = {
                ...baseMockMonitor,
                lastChecked: undefined,
            };

            render(
                <SettingsTab
                    {...baseProps}
                    selectedMonitor={monitorWithUndefinedLastChecked}
                />
            );

            expect(screen.getByText("Never")).toBeInTheDocument();
        });

        it("should handle very long site names", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const longName = "A".repeat(100);
            render(<SettingsTab {...baseProps} localName={longName} />);

            const siteNameInput = screen.getByDisplayValue(longName);
            expect(siteNameInput).toBeInTheDocument();
        });

        it("should handle extreme timeout values", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} localTimeout={30} />);

            const timeoutInput = screen.getByDisplayValue("30");
            expect(timeoutInput).toBeInTheDocument();
            expect(
                screen.getByText(
                    (content) =>
                        content.includes("Current:") && content.includes("30s")
                )
            ).toBeInTheDocument();
        });

        it("should handle maximum retry attempts", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} localRetryAttempts={5} />);

            const retryInput = screen.getByDisplayValue("5");
            expect(retryInput).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should have proper form labels and structure", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            expect(screen.getByText(/^site name$/i)).toBeInTheDocument();
            expect(screen.getByText(/^check interval$/i)).toBeInTheDocument();
            expect(
                screen.getByText(/^timeout \(seconds\)$/i)
            ).toBeInTheDocument();
            expect(screen.getByText(/^retry attempts$/i)).toBeInTheDocument();
        });

        it("should have proper input constraints", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SettingsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SettingsTab {...baseProps} />);

            const timeoutInput = screen.getByDisplayValue("10");
            expect(timeoutInput).toHaveAttribute("min", "1");
            expect(timeoutInput).toHaveAttribute("max", "300");
            expect(timeoutInput).toHaveAttribute("step", "1");

            const retryInput = screen.getByPlaceholderText(
                "Enter retry attempts"
            );
            expect(retryInput).toHaveAttribute("min", "0");
            expect(retryInput).toHaveAttribute("max", "10");
        });
    });
});
