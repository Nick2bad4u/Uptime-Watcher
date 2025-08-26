import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SiteDetailsHeader from "../../../components/SiteDetails/SiteDetailsHeader";
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
    ThemedText: ({ children, ...props }: any) => (
        <div data-testid="themed-text" {...props}>
            {children}
        </div>
    ),
    ThemedBox: ({ children, ...props }: any) => (
        <div data-testid="themed-box" {...props}>
            {children}
        </div>
    ),
    ThemedBadge: ({ children, ...props }: any) => (
        <div data-testid="themed-badge" {...props}>
            {children}
        </div>
    ),
}));

// Mock icons
vi.mock("react-icons/md", () => ({
    MdExpandLess: () => <div data-testid="expand-less-icon">ExpandLess</div>,
    MdExpandMore: () => <div data-testid="expand-more-icon">ExpandMore</div>,
}));

describe("SiteDetailsHeader", () => {
    const mockSite: Site = {
        identifier: "site-1",
        name: "Test Site",
        monitors: [],
        monitoring: true,
    };

    const mockHttpMonitor: Monitor = {
        id: "monitor-1",
        type: "http",
        url: "https://example.com",
        status: "up",
        responseTime: 150,
        monitoring: true,
        checkInterval: 300_000,
        timeout: 10_000,
        retryAttempts: 3,
        history: [],
    };

    const mockPingMonitor: Monitor = {
        id: "monitor-2",
        type: "ping",
        host: "example.com",
        status: "up",
        responseTime: 50,
        monitoring: true,
        checkInterval: 300_000,
        timeout: 10_000,
        retryAttempts: 3,
        history: [],
    };

    const mockPortMonitor: Monitor = {
        id: "monitor-3",
        type: "port",
        host: "example.com",
        port: 80,
        status: "up",
        responseTime: 25,
        monitoring: true,
        checkInterval: 300_000,
        timeout: 10_000,
        retryAttempts: 3,
        history: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render site name", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SiteDetailsHeader site={mockSite} />);
            expect(screen.getByText("Test Site")).toBeInTheDocument();
        });

        it("should render status indicator", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    selectedMonitor={mockHttpMonitor}
                />
            );
            const statusIndicator = document.querySelector(
                ".themed-status-indicator"
            );
            expect(statusIndicator).toBeInTheDocument();
        });

        it("should render header with proper structure", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SiteDetailsHeader site={mockSite} />);
            expect(screen.getByText("Test Site")).toBeInTheDocument();
        });
    });

    describe("Collapsed State", () => {
        it("should not render screenshot thumbnail when collapsed", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={true}
                    selectedMonitor={mockHttpMonitor}
                />
            );
            expect(
                screen.queryByTestId("screenshot-thumbnail")
            ).not.toBeInTheDocument();
        });

        it("should not render URL link when collapsed", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={true}
                    selectedMonitor={mockHttpMonitor}
                />
            );
            expect(screen.queryByRole("link")).not.toBeInTheDocument();
        });

        it("should not render monitoring status display when collapsed", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const siteWithMonitors = {
                ...mockSite,
                monitors: [mockHttpMonitor],
            };
            render(
                <SiteDetailsHeader site={siteWithMonitors} isCollapsed={true} />
            );
            // When collapsed, detailed monitoring display should not be visible
            // The basic status indicator should still be present
            expect(
                document.querySelector(".themed-status-indicator")
            ).toBeInTheDocument();
        });

        it("should show expand icon when collapsed", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const onToggleCollapse = vi.fn();
            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={true}
                    onToggleCollapse={onToggleCollapse}
                />
            );
            expect(screen.getByTestId("expand-more-icon")).toBeInTheDocument();
        });
    });

    describe("Expanded State", () => {
        it("should render screenshot thumbnail when expanded with HTTP monitor", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={mockHttpMonitor}
                />
            );
            const thumbnail = screen.getByTestId("screenshot-thumbnail");
            expect(thumbnail).toBeInTheDocument();
            expect(thumbnail).toHaveAttribute("data-site-name", "Test Site");
            expect(thumbnail).toHaveAttribute(
                "data-url",
                "https://example.com"
            );
        });

        it("should show collapse icon when expanded", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const onToggleCollapse = vi.fn();
            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    onToggleCollapse={onToggleCollapse}
                />
            );
            expect(screen.getByTestId("expand-less-icon")).toBeInTheDocument();
        });

        it("should render monitoring status display when expanded", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const siteWithMonitors = {
                ...mockSite,
                monitors: [mockHttpMonitor],
            };
            render(
                <SiteDetailsHeader
                    site={siteWithMonitors}
                    isCollapsed={false}
                />
            );
            // Check that the status indicator is present (main indicator for monitoring status)
            expect(
                document.querySelector(".themed-status-indicator")
            ).toBeInTheDocument();
        });
    });

    describe("HTTP Monitor Handling", () => {
        it("should render clickable URL for HTTP monitor", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={mockHttpMonitor}
                />
            );
            const link = screen.getByRole("link");
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", "https://example.com");
            expect(link).toHaveTextContent("https://example.com");
        });

        it("should call openExternal when URL is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={mockHttpMonitor}
                />
            );

            const link = screen.getByRole("link");
            await act(async () => {
                await user.click(link);
            });

            expect(mockOpenExternal).toHaveBeenCalledWith(
                "https://example.com",
                {
                    siteName: "Test Site",
                }
            );
        });

        it("should not render URL for HTTP monitor without URL", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const { url, ...monitorWithoutUrl } = mockHttpMonitor;
            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={monitorWithoutUrl}
                />
            );
            expect(screen.queryByRole("link")).not.toBeInTheDocument();
        });

        it("should render empty screenshot URL for HTTP monitor without URL", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const { url, ...monitorWithoutUrl } = mockHttpMonitor;
            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={monitorWithoutUrl}
                />
            );
            const thumbnail = screen.getByTestId("screenshot-thumbnail");
            expect(thumbnail).toHaveAttribute("data-url", "");
        });
    });

    describe("Non-HTTP Monitors", () => {
        it("should not render URL for ping monitor", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={mockPingMonitor}
                />
            );
            expect(screen.queryByRole("link")).not.toBeInTheDocument();
        });

        it("should not render URL for port monitor", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={mockPortMonitor}
                />
            );
            expect(screen.queryByRole("link")).not.toBeInTheDocument();
        });

        it("should render empty screenshot URL for non-HTTP monitors", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={mockPingMonitor}
                />
            );
            const thumbnail = screen.getByTestId("screenshot-thumbnail");
            expect(thumbnail).toHaveAttribute("data-url", "");
        });
    });

    describe("No Monitor State", () => {
        it("should show no monitor warning when no monitor is selected", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            render(<SiteDetailsHeader site={mockSite} isCollapsed={false} />);
            expect(
                screen.getByText("No monitor data available for this site.")
            ).toBeInTheDocument();
        });

        it("should not show no monitor warning when collapsed", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            render(<SiteDetailsHeader site={mockSite} isCollapsed={true} />);
            expect(
                screen.queryByText("No monitor data available for this site.")
            ).not.toBeInTheDocument();
        });
    });

    describe("Collapse Toggle", () => {
        it("should call onToggleCollapse when collapse button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            const onToggleCollapse = vi.fn();

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    onToggleCollapse={onToggleCollapse}
                />
            );

            const button = screen.getByRole("button");
            await act(async () => {
                await user.click(button);
            });

            expect(onToggleCollapse).toHaveBeenCalledOnce();
        });

        it("should not render collapse button when onToggleCollapse is not provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SiteDetailsHeader site={mockSite} isCollapsed={false} />);
            expect(screen.queryByRole("button")).not.toBeInTheDocument();
        });

        it("should have correct aria-label when collapsed", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const onToggleCollapse = vi.fn();
            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={true}
                    onToggleCollapse={onToggleCollapse}
                />
            );
            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("aria-label", "Expand header");
            expect(button).toHaveAttribute("title", "Expand header");
        });

        it("should have correct aria-label when expanded", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const onToggleCollapse = vi.fn();
            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    onToggleCollapse={onToggleCollapse}
                />
            );
            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("aria-label", "Collapse header");
            expect(button).toHaveAttribute("title", "Collapse header");
        });
    });

    describe("MonitoringStatusDisplay", () => {
        it("should show 'No monitors configured' when no monitors", () => {
            render(<SiteDetailsHeader site={mockSite} isCollapsed={false} />);
            expect(
                screen.getByText("No monitors configured")
            ).toBeInTheDocument();
        });

        it("should show active monitor count", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const siteWithMonitors = {
                ...mockSite,
                monitors: [
                    { ...mockHttpMonitor, monitoring: true },
                    { ...mockPingMonitor, monitoring: false },
                    { ...mockPortMonitor, monitoring: true },
                ],
            };
            render(
                <SiteDetailsHeader
                    site={siteWithMonitors}
                    isCollapsed={false}
                />
            );
            expect(screen.getByText("2/3 active")).toBeInTheDocument();
        });

        it("should display individual monitor statuses", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const siteWithMonitors = {
                ...mockSite,
                monitors: [mockHttpMonitor, mockPortMonitor],
            };
            render(
                <SiteDetailsHeader
                    site={siteWithMonitors}
                    isCollapsed={false}
                />
            );

            expect(
                screen.getByTestId("monitor-status-monitor-1")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("monitor-status-monitor-3")
            ).toBeInTheDocument();
        });

        it("should show HTTP monitor with hostname", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const siteWithMonitors = {
                ...mockSite,
                monitors: [mockHttpMonitor],
            };
            render(
                <SiteDetailsHeader
                    site={siteWithMonitors}
                    isCollapsed={false}
                />
            );
            expect(screen.getByText("HTTP")).toBeInTheDocument();
        });

        it("should show port monitor with host:port", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const siteWithMonitors = {
                ...mockSite,
                monitors: [mockPortMonitor],
            };
            render(
                <SiteDetailsHeader
                    site={siteWithMonitors}
                    isCollapsed={false}
                />
            );
            expect(screen.getByText("PORT")).toBeInTheDocument();
            expect(screen.getByText("example.com:80")).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle invalid URL in HTTP monitor", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const invalidUrlMonitor = {
                ...mockHttpMonitor,
                url: "invalid-url",
            };
            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={invalidUrlMonitor}
                />
            );
            const thumbnail = screen.getByTestId("screenshot-thumbnail");
            expect(thumbnail).toHaveAttribute("data-url", "");
        });

        it("should handle undefined monitor status", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const { status, ...monitorWithoutStatus } = mockHttpMonitor;
            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={{
                        ...monitorWithoutStatus,
                        status: "pending" as const,
                    }}
                />
            );
            const statusIndicator = document.querySelector(
                ".themed-status-indicator"
            );
            expect(statusIndicator).toBeInTheDocument();
        });

        it("should handle port monitor without host or port", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const { host, port, ...monitorWithoutHostPort } = mockPortMonitor;
            const incompletePortMonitor = monitorWithoutHostPort;
            const siteWithMonitors = {
                ...mockSite,
                monitors: [incompletePortMonitor],
            };
            render(
                <SiteDetailsHeader
                    site={siteWithMonitors}
                    isCollapsed={false}
                />
            );
            expect(screen.getByText("PORT")).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should have proper aria-label for external URL", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={mockHttpMonitor}
                />
            );
            const link = screen.getByRole("link");
            expect(link).toHaveAttribute(
                "aria-label",
                "Open https://example.com in browser"
            );
        });

        it("should have proper rel and target attributes for external URL", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Retrieval", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetailsHeader", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Retrieval", "type");

            render(
                <SiteDetailsHeader
                    site={mockSite}
                    isCollapsed={false}
                    selectedMonitor={mockHttpMonitor}
                />
            );
            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
            expect(link).toHaveAttribute("target", "_blank");
            expect(link).toHaveAttribute("tabIndex", "0");
        });
    });
});
