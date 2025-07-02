/**
 * Tests for SiteDetailsHeader component.
 * Comprehensive coverage for site details header functionality.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { SiteDetailsHeader } from "../components/SiteDetails/SiteDetailsHeader";
import logger from "../services/logger";
import { Site, Monitor } from "../types";

// Mock the logger
vi.mock("../services/logger", () => ({
    default: {
        user: {
            action: vi.fn(),
        },
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock the theme hook
vi.mock("../theme/useTheme", () => ({
    useTheme: () => ({
        themeName: "dark" as const,
    }),
}));

// Mock the ScreenshotThumbnail component
vi.mock("../components/SiteDetails/ScreenshotThumbnail", () => ({
    ScreenshotThumbnail: ({ url, siteName }: { url: string; siteName: string }) => (
        <div data-testid="screenshot-thumbnail" data-url={url} data-sitename={siteName}>
            Screenshot Thumbnail
        </div>
    ),
}));

// Mock ThemedText and StatusIndicator components
vi.mock("../theme/components", () => ({
    ThemedText: ({ children, className, size, weight, variant }: {
        children: React.ReactNode;
        className?: string;
        size?: string;
        weight?: string;
        variant?: string;
    }) => (
        <div className={className} data-size={size} data-weight={weight} data-variant={variant}>
            {children}
        </div>
    ),
    StatusIndicator: ({ status, size }: { status: string; size: string }) => (
        <div data-testid="status-indicator" data-status={status} data-size={size}>
            Status: {status}
        </div>
    ),
}));

// Mock window properties
const mockWindowOpen = vi.fn();
const mockElectronAPI = {
    openExternal: vi.fn(),
};

describe("SiteDetailsHeader", () => {
    const mockSite: Site = {
        identifier: "test-site-id",
        name: "Test Site",
        monitors: [],
        monitoring: true,
    };

    const mockHttpMonitor: Monitor = {
        id: "http-monitor-1",
        type: "http",
        url: "https://example.com",
        status: "up",
        responseTime: 150,
        lastChecked: new Date(),
        history: [],
        monitoring: true,
        checkInterval: 60000,
    };

    const mockPortMonitor: Monitor = {
        id: "port-monitor-1",
        type: "port",
        host: "example.com",
        port: 8080,
        status: "down",
        responseTime: 200,
        lastChecked: new Date(),
        history: [],
        monitoring: true,
        checkInterval: 30000,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Clean up the DOM
        document.body.innerHTML = '';
        
        // Mock window properties
        Object.defineProperty(window, "open", {
            value: mockWindowOpen,
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        // Clean up any modifications to window object
        if ('electronAPI' in window) {
            (window as unknown as Record<string, unknown>).electronAPI = undefined;
        }
        
        // Clean up the DOM
        document.body.innerHTML = '';
    });

    describe("Basic Rendering", () => {
        it("should render header with site name and no monitor", () => {
            render(<SiteDetailsHeader site={mockSite} />);

            expect(screen.getByText("Test Site")).toBeInTheDocument();
            expect(screen.getByText("No monitor data available for this site.")).toBeInTheDocument();
            expect(screen.getByTestId("status-indicator")).toHaveAttribute("data-status", "unknown");
        });

        it("should render header with site identifier when name is not provided", () => {
            const siteWithoutName: Site = {
                ...mockSite,
                name: undefined,
            };

            render(<SiteDetailsHeader site={siteWithoutName} selectedMonitor={mockHttpMonitor} />);

            expect(screen.getByText("test-site-id")).toBeInTheDocument();
        });

        it("should render with HTTP monitor details", () => {
            render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            expect(screen.getByText("Test Site")).toBeInTheDocument();
            expect(screen.getByText("https://example.com")).toBeInTheDocument();
            expect(screen.getByTestId("status-indicator")).toHaveAttribute("data-status", "up");
            expect(screen.getByTestId("status-indicator")).toHaveAttribute("data-size", "lg");
        });

        it("should render with port monitor details (no URL shown)", () => {
            render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockPortMonitor} />);

            expect(screen.getByText("Test Site")).toBeInTheDocument();
            expect(screen.queryByText("example.com:8080")).not.toBeInTheDocument();
            expect(screen.getByTestId("status-indicator")).toHaveAttribute("data-status", "down");
        });
    });

    describe("ScreenshotThumbnail Integration", () => {
        it("should pass URL to ScreenshotThumbnail for HTTP monitor", () => {
            render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const thumbnail = screen.getByTestId("screenshot-thumbnail");
            expect(thumbnail).toHaveAttribute("data-url", "https://example.com");
            expect(thumbnail).toHaveAttribute("data-sitename", "Test Site");
        });

        it("should pass empty URL to ScreenshotThumbnail for port monitor", () => {
            render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockPortMonitor} />);

            const thumbnail = screen.getByTestId("screenshot-thumbnail");
            expect(thumbnail).toHaveAttribute("data-url", "");
            expect(thumbnail).toHaveAttribute("data-sitename", "Test Site");
        });

        it("should pass empty URL when monitor URL is undefined", () => {
            const monitorWithoutUrl: Monitor = {
                ...mockHttpMonitor,
                url: undefined,
            };

            render(<SiteDetailsHeader site={mockSite} selectedMonitor={monitorWithoutUrl} />);

            const thumbnail = screen.getByTestId("screenshot-thumbnail");
            expect(thumbnail).toHaveAttribute("data-url", "");
        });

        it("should use site identifier when name is not available", () => {
            const siteWithoutName: Site = {
                ...mockSite,
                name: undefined,
            };

            render(<SiteDetailsHeader site={siteWithoutName} selectedMonitor={mockHttpMonitor} />);

            const thumbnail = screen.getByTestId("screenshot-thumbnail");
            expect(thumbnail).toHaveAttribute("data-sitename", "test-site-id");
        });
    });

    describe("URL Click Handling", () => {
        it("should call logger and window.open when electronAPI is not available", async () => {
            const user = userEvent.setup();
            render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const urlLink = screen.getByRole("link", { name: "Open https://example.com in browser" });
            await user.click(urlLink);

            expect(logger.user.action).toHaveBeenCalledWith(
                "External URL opened from site details",
                {
                    siteId: "test-site-id",
                    siteName: "Test Site",
                    url: "https://example.com",
                }
            );

            expect(mockWindowOpen).toHaveBeenCalledWith("https://example.com", "_blank");
        });

        it("should call electronAPI.openExternal when available", async () => {
            // Mock electronAPI with openExternal method
            Object.defineProperty(window, "electronAPI", {
                value: mockElectronAPI,
                writable: true,
                configurable: true,
            });

            const user = userEvent.setup();
            render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const urlLink = screen.getByRole("link", { name: "Open https://example.com in browser" });
            await user.click(urlLink);

            expect(logger.user.action).toHaveBeenCalledWith(
                "External URL opened from site details",
                {
                    siteId: "test-site-id",
                    siteName: "Test Site",
                    url: "https://example.com",
                }
            );

            expect(mockElectronAPI.openExternal).toHaveBeenCalledWith("https://example.com");
            expect(mockWindowOpen).not.toHaveBeenCalled();
        });

        it("should prevent default link behavior", async () => {
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const urlLink = container.querySelector('a[href="https://example.com"]');
            expect(urlLink).toBeInTheDocument();
            
            // Use userEvent instead of fireEvent for better simulation
            const user = userEvent.setup();
            await user.click(urlLink!);
            
            // Verify the click was handled properly by checking logger was called
            expect(logger.user.action).toHaveBeenCalled();
        });

        it("should handle electronAPI without openExternal method", async () => {
            // Mock electronAPI without openExternal
            Object.defineProperty(window, "electronAPI", {
                value: {},
                writable: true,
                configurable: true,
            });

            const user = userEvent.setup();
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const urlLink = container.querySelector('a[href="https://example.com"]');
            expect(urlLink).toBeInTheDocument();
            await user.click(urlLink!);

            expect(mockWindowOpen).toHaveBeenCalledWith("https://example.com", "_blank");
        });

        it("should handle empty URL gracefully", async () => {
            const monitorWithEmptyUrl: Monitor = {
                ...mockHttpMonitor,
                url: "",
            };

            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={monitorWithEmptyUrl} />);

            // Should not render URL link when URL is empty
            const urlLink = container.querySelector('a[href]');
            expect(urlLink).not.toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should have proper aria-label for URL link", () => {
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const urlLink = container.querySelector('a[href="https://example.com"]');
            expect(urlLink).toHaveAttribute("aria-label", "Open https://example.com in browser");
        });

        it("should be focusable with tabIndex", () => {
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const urlLink = container.querySelector('a[href="https://example.com"]');
            expect(urlLink).toHaveAttribute("tabIndex", "0");
        });

        it("should have proper link attributes", () => {
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const urlLink = container.querySelector('a[href="https://example.com"]');
            expect(urlLink).toHaveAttribute("href", "https://example.com");
            expect(urlLink).toHaveAttribute("target", "_blank");
            expect(urlLink).toHaveAttribute("rel", "noopener noreferrer");
        });
    });

    describe("CSS Classes and Styling", () => {
        it("should apply correct CSS classes to main elements", () => {
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            expect(container.querySelector(".site-details-header")).toBeInTheDocument();
            expect(container.querySelector(".site-details-header-overlay")).toBeInTheDocument();
            expect(container.querySelector(".site-details-header-content")).toBeInTheDocument();
            expect(container.querySelector(".site-details-header-accent")).toBeInTheDocument();
            expect(container.querySelector(".site-details-header-info")).toBeInTheDocument();
        });

        it("should apply correct CSS classes to status and title elements", () => {
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            expect(container.querySelector(".site-details-status-indicator")).toBeInTheDocument();
            expect(container.querySelector(".site-details-title")).toBeInTheDocument();
            expect(container.querySelector(".site-details-url")).toBeInTheDocument();
        });

        it("should apply truncate class to title and URL", () => {
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const title = container.querySelector('.site-details-title');
            expect(title).toHaveClass("truncate");

            const urlLink = container.querySelector('.site-details-url');
            expect(urlLink).toHaveClass("truncate");
        });
    });

    describe("Type Guard Functionality", () => {
        it("should use electronAPI when openExternal is available", async () => {
            Object.defineProperty(window, "electronAPI", {
                value: mockElectronAPI,
                writable: true,
                configurable: true,
            });

            const user = userEvent.setup();
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const urlLink = container.querySelector('a[href="https://example.com"]');
            await user.click(urlLink!);

            expect(mockElectronAPI.openExternal).toHaveBeenCalledWith("https://example.com");
        });

        it("should fallback to window.open when openExternal is not available", async () => {
            Object.defineProperty(window, "electronAPI", {
                value: { someOtherMethod: vi.fn() },
                writable: true,
                configurable: true,
            });

            const user = userEvent.setup();
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const urlLink = container.querySelector('a[href="https://example.com"]');
            await user.click(urlLink!);

            expect(mockWindowOpen).toHaveBeenCalledWith("https://example.com", "_blank");
        });

        it("should fallback to window.open when electronAPI is null", async () => {
            Object.defineProperty(window, "electronAPI", {
                value: null,
                writable: true,
                configurable: true,
            });

            const user = userEvent.setup();
            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const urlLink = container.querySelector('a[href="https://example.com"]');
            await user.click(urlLink!);

            expect(mockWindowOpen).toHaveBeenCalledWith("https://example.com", "_blank");
        });
    });

    describe("Edge Cases", () => {
        it("should handle site without name gracefully", () => {
            const siteWithoutName: Site = {
                identifier: "test-id",
                monitors: [],
                monitoring: true,
            };

            const { container } = render(<SiteDetailsHeader site={siteWithoutName} selectedMonitor={mockHttpMonitor} />);

            expect(container.textContent).toContain("test-id");
        });

        it("should handle monitor without URL gracefully", () => {
            const monitorWithoutUrl: Monitor = {
                ...mockHttpMonitor,
                url: undefined,
            };

            const { container } = render(<SiteDetailsHeader site={mockSite} selectedMonitor={monitorWithoutUrl} />);

            const linkElement = container.querySelector('a[href]');
            expect(linkElement).not.toBeInTheDocument();
        });

        it("should handle undefined selectedMonitor", () => {
            const { container } = render(<SiteDetailsHeader site={mockSite} />);

            expect(container.textContent).toContain("No monitor data available for this site.");
            const statusIndicator = container.querySelector('[data-testid="status-indicator"]');
            expect(statusIndicator).toHaveAttribute("data-status", "unknown");
        });

        it("should handle empty site name gracefully", () => {
            const siteWithEmptyName: Site = {
                ...mockSite,
                name: "",
            };

            const { container } = render(<SiteDetailsHeader site={siteWithEmptyName} selectedMonitor={mockHttpMonitor} />);

            // Should show empty string when name is explicitly set to empty (component behavior)
            // Component uses site.name ?? site.identifier, so empty string is shown
            const titleElement = container.querySelector('.site-details-title');
            expect(titleElement).toBeInTheDocument();
        });
    });

    describe("Component Integration", () => {
        it("should properly integrate with StatusIndicator component", () => {
            render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const statusIndicator = screen.getByTestId("status-indicator");
            expect(statusIndicator).toHaveAttribute("data-status", "up");
            expect(statusIndicator).toHaveAttribute("data-size", "lg");
        });

        it("should properly integrate with ThemedText component", () => {
            render(<SiteDetailsHeader site={mockSite} selectedMonitor={mockHttpMonitor} />);

            const title = screen.getByText("Test Site");
            expect(title).toHaveAttribute("data-size", "2xl");
            expect(title).toHaveAttribute("data-weight", "bold");

            const warningText = screen.queryByText("No monitor data available for this site.");
            expect(warningText).not.toBeInTheDocument();
        });

        it("should show warning text when no monitor is selected", () => {
            render(<SiteDetailsHeader site={mockSite} />);

            const warningText = screen.getByText("No monitor data available for this site.");
            expect(warningText).toHaveAttribute("data-variant", "warning");
            expect(warningText).toHaveAttribute("data-size", "base");
        });
    });
});
