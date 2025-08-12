/**
 * Tests for ScreenshotThumbnail component.
 * Comprehensive coverage for screenshot thumbnail functionality.
 */

import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
    createEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { ScreenshotThumbnail } from "../components/SiteDetails/ScreenshotThumbnail";
import logger from "../services/logger";

// Mock the logger
vi.mock("../services/logger", () => ({
    default: {
        error: vi.fn(),
        user: {
            action: vi.fn(),
        },
        warn: vi.fn(),
    },
}));

// Mock the theme hook
vi.mock("../theme/useTheme", () => ({
    useTheme: () => ({
        themeName: "dark" as const,
    }),
}));

// Prevent JSDOM navigation errors by mocking HTMLAnchorElement.prototype.click
HTMLAnchorElement.prototype.click = vi.fn();

// Mock the anchor element href setter to use hash URLs to prevent JSDOM navigation errors
const originalSetAttribute = Element.prototype.setAttribute;
Element.prototype.setAttribute = function (name: string, value: string) {
    if (
        this instanceof HTMLAnchorElement &&
        name === "href" &&
        value.startsWith("http")
    ) {
        // Use a hash URL instead of the actual URL to prevent JSDOM navigation
        return originalSetAttribute.call(this, name, "#");
    }
    return originalSetAttribute.call(this, name, value);
};

// Mock window properties
const mockWindowOpen = vi.fn();
const mockElectronAPI = {
    system: {
        openExternal: vi.fn(),
    },
};

// Create a mock for getBoundingClientRect
const createMockBoundingClientRect = (overrides = {}) => ({
    bottom: 150,
    height: 50,
    left: 200,
    right: 250,
    toJSON: () => ({}),
    top: 100,
    width: 50,
    x: 200,
    y: 100,
    ...overrides,
});

