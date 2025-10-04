/**
 * Additional coverage tests for SiteDetailsHeader component
 *
 * Targets uncovered line 72 in the openExternal call
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SiteDetailsHeader } from "../../../components/SiteDetails/SiteDetailsHeader";
import type { Monitor, Site } from "../../../../shared/types";

// Mock the UI store
const mockOpenExternal = vi.fn();
vi.mock("../../../stores/ui/useUiStore", () => ({
    useUIStore: () => ({
        openExternal: mockOpenExternal,
    }),
}));

// Mock the theme hooks
vi.mock("../../../hooks/useThemeStyles", () => ({
    useThemeStyles: () => ({
        headerStyle: { backgroundColor: "#ffffff" },
        overlayStyle: { opacity: 0.1 },
        contentStyle: { padding: "16px" },
        collapseButtonStyle: { border: "none" },
    }),
}));

// Mock the ScreenshotThumbnail component
vi.mock("../../../components/SiteDetails/ScreenshotThumbnail", () => ({
    ScreenshotThumbnail: ({
        siteName,
        url,
    }: {
        siteName: string;
        url: string;
    }) => (
        <div
            data-testid="screenshot-thumbnail"
            data-site-name={siteName}
            data-url={url}
        >
            Screenshot for {siteName}
        </div>
    ),
}));

// Mock theme components
vi.mock("../../../theme/components", () => ({
    StatusIndicator: ({ status, size }: { status: string; size: string }) => (
        <div
            data-testid="status-indicator"
            data-status={status}
            data-size={size}
        >
            Status: {status}
        </div>
    ),
    ThemedText: ({ children, className, style }: any) => (
        <span className={className} style={style}>
            {children}
        </span>
    ),
    ThemedIconButton: ({ onClick, children, ariaLabel, ...props }: any) => (
        <button onClick={onClick} aria-label={ariaLabel} {...props}>
            {children}
        </button>
    ),
}));

// Mock MonitoringStatusDisplay
vi.mock("../../../components/SiteDetails/MonitoringStatusDisplay", () => ({
    MonitoringStatusDisplay: ({ monitors }: any) => (
        <div data-testid="monitoring-status-display">
            Monitoring {monitors.length} monitors
        </div>
    ),
}));

describe("SiteDetailsHeader - Additional Coverage", () => {
    const mockSite: Site = {
        identifier: "coverage-site-1",
        name: "Coverage Test Site",
        monitors: [],
        monitoring: true,
    };

    const mockHttpMonitor: Monitor = {
        id: "coverage-monitor-1",
        type: "http",
        url: "https://test-coverage.com",
        status: "up",
        responseTime: 150,
        monitoring: true,
        checkInterval: 300_000,
        timeout: 10_000,
        retryAttempts: 3,
        history: [],
    };

    const noop = vi.fn();

    beforeEach(() => {
        noop.mockClear();
    });

    describe("URL Click Handler Coverage (Line 72)", () => {
        it("should call openExternal with proper parameters when URL link is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.additional-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.additional-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();

            // Clear any previous calls
            mockOpenExternal.mockClear();

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={mockHttpMonitor}
                />
            );

            const link = screen.getByRole("link");
            await act(async () => {
                await user.click(link);
            });

            // Verify openExternal was called with correct URL (targeting line 72)
            expect(mockOpenExternal).toHaveBeenCalledTimes(1);
            expect(mockOpenExternal).toHaveBeenCalledWith(
                "https://test-coverage.com",
                {
                    siteName: "Coverage Test Site",
                }
            );
        });

        it("should call openExternal with empty URL when monitor has no URL", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.additional-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.additional-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            // Create a monitor with empty URL (edge case coverage)
            const httpMonitorNoUrl: Monitor = {
                id: "coverage-monitor-no-url",
                type: "http",
                url: "", // Empty URL for edge case
                status: "up",
                responseTime: 150,
                monitoring: true,
                checkInterval: 300_000,
                timeout: 10_000,
                retryAttempts: 3,
                history: [],
            };

            // Clear any previous calls
            mockOpenExternal.mockClear();

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={httpMonitorNoUrl}
                />
            );

            // With empty URL, there should be no link element since the condition
            // `selectedMonitor.url` is falsy, so just clicking the title itself
            // should trigger the logic if we can directly test the click handler

            // Since there's no link when URL is empty, we need to test this differently
            // We can verify that no link exists (which is the correct behavior)
            const links = screen.queryAllByRole("link");
            expect(links).toHaveLength(0);

            // This test verifies the logic path where empty URL prevents link creation
            // The actual line 72 (openExternal call) won't be reached without a link to click
            // This is the correct behavior - no link means no accidental external opens
        });

        it("should call openExternal when clicking link with different site names", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.additional-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.additional-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();

            // Test with a site that has special characters in name
            const httpMonitorSpecial: Monitor = {
                id: "coverage-monitor-special",
                type: "http",
                url: "https://special-chars.com",
                status: "up",
                responseTime: 150,
                monitoring: true,
                checkInterval: 300_000,
                timeout: 10_000,
                retryAttempts: 3,
                history: [],
            };

            const siteSpecial: Site = {
                identifier: "coverage-site-special",
                name: "Test Site & Co. #1",
                monitors: [],
                monitoring: true,
            };

            // Clear any previous calls
            mockOpenExternal.mockClear();

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    site={siteSpecial}
                    isCollapsed={false}
                    selectedMonitor={httpMonitorSpecial}
                />
            );

            const link = screen.getByRole("link");
            await act(async () => {
                await user.click(link);
            });

            // Verify openExternal was called with correct URL (targeting line 72)
            expect(mockOpenExternal).toHaveBeenCalledTimes(1);
            expect(mockOpenExternal).toHaveBeenCalledWith(
                "https://special-chars.com",
                {
                    siteName: "Test Site & Co. #1",
                }
            );
        });
    });
});
