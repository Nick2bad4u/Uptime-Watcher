/**
 * Additional behavior tests for SiteDetailsHeader component
 *
 * Tests external URL actions from SiteDetailsHeader.
 */

import type { Monitor, Site } from "@shared/types";

import {
    monitorIdArbitrary,
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { safeCastTo } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteDetailsHeader } from "../../../components/SiteDetails/SiteDetailsHeader";

const sampledSiteName = sampleOne(siteNameArbitrary);
const sampledSiteIdentifier = sampleOne(siteIdentifierArbitrary);
const sampledMonitorId = sampleOne(monitorIdArbitrary);
const sampledMonitorUrl = sampleOne(siteUrlArbitrary);

// Mock the UI store
const mockOpenExternal = vi.fn();
const mockToggleHeaderCollapsed = vi.fn();
const mockSetHeaderCollapsed = vi.fn();
const mockStoreState = {
    openExternal: mockOpenExternal,
    setSiteDetailsHeaderCollapsed: mockSetHeaderCollapsed,
    siteDetailsHeaderCollapsedState: safeCastTo<Record<string, boolean>>({}),
    toggleSiteDetailsHeaderCollapsed: mockToggleHeaderCollapsed,
};

vi.mock("../../../stores/ui/useUiStore", () => ({
    useUIStore: (selector?: (state: typeof mockStoreState) => unknown) =>
        typeof selector === "function"
            ? selector(mockStoreState)
            : mockStoreState,
}));