describe("ScreenshotThumbnail", () => {
    const defaultProps = {
        siteName: "Example Site",
        url: "https://example.com",
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock window.open to prevent navigation
        Object.defineProperty(globalThis, "open", {
            configurable: true,
            value: mockWindowOpen,
        });

        // Mock ElementInternals for the anchor element
        Element.prototype.getBoundingClientRect = vi
            .fn()
            .mockImplementation(() => createMockBoundingClientRect());

        // Mock location methods to prevent navigation errors in JSDOM
        Object.defineProperty(globalThis, "location", {
            configurable: true,
            value: {
                assign: vi.fn(),
                href: "http://localhost/",
                reload: vi.fn(),
                replace: vi.fn(),
            },
        });

        // Use a simpler approach for defaultPrevented
        const preventDefault = Event.prototype.preventDefault;
        Event.prototype.preventDefault = vi.fn(function (this: Event) {
            preventDefault.call(this);
            // Track defaultPrevented state using a spy
            vi.spyOn(this, "defaultPrevented", "get").mockReturnValue(true);
        });

        Object.defineProperty(globalThis, "innerWidth", {
            value: 1920,
            writable: true,
        });

        Object.defineProperty(globalThis, "innerHeight", {
            value: 1080,
            writable: true,
        });

        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = vi.fn(() =>
            createMockBoundingClientRect()
        );
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Basic Rendering", () => {
        it("should render thumbnail link and image", () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link", {
                name: "Open https://example.com in browser",
            });
            expect(link).toBeInTheDocument();
            // Note: href is mocked to "#" to prevent JSDOM navigation errors
            expect(link).toHaveAttribute("href", "#");

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
            const expectedUrl =
                "https://api.microlink.io/?url=https%3A%2F%2Fexample.com&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto";
            expect(image).toHaveAttribute("src", expectedUrl);
        });

        it("should handle special characters in URL encoding", () => {
            const propsWithSpecialChars = {
                siteName: "Test Site",
                url: "https://example.com/path?query=test&value=123",
            };

            render(<ScreenshotThumbnail {...propsWithSpecialChars} />);

            const image = screen.getByAltText("Screenshot of Test Site");
            const expectedUrl =
                "https://api.microlink.io/?url=https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dtest%26value%3D123&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto";
            expect(image).toHaveAttribute("src", expectedUrl);
        });
    });

    describe("Click Handling", () => {
        it("should call electronAPI.openExternal when available", async () => {
            // Mock electronAPI with openExternal method
            Object.defineProperty(globalThis, "electronAPI", {
                value: mockElectronAPI,
                writable: true,
            });

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.click(link);

            expect(logger.user.action).toHaveBeenCalledWith(
                "External URL opened",
                {
                    siteName: "Example Site",
                    url: "https://example.com",
                }
            );

            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                "https://example.com"
            );
            expect(mockWindowOpen).not.toHaveBeenCalled();
        });

        it("should prevent default link behavior", () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");

            // Create a click event with preventDefault spy
            const clickEvent = createEvent.click(link);
            const preventDefaultSpy = vi.fn();
            Object.defineProperty(clickEvent, "preventDefault", {
                value: preventDefaultSpy,
            });

            // Directly dispatch the event to the link
            link.dispatchEvent(clickEvent);

            // Verify preventDefault was called
            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it("should handle electronAPI without openExternal method", () => {
            // Mock electronAPI without system.openExternal that throws an error
            Object.defineProperty(globalThis, "electronAPI", {
                value: {
                    system: {
                        openExternal: vi.fn().mockImplementation(() => {
                            throw new Error("openExternal not available");
                        }),
                    },
                },
                writable: true,
            });

            // Mock window.open function directly
            vi.spyOn(globalThis, "open").mockImplementation(mockWindowOpen);

            // Render the component
            render(<ScreenshotThumbnail {...defaultProps} />);

            // Find the link element
            const link = screen.getByRole("link");

            // Create a click event with preventDefault
            const clickEvent = createEvent.click(link);
            Object.defineProperty(clickEvent, "preventDefault", {
                value: vi.fn(),
            });

            // Directly dispatch the event
            link.dispatchEvent(clickEvent);

            // Verify window.open was called with the correct parameters (due to fallback)
            expect(mockWindowOpen).toHaveBeenCalledWith(
                "https://example.com",
                "_blank",
                "noopener"
            );
        });
    });

    describe("Hover Interactions", () => {
        it("should show overlay on hover", async () => {
            // Render our component with hover tracking enabled
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");

            // Use testing-library's built-in hover functionality
            // Using fireEvent instead of userEvent to avoid navigation issues
            fireEvent.mouseEnter(link);

            // Check that the overlay appears
            await waitFor(() => {
                const overlay = document.querySelector(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlay).toBeInTheDocument();
            });

            const overlayImage = document.querySelector(
                ".site-details-thumbnail-img-portal"
            );
            expect(overlayImage).toBeInTheDocument();
            expect(overlayImage).toHaveAttribute(
                "alt",
                "Large screenshot of Example Site"
            );
        });

        it("should hide overlay on unhover", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");

            // Show overlay
            await user.hover(link);
            await waitFor(() => {
                expect(
                    document.querySelector(
                        ".site-details-thumbnail-portal-overlay"
                    )
                ).toBeInTheDocument();
            });

            // Hide overlay
            await user.unhover(link);
            await waitFor(() => {
                expect(
                    document.querySelector(
                        ".site-details-thumbnail-portal-overlay"
                    )
                ).not.toBeInTheDocument();
            });
        });

        it("should show overlay on focus", async () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            fireEvent.focus(link);

            await waitFor(() => {
                const overlay = document.querySelector(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlay).toBeInTheDocument();
            });
        });

        it("should hide overlay on blur", async () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");

            // Show overlay
            fireEvent.focus(link);
            await waitFor(() => {
                expect(
                    document.querySelector(
                        ".site-details-thumbnail-portal-overlay"
                    )
                ).toBeInTheDocument();
            });

            // Hide overlay
            fireEvent.blur(link);
            await waitFor(() => {
                expect(
                    document.querySelector(
                        ".site-details-thumbnail-portal-overlay"
                    )
                ).not.toBeInTheDocument();
            });
        });

        it("should apply correct theme class to overlay", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.hover(link);

            await waitFor(() => {
                const overlay = document.querySelector(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlay).toHaveClass("theme-dark");
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
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
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
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
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
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
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
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlays).toHaveLength(1);
            });

            // Clean up
            await user.unhover(link);
            await waitFor(() => {
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
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
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlays).toHaveLength(0);
            });
        });

        it("should clean up portal when component unmounts during hover", async () => {
            const user = userEvent.setup();
            const { unmount } = render(
                <ScreenshotThumbnail {...defaultProps} />
            );

            const link = screen.getByRole("link");
            await user.hover(link);

            // Verify portal exists
            await waitFor(() => {
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlays).toHaveLength(1);
            });

            // Unmount component while hovering
            unmount();

            // Portal should be cleaned up
            await waitFor(() => {
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
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
                const overlay = document.querySelector(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlay).toBeInTheDocument();
            });

            // Simulate window resize
            Object.defineProperty(globalThis, "innerWidth", {
                value: 800,
                writable: true,
            });
            Object.defineProperty(globalThis, "innerHeight", {
                value: 600,
                writable: true,
            });
            fireEvent(globalThis, new Event("resize"));

            // Portal should still exist and be functional
            await waitFor(() => {
                const overlay = document.querySelector(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlay).toBeInTheDocument();
            });

            // Clean up
            await user.unhover(link);
            await waitFor(() => {
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlays).toHaveLength(0);
            });
        });

        // Helper function to create delay
        const createDelay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        it("should debounce mouse leave to prevent flickering", async () => {
            const user = userEvent.setup({ delay: null });
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");

            // Hover to show overlay
            await user.hover(link);
            await waitFor(() => {
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlays).toHaveLength(1);
            });

            // Quick unhover and hover again (simulating mouse jitter)
            await user.unhover(link);
            await user.hover(link);

            // Should still have overlay (debounce should prevent hiding)
            const overlays = document.querySelectorAll(
                ".site-details-thumbnail-portal-overlay"
            );
            expect(overlays).toHaveLength(1);

            // Final unhover should hide after timeout
            await user.unhover(link);

            // Wait for debounce timeout (100ms + buffer) - wrap in act to handle state updates
            await act(async () => {
                await createDelay(150);
            });

            await waitFor(() => {
                const overlaysAfter = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlaysAfter).toHaveLength(0);
            });
        });

        it("should clean up portal when URL prop changes during hover", async () => {
            const user = userEvent.setup();
            const { rerender } = render(
                <ScreenshotThumbnail {...defaultProps} />
            );

            const link = screen.getByRole("link");
            await user.hover(link);

            // Verify portal exists
            await waitFor(() => {
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlays).toHaveLength(1);
            });

            // Change URL prop
            rerender(
                <ScreenshotThumbnail
                    {...defaultProps}
                    url="https://newurl.com"
                />
            );

            // Portal should still be manageable
            await user.unhover(link);
            await waitFor(() => {
                const overlays = document.querySelectorAll(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(overlays).toHaveLength(0);
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty siteName", () => {
            const propsWithEmptyName = {
                siteName: "",
                url: "https://example.com",
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
                siteName: "Test Site",
                url: "",
            };

            render(<ScreenshotThumbnail {...propsWithEmptyUrl} />);

            // Link should still be accessible with empty href (not converted to hash since it doesn't start with http)
            const link = screen.getByLabelText("Open in browser");
            expect(link).toHaveAttribute("href", "");
        });
    });

    describe("Accessibility", () => {
        it("should have proper aria-label", () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute(
                "aria-label",
                "Open https://example.com in browser"
            );
        });

        it("should be focusable", () => {
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("tabIndex", "0");
        });

        it("should have alt text for images", async () => {
            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const thumbnailImage = screen.getByAltText(
                "Screenshot of Example Site"
            );
            expect(thumbnailImage).toBeInTheDocument();

            // Show overlay to test large image alt text
            const link = screen.getByRole("link");
            await user.hover(link);

            await waitFor(() => {
                const overlayImage = document.querySelector(
                    ".site-details-thumbnail-img-portal"
                );
                expect(overlayImage).toHaveAttribute(
                    "alt",
                    "Large screenshot of Example Site"
                );
            });
        });
    });

    describe("Type Guard Functionality", () => {
        it("should use electronAPI when openExternal is available", () => {
            const apiWithOpenExternal = {
                system: {
                    openExternal: vi.fn(),
                },
            };

            Object.defineProperty(globalThis, "electronAPI", {
                value: apiWithOpenExternal,
                writable: true,
            });

            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");

            // Use fireEvent instead of userEvent to avoid JSDOM navigation errors

            fireEvent.click(link);

            // If hasOpenExternal works correctly, electronAPI.openExternal should be called
            expect(
                apiWithOpenExternal.system.openExternal
            ).toHaveBeenCalledWith("https://example.com");
        });

        it("should fallback to window.open when openExternal is not available", () => {
            const apiWithoutOpenExternal = {
                system: {
                    openExternal: vi.fn().mockImplementation(() => {
                        throw new Error("openExternal not available");
                    }),
                },
            };

            Object.defineProperty(globalThis, "electronAPI", {
                value: apiWithoutOpenExternal,
                writable: true,
            });

            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");

            // Use fireEvent with preventDefault to avoid JSDOM navigation errors
            const clickEvent = createEvent.click(link);

            fireEvent(link, clickEvent);

            // Should fall back to window.open
            expect(mockWindowOpen).toHaveBeenCalledWith(
                "https://example.com",
                "_blank",
                "noopener"
            );
        });
    });

    describe("Cleanup Edge Cases", () => {
        it("should clean up timeout on component unmount", () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const { unmount } = render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            const link = screen.getByRole("link");

            // Trigger mouse enter then mouse leave to create timeout

            fireEvent.mouseEnter(link);

            fireEvent.mouseLeave(link);

            // Verify timeout was created
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            // Unmount while timeout is pending
            unmount();

            // The cleanup should happen through the useEffect cleanup
            expect(() =>
                screen.queryByAltText("Screenshot of Test Site")
            ).not.toThrow();

            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should clear timeout on mouse leave after mouse enter", () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );
            const image = screen.getByAltText("Screenshot of Test Site");

            // First hover then leave to create timeout

            fireEvent.mouseEnter(image);

            fireEvent.mouseLeave(image);

            // Verify timeout was created
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            // Hover again to trigger timeout clearing

            fireEvent.mouseEnter(image);

            expect(clearTimeoutSpy).toHaveBeenCalled();
            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should clear timeout on focus after timeout creation", () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );
            const image = screen.getByAltText("Screenshot of Test Site");

            // First hover then leave to create timeout

            fireEvent.mouseEnter(image);

            fireEvent.mouseLeave(image);

            // Verify timeout was created
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            // Focus to trigger timeout clearing
            fireEvent.focus(image);

            expect(clearTimeoutSpy).toHaveBeenCalled();
            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should clear timeout on blur after timeout creation", () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );
            const image = screen.getByAltText("Screenshot of Test Site");

            // First hover then leave to create timeout

            fireEvent.mouseEnter(image);

            fireEvent.mouseLeave(image);

            // Verify timeout was created
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            // Blur to trigger timeout clearing
            fireEvent.blur(image);

            expect(clearTimeoutSpy).toHaveBeenCalled();
            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should specifically cover timeout clearance in handleMouseLeave (line 132-133)", () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );
            const image = screen.getByAltText("Screenshot of Test Site");

            // First mouse enter/leave to create initial timeout

            fireEvent.mouseEnter(image);

            fireEvent.mouseLeave(image);

            // Verify timeout was created
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            // Second mouse leave while timeout exists - should clear existing timeout first

            fireEvent.mouseLeave(image);

            // This should have called clearTimeout for the existing timeout before setting new one
            expect(clearTimeoutSpy).toHaveBeenCalled();

            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should test useEffect cleanup behavior (lines 59-60, 65-66)", () => {
            // This test verifies that the useEffect cleanup function exists and can handle
            // the case where timeout and portal refs have values during cleanup
            const { unmount } = render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            const image = screen.getByAltText("Screenshot of Test Site");

            // Create hover state to trigger portal creation

            fireEvent.mouseEnter(image); // Creates portal

            // Verify portal exists
            expect(
                document.querySelector(".site-details-thumbnail-portal-overlay")
            ).toBeInTheDocument();

            // Unmount component to trigger useEffect cleanup
            // The cleanup will handle the portal cleanup (lines 65-66)
            unmount();

            // Verify portal is cleaned up after unmount
            expect(
                document.querySelector(".site-details-thumbnail-portal-overlay")
            ).not.toBeInTheDocument();
        });

        it("should test handleMouseEnter timeout clearing when timeout exists", () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );
            const image = screen.getByAltText("Screenshot of Test Site");

            // Create timeout with mouse leave

            fireEvent.mouseEnter(image);

            fireEvent.mouseLeave(image);

            // Verify timeout exists
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            // Mouse enter again should clear existing timeout

            fireEvent.mouseEnter(image);

            expect(clearTimeoutSpy).toHaveBeenCalled();

            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should test handleFocus timeout clearing when timeout exists", () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );
            const link = screen.getByRole("link");

            // Create timeout with mouse leave

            fireEvent.mouseEnter(link);

            fireEvent.mouseLeave(link);

            // Verify timeout exists
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            // Focus should clear existing timeout
            fireEvent.focus(link);

            expect(clearTimeoutSpy).toHaveBeenCalled();

            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should test handleBlur timeout clearing when timeout exists", () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );
            const link = screen.getByRole("link");

            // Create timeout with mouse leave

            fireEvent.mouseEnter(link);

            fireEvent.mouseLeave(link);

            // Verify timeout exists
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            // Blur should clear existing timeout
            fireEvent.blur(link);

            expect(clearTimeoutSpy).toHaveBeenCalled();

            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should test timeout cleanup in handleMouseLeave with rapid events", () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );
            const image = screen.getByAltText("Screenshot of Test Site");

            // First trigger mouseEnter then mouseLeave to create a timeout

            fireEvent.mouseEnter(image);

            fireEvent.mouseLeave(image);

            // Verify timeout was created
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            // Rapid mouse leave/enter should clear and reset timeout

            fireEvent.mouseLeave(image);

            // This should have cleared timeouts (multiple clearTimeout calls are expected)
            expect(clearTimeoutSpy).toHaveBeenCalledTimes(2);

            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should test overlay positioning with various edge cases", () => {
            // Test case 1: Element near top-left corner
            const mockRect1 = {
                bottom: 60,
                height: 50,
                left: 10,
                right: 60,
                toJSON() {
                    return {};
                },
                top: 10,
                width: 50,
                x: 10,
                y: 10,
            };
            Element.prototype.getBoundingClientRect = vi.fn(() => mockRect1);

            Object.defineProperty(globalThis, "innerWidth", {
                value: 1920,
                writable: true,
            });
            Object.defineProperty(globalThis, "innerHeight", {
                value: 1080,
                writable: true,
            });

            const { unmount } = render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site 1"
                />
            );
            const image = screen.getByAltText("Screenshot of Test Site 1");

            // Hover to trigger overlay

            fireEvent.mouseEnter(image);

            const overlay = document.querySelector(
                ".site-details-thumbnail-portal-overlay"
            );
            expect(overlay).toBeInTheDocument();

            unmount();

            // Test case 2: Element near bottom-right corner
            const mockRect2 = {
                bottom: 1050,
                height: 50,
                left: 1800,
                right: 1850,
                toJSON() {
                    return {};
                },
                top: 1000,
                width: 50,
                x: 1800,
                y: 1000,
            };
            Element.prototype.getBoundingClientRect = vi.fn(() => mockRect2);

            const { unmount: unmount2 } = render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site 2"
                />
            );
            const image2 = screen.getByAltText("Screenshot of Test Site 2");

            // Hover to trigger overlay

            fireEvent.mouseEnter(image2);

            const overlay2 = document.querySelector(
                ".site-details-thumbnail-portal-overlay"
            );
            expect(overlay2).toBeInTheDocument();

            unmount2();

            // Restore defaults
            Element.prototype.getBoundingClientRect = vi.fn(() =>
                createMockBoundingClientRect()
            );
        });

        it("should handle all event combinations that can clear timeouts", () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );
            const link = screen.getByRole("link");

            // Test sequence: enter -> leave -> enter (should clear timeout)

            fireEvent.mouseEnter(link);

            fireEvent.mouseLeave(link);
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            fireEvent.mouseEnter(link); // Should clear timeout
            expect(clearTimeoutSpy).toHaveBeenCalled();

            clearTimeoutSpy.mockClear();

            // Test sequence: enter -> leave -> focus (should clear timeout)

            fireEvent.mouseLeave(link);
            expect(vi.getTimerCount()).toBeGreaterThan(0);
            fireEvent.focus(link); // Should clear timeout
            expect(clearTimeoutSpy).toHaveBeenCalled();

            clearTimeoutSpy.mockClear();

            // Test sequence: enter -> leave -> blur (should clear timeout)

            fireEvent.mouseLeave(link);
            expect(vi.getTimerCount()).toBeGreaterThan(0);
            fireEvent.blur(link); // Should clear timeout
            expect(clearTimeoutSpy).toHaveBeenCalled();

            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });
    });

    describe("Closure Issues", () => {
        it("should demonstrate useEffect closure issue with cleanup (lines 59-60, 65-66)", () => {
            // This test demonstrates that the current useEffect implementation has a closure issue
            // The cleanup function captures the initial undefined values of the refs,
            // not their current values at cleanup time

            const { unmount } = render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            // The component should still unmount cleanly even though the cleanup
            // doesn't actually clear the current timeout/portal refs due to closure
            expect(() => unmount()).not.toThrow();

            // This test documents the current behavior - the cleanup lines 59-60 and 65-66
            // are not actually reachable with the current implementation due to the
            // empty dependency array [] in useEffect causing stale closures
        });
    });
});
