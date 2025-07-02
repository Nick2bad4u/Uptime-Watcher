/**
 * Tests for ScreenshotThumbnail component.
 * Comprehensive coverage for screenshot thumbnail functionality.
 */

import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { ScreenshotThumbnail } from "../components/SiteDetails/ScreenshotThumbnail";
import logger from "../services/logger";

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

// Mock window properties
const mockWindowOpen = vi.fn();
const mockElectronAPI = {
    openExternal: vi.fn(),
};

// Create a mock for getBoundingClientRect
const createMockBoundingClientRect = (overrides = {}) => ({
    top: 100,
    left: 200,
    bottom: 150,
    right: 250,
    width: 50,
    height: 50,
    x: 200,
    y: 100,
    toJSON: () => ({}),
    ...overrides,
});

describe("ScreenshotThumbnail", () => {
    const defaultProps = {
        url: "https://example.com",
        siteName: "Example Site",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock window properties
        Object.defineProperty(window, 'open', {
            value: mockWindowOpen,
            writable: true,
        });
        
        Object.defineProperty(window, 'innerWidth', {
            value: 1920,
            writable: true,
        });
        
        Object.defineProperty(window, 'innerHeight', {
            value: 1080,
            writable: true,
        });

        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = vi.fn(() => createMockBoundingClientRect());
    });

    afterEach(() => {
        cleanup();
    });

    describe("Basic Rendering", () => {
        it("should render thumbnail link and image", () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link", { name: "Open https://example.com in browser" });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", "https://example.com");

            const image = screen.getByAltText("Screenshot of Example Site");
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute("loading", "lazy");

            const caption = screen.getByText("Preview: Example Site");
            expect(caption).toBeInTheDocument();
        });

        it("should generate correct Microlink API URL", () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const image = screen.getByAltText("Screenshot of Example Site");
            // The actual URL encoding will encode both colons and slashes
            const expectedUrl = "https://api.microlink.io/?url=https%3A%2F%2Fexample.com&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto";
            expect(image).toHaveAttribute("src", expectedUrl);
        });

        it("should handle special characters in URL encoding", () => {
            const propsWithSpecialChars = {
                url: "https://example.com/path?query=test&value=123",
                siteName: "Test Site",
            };
            
            render(<ScreenshotThumbnail {...propsWithSpecialChars} />);

            const image = screen.getByAltText("Screenshot of Test Site");
            const expectedUrl = "https://api.microlink.io/?url=https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dtest%26value%3D123&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto";
            expect(image).toHaveAttribute("src", expectedUrl);
        });
    });

    describe("Click Handling", () => {
        it("should call logger and window.open when electronAPI is not available", async () => {
            // Ensure electronAPI is not available
            Object.defineProperty(window, 'electronAPI', {
                value: undefined,
                writable: true,
            });

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.click(link);

            expect(logger.user.action).toHaveBeenCalledWith(
                "External URL opened from screenshot thumbnail",
                {
                    siteName: "Example Site",
                    url: "https://example.com",
                }
            );

            expect(mockWindowOpen).toHaveBeenCalledWith(
                "https://example.com",
                "_blank",
                "noopener"
            );
        });

        it("should call electronAPI.openExternal when available", async () => {
            // Mock electronAPI with openExternal method
            Object.defineProperty(window, 'electronAPI', {
                value: mockElectronAPI,
                writable: true,
            });

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.click(link);

            expect(logger.user.action).toHaveBeenCalledWith(
                "External URL opened from screenshot thumbnail",
                {
                    siteName: "Example Site",
                    url: "https://example.com",
                }
            );

            expect(mockElectronAPI.openExternal).toHaveBeenCalledWith("https://example.com");
            expect(mockWindowOpen).not.toHaveBeenCalled();
        });

        it("should prevent default link behavior", async () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            const clickEvent = new MouseEvent('click', { bubbles: true });
            const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
            
            fireEvent(link, clickEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it("should handle electronAPI without openExternal method", async () => {
            // Mock electronAPI without openExternal method
            Object.defineProperty(window, 'electronAPI', {
                value: { someOtherMethod: vi.fn() },
                writable: true,
            });

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.click(link);

            expect(mockWindowOpen).toHaveBeenCalledWith(
                "https://example.com",
                "_blank",
                "noopener"
            );
        });
    });

    describe("Hover Interactions", () => {
        it("should show overlay on hover", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.hover(link);

            await waitFor(() => {
                const overlay = document.querySelector('.site-details-thumbnail-portal-overlay');
                expect(overlay).toBeInTheDocument();
            });

            const overlayImage = document.querySelector('.site-details-thumbnail-img-portal');
            expect(overlayImage).toBeInTheDocument();
            expect(overlayImage).toHaveAttribute('alt', 'Large screenshot of Example Site');
        });

        it("should hide overlay on unhover", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            
            // Show overlay
            await user.hover(link);
            await waitFor(() => {
                expect(document.querySelector('.site-details-thumbnail-portal-overlay')).toBeInTheDocument();
            });

            // Hide overlay
            await user.unhover(link);
            await waitFor(() => {
                expect(document.querySelector('.site-details-thumbnail-portal-overlay')).not.toBeInTheDocument();
            });
        });

        it("should show overlay on focus", async () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            fireEvent.focus(link);

            await waitFor(() => {
                const overlay = document.querySelector('.site-details-thumbnail-portal-overlay');
                expect(overlay).toBeInTheDocument();
            });
        });

        it("should hide overlay on blur", async () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            
            // Show overlay
            fireEvent.focus(link);
            await waitFor(() => {
                expect(document.querySelector('.site-details-thumbnail-portal-overlay')).toBeInTheDocument();
            });

            // Hide overlay
            fireEvent.blur(link);
            await waitFor(() => {
                expect(document.querySelector('.site-details-thumbnail-portal-overlay')).not.toBeInTheDocument();
            });
        });

        it("should apply correct theme class to overlay", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.hover(link);

            await waitFor(() => {
                const overlay = document.querySelector('.site-details-thumbnail-portal-overlay');
                expect(overlay).toHaveClass('theme-dark');
            });
        });

        it("should handle rapid hover/unhover cycles without leaving stray portals", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            
            // Simulate rapid hover/unhover cycles
            for (let i = 0; i < 5; i++) {
                await user.hover(link);
                await user.unhover(link);
            }

            // After all cycles, ensure no portals remain
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(0);
            });
        });

        it("should handle rapid focus/blur cycles without leaving stray portals", async () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            
            // Simulate rapid focus/blur cycles
            for (let i = 0; i < 5; i++) {
                fireEvent.focus(link);
                fireEvent.blur(link);
            }

            // After all cycles, ensure no portals remain
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(0);
            });
        });

        it("should handle mixed hover and focus events without creating multiple portals", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            
            // Mix hover and focus events
            await user.hover(link);
            fireEvent.focus(link);
            await user.unhover(link);
            fireEvent.blur(link);

            // Should have no portals at the end
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(0);
            });
        });

        it("should maintain only one portal when multiple hover events occur", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            
            // Multiple hover events without unhover
            await user.hover(link);
            await user.hover(link);
            await user.hover(link);

            // Should only have one portal
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(1);
            });

            // Clean up
            await user.unhover(link);
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(0);
            });
        });

        it("should handle immediate hover/unhover without race conditions", async () => {
            const user = userEvent.setup({ delay: null }); // No delay for immediate interactions
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            
            // Immediate hover followed by immediate unhover
            await user.hover(link);
            await user.unhover(link);

            // Should not crash and should clean up properly
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(0);
            });
        });

        it("should clean up portal when component unmounts during hover", async () => {
            const user = userEvent.setup();
            const { unmount } = render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.hover(link);

            // Verify portal exists
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(1);
            });

            // Unmount component while hovering
            unmount();

            // Portal should be cleaned up
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(0);
            });
        });

        it("should handle window resize during hover without breaking portal", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.hover(link);

            // Verify portal exists
            await waitFor(() => {
                const overlay = document.querySelector('.site-details-thumbnail-portal-overlay');
                expect(overlay).toBeInTheDocument();
            });

            // Simulate window resize
            Object.defineProperty(window, 'innerWidth', {
                value: 800,
                writable: true,
            });
            Object.defineProperty(window, 'innerHeight', {
                value: 600,
                writable: true,
            });
            fireEvent(window, new Event('resize'));

            // Portal should still exist and be functional
            await waitFor(() => {
                const overlay = document.querySelector('.site-details-thumbnail-portal-overlay');
                expect(overlay).toBeInTheDocument();
            });

            // Clean up
            await user.unhover(link);
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(0);
            });
        });

        it("should debounce mouse leave to prevent flickering", async () => {
            const user = userEvent.setup({ delay: null });
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            
            // Hover to show overlay
            await user.hover(link);
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(1);
            });

            // Quick unhover and hover again (simulating mouse jitter)
            await user.unhover(link);
            await user.hover(link);

            // Should still have overlay (debounce should prevent hiding)
            const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
            expect(overlays).toHaveLength(1);

            // Final unhover should hide after timeout
            await user.unhover(link);
            
            // Wait for debounce timeout (100ms + buffer)
            await new Promise(resolve => setTimeout(resolve, 150));
            
            await waitFor(() => {
                const overlaysAfter = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlaysAfter).toHaveLength(0);
            });
        });

        it("should clean up portal when URL prop changes during hover", async () => {
            const user = userEvent.setup();
            const { rerender } = render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.hover(link);

            // Verify portal exists
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(1);
            });

            // Change URL prop
            rerender(<ScreenshotThumbnail {...defaultProps} url="https://newurl.com" />);

            // Portal should still be manageable
            await user.unhover(link);
            await waitFor(() => {
                const overlays = document.querySelectorAll('.site-details-thumbnail-portal-overlay');
                expect(overlays).toHaveLength(0);
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty siteName", () => {
            const propsWithEmptyName = {
                url: "https://example.com",
                siteName: "",
            };
            
            render(<ScreenshotThumbnail {...propsWithEmptyName} />);

            // Check for alt text with empty name
            const image = screen.getByRole("img");
            expect(image).toHaveAttribute("alt", "Screenshot of ");

            const caption = screen.getByText(/^Preview:\s*$/);
            expect(caption).toBeInTheDocument();
        });

        it("should handle empty URL", () => {
            const propsWithEmptyUrl = {
                url: "",
                siteName: "Test Site",
            };
            
            render(<ScreenshotThumbnail {...propsWithEmptyUrl} />);

            // Link should still be accessible even with empty href
            const link = screen.getByLabelText("Open in browser");
            expect(link).toHaveAttribute("href", "");
        });
    });

    describe("Accessibility", () => {
        it("should have proper aria-label", () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("aria-label", "Open https://example.com in browser");
        });

        it("should be focusable", () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("tabIndex", "0");
        });

        it("should have alt text for images", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const thumbnailImage = screen.getByAltText("Screenshot of Example Site");
            expect(thumbnailImage).toBeInTheDocument();

            // Show overlay to test large image alt text
            const link = screen.getByRole("link");
            await user.hover(link);

            await waitFor(() => {
                const overlayImage = document.querySelector('.site-details-thumbnail-img-portal');
                expect(overlayImage).toHaveAttribute('alt', 'Large screenshot of Example Site');
            });
        });
    });

    describe("Type Guard Functionality", () => {
        it("should use electronAPI when openExternal is available", async () => {
            const apiWithOpenExternal = {
                openExternal: vi.fn(),
            };
            
            Object.defineProperty(window, 'electronAPI', {
                value: apiWithOpenExternal,
                writable: true,
            });

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.click(link);

            // If hasOpenExternal works correctly, electronAPI.openExternal should be called
            expect(apiWithOpenExternal.openExternal).toHaveBeenCalledWith("https://example.com");
        });

        it("should fallback to window.open when openExternal is not available", async () => {
            const apiWithoutOpenExternal = {
                someOtherMethod: vi.fn(),
            };
            
            Object.defineProperty(window, 'electronAPI', {
                value: apiWithoutOpenExternal,
                writable: true,
            });

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.click(link);

            // Should fall back to window.open
            expect(mockWindowOpen).toHaveBeenCalledWith("https://example.com", "_blank", "noopener");
        });

        it("should fallback to window.open when electronAPI is null", async () => {
            Object.defineProperty(window, 'electronAPI', {
                value: null,
                writable: true,
            });

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.click(link);

            // Should fall back to window.open
            expect(mockWindowOpen).toHaveBeenCalledWith("https://example.com", "_blank", "noopener");
        });
    });
});