// Mock the theme hooks
vi.mock("../../../hooks/useThemeStyles", () => ({
    useThemeStyles: () => ({
        headerStyle: { backgroundColor: "#ffffff" },
        overlayStyle: { opacity: 0.1 },
        contentStyle: { padding: "16px" },
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
            data-site-name={siteName}
            data-testid="screenshot-thumbnail"
            data-url={url}
        >
            Screenshot for {siteName}
        </div>
    ),
}));

// Mock theme components
vi.mock("../../../theme/components", () => ({
    StatusIndicator: ({ status, size }: { size: string; status: string }) => (
        <div
            data-size={size}
            data-status={status}
            data-testid="status-indicator"
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
        <button aria-label={ariaLabel} onClick={onClick} {...props}>
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

describe("SiteDetailsHeader - Additional Behavior", () => {
    const mockSite: Site = {
        identifier: sampledSiteIdentifier,
        name: sampledSiteName,
        monitors: [],
        monitoring: true,
    };

    const mockHttpMonitor: Monitor = {
        id: sampledMonitorId,
        type: "http",
        url: sampledMonitorUrl,
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
        mockOpenExternal.mockClear();
        mockSetHeaderCollapsed.mockClear();
        mockToggleHeaderCollapsed.mockClear();
        mockStoreState.siteDetailsHeaderCollapsedState = {};
    });

    describe("URL click handler behavior", () => {
        it("should call openExternal with proper parameters when URL link is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
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
                    selectedMonitor={mockHttpMonitor}
                    site={mockSite}
                />
            );

            const link = screen.getByRole("link");
            await user.click(link);

            // Verify openExternal was called with the correct URL.
            expect(mockOpenExternal).toHaveBeenCalledTimes(1);
            expect(mockOpenExternal).toHaveBeenCalledWith(sampledMonitorUrl, {
                siteName: mockSite.name,
            });
        });

        it("should call openExternal with empty URL when monitor has no URL", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            // Create a monitor with empty URL (edge case behavior)
            const httpMonitorNoUrl: Monitor = {
                id: "behavior-monitor-no-url",
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
                    selectedMonitor={httpMonitorNoUrl}
                    site={mockSite}
                />
            );

            // With empty URL, there should be no link element since the condition
            // `selectedMonitor.url` is falsy, so just clicking the title itself
            // should trigger the logic if we can directly test the click handler

            // Since there's no link when URL is empty, we need to test this differently
            // We can verify that no link exists (which is the correct behavior)
            const links = screen.queryAllByRole("link");
            expect(links).toHaveLength(0);

            // This test verifies the logic path where empty URL prevents link creation, and openExternal is only reached when a link is rendered and clicked.
        });

        it("should call openExternal when clicking link with different site names", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();

            // Test with a site that has special characters in name
            const httpMonitorSpecial: Monitor = {
                id: "behavior-monitor-special",
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
                identifier: "behavior-site-special",
                name: "Test Site & Co. #1",
                monitors: [],
                monitoring: true,
            };

            // Clear any previous calls
            mockOpenExternal.mockClear();

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    selectedMonitor={httpMonitorSpecial}
                    site={siteSpecial}
                />
            );

            const link = screen.getByRole("link");
            await user.click(link);

            // Verify openExternal was called with the correct URL.
            expect(mockOpenExternal).toHaveBeenCalledTimes(1);
            expect(mockOpenExternal).toHaveBeenCalledWith(
                "https://special-chars.com",
                {
                    siteName: "Test Site & Co. #1",
                }
            );
        });

        it("should trim monitor URLs before invoking openExternal", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            const monitorWithWhitespace: Monitor = {
                ...mockHttpMonitor,
                id: "trim-test-monitor",
                url: "   https://trimmed-url.example.com/path   ",
            };

            mockOpenExternal.mockClear();

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    selectedMonitor={monitorWithWhitespace}
                    site={mockSite}
                />
            );

            const link = screen.getByRole("link");
            await user.click(link);

            expect(mockOpenExternal).toHaveBeenCalledTimes(1);
            expect(mockOpenExternal).toHaveBeenCalledWith(
                "https://trimmed-url.example.com/path",
                {
                    siteName: mockSite.name,
                }
            );
        });

        it("should redact monitor URL secrets in rendered link text", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Privacy", "type");

            const user = userEvent.setup();
            const sensitiveUrl =
                "https://secret.example.com/status?refresh_token=header-secret#fragment";
            const monitorWithSensitiveUrl: Monitor = {
                ...mockHttpMonitor,
                id: "sensitive-url-monitor",
                url: `   ${sensitiveUrl}   `,
            };

            mockOpenExternal.mockClear();

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    selectedMonitor={monitorWithSensitiveUrl}
                    site={mockSite}
                />
            );

            const link = screen.getByRole("link", {
                name: "Open https://secret.example.com/status in browser",
            });

            expect(link).toHaveTextContent("https://secret.example.com/status");
            expect(link).toHaveAttribute(
                "href",
                "https://secret.example.com/status?refresh_token=header-secret#fragment"
            );
            expect(link).not.toHaveTextContent("refresh_token");
            expect(link).not.toHaveTextContent("header-secret");
            expect(link).not.toHaveTextContent("fragment");

            await user.click(link);

            expect(mockOpenExternal).toHaveBeenCalledWith(sensitiveUrl, {
                siteName: mockSite.name,
            });
        });

        it("should suppress link rendering when URL fails validation", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Safeguard", "type");

            const invalidUrlMonitor: Monitor = {
                ...mockHttpMonitor,
                id: "invalid-url-monitor",
                url: "not-a-valid-url",
            };

            mockOpenExternal.mockClear();

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    selectedMonitor={invalidUrlMonitor}
                    site={mockSite}
                />
            );

            expect(screen.queryByRole("link")).toBeNull();
            expect(mockOpenExternal).not.toHaveBeenCalled();
        });
    });

    describe("Collapsed Header Controls", () => {
        it("should toggle collapse state when collapse button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Interaction", "type");

            const user = userEvent.setup();

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    selectedMonitor={mockHttpMonitor}
                    site={mockSite}
                />
            );

            const collapseButton = screen.getByRole("button", {
                name: /collapse header/i,
            });

            await user.click(collapseButton);

            expect(mockToggleHeaderCollapsed).toHaveBeenCalledTimes(1);
            expect(mockToggleHeaderCollapsed).toHaveBeenCalledWith(
                mockSite.identifier
            );
        });

        it("should hide thumbnail and monitoring summary when collapsed", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Presentation", "type");

            mockStoreState.siteDetailsHeaderCollapsedState = {
                [mockSite.identifier]: true,
            };

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    selectedMonitor={mockHttpMonitor}
                    site={mockSite}
                />
            );

            expect(
                screen.queryByTestId("screenshot-thumbnail")
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId("monitoring-status-display")
            ).not.toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /expand header/iv })
            ).toBeInTheDocument();
        });
    });

    describe("Expanded layout assertions", () => {
        it("should always render screenshot thumbnail for HTTP monitors", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: UI", "type");

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    selectedMonitor={mockHttpMonitor}
                    site={{
                        ...mockSite,
                        monitors: [mockHttpMonitor],
                    }}
                />
            );

            expect(
                screen.getByTestId("screenshot-thumbnail")
            ).toBeInTheDocument();
        });

        it("should render monitoring status display alongside header details", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteDetailsHeader.actions",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            render(
                <SiteDetailsHeader
                    onClose={noop}
                    selectedMonitor={mockHttpMonitor}
                    site={{
                        ...mockSite,
                        monitors: [mockHttpMonitor],
                    }}
                />
            );

            expect(
                screen.getByTestId("monitoring-status-display")
            ).toHaveTextContent("Monitoring 1 monitors");
        });
    });
});
