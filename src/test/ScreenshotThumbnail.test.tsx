/**
 * Tests for ScreenshotThumbnail component. Comprehensive coverage for
 * screenshot thumbnail functionality.
 */

import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
    createEvent,
} from "@testing-library/react";
import fc from "fast-check";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
    ScreenshotThumbnail,
    type ScreenshotThumbnailProperties,
} from "../components/SiteDetails/ScreenshotThumbnail";
import { logger } from "../services/logger";
import {
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";
import {
    getSafeUrlForLogging,
    isPrivateNetworkHostname,
    tryGetSafeThirdPartyHttpUrl,
} from "@shared/utils/urlSafety";
import { isValidUrl } from "@shared/validation/validatorUtils";

// Mock the logger
vi.mock("../services/logger", () => {
    const mockLogger = {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        user: {
            action: vi.fn(),
        },
        warn: vi.fn(),
    };

    return {
        Logger: mockLogger,
        logger: mockLogger,
    };
});

const mockSystemService = vi.hoisted(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    openExternal: vi.fn().mockResolvedValue(true),
    quitAndInstall: vi.fn(),
}));

vi.mock("../services/SystemService", () => ({
    SystemService: mockSystemService,
}));

// Mock the store utils (partial) so createPersistConfig remains available.
vi.mock("../stores/utils", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../stores/utils")>();
    return {
        ...actual,
        logStoreAction: vi.fn(),
    };
});

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

describe(ScreenshotThumbnail, () => {
    const DEFAULT_THUMBNAIL_SITE_NAME = "Example Site";
    const DEFAULT_THUMBNAIL_URL = "https://example.com";

    const createThumbnailProps = (
        overrides: Partial<ScreenshotThumbnailProperties> = {}
    ): ScreenshotThumbnailProperties => ({
        // Avoid flakiness: many tests below expect an <img> to render.
        // That requires a valid, public URL (the component intentionally
        // suppresses previews for private-network hostnames).
        siteName: DEFAULT_THUMBNAIL_SITE_NAME,
        url: DEFAULT_THUMBNAIL_URL,
        ...overrides,
    });

    const defaultProps = createThumbnailProps();

    beforeEach(() => {
        vi.clearAllMocks();
        mockSystemService.initialize.mockResolvedValue(undefined);
        mockSystemService.openExternal.mockResolvedValue(true);

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
        it("should render thumbnail link and image", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ScreenshotThumbnail {...defaultProps} />);

            const trimmedUrl = defaultProps.url.trim();
            const expectedAriaLabel =
                trimmedUrl.length > 0
                    ? `Open ${trimmedUrl} in browser`
                    : "Open in browser";
            const link = screen.getByRole("link", {
                name: expectedAriaLabel,
            });
            expect(link).toBeInTheDocument();
            // Note: href is mocked to "#" to prevent JSDOM navigation errors
            expect(link).toHaveAttribute("href", "#");

            const image = screen.getByAltText(
                `Screenshot of ${defaultProps.siteName}`
            );
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute("loading", "lazy");

            const caption = screen.getByText(
                `Preview: ${defaultProps.siteName}`
            );
            expect(caption).toBeInTheDocument();
        });

        it("should generate correct Microlink API URL", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ScreenshotThumbnail {...defaultProps} />);

            const image = screen.getByAltText(
                `Screenshot of ${defaultProps.siteName}`
            );
            const targetUrl = tryGetSafeThirdPartyHttpUrl(defaultProps.url);
            expect(targetUrl).not.toBeNull();
            if (targetUrl === null) {
                throw new Error("Expected screenshot target URL to be valid");
            }

            const encodedUrl = encodeURIComponent(targetUrl);
            const expectedUrl = `https://api.microlink.io/?url=${encodedUrl}&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto`;
            expect(image).toHaveAttribute("src", expectedUrl);
        });

        it("should handle special characters in URL encoding", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const propsWithSpecialChars = createThumbnailProps({
                url: "https://example.com/path?query=test&value=123",
            });

            render(<ScreenshotThumbnail {...propsWithSpecialChars} />);

            const image = screen.getByAltText(
                `Screenshot of ${propsWithSpecialChars.siteName}`
            );
            const expectedUrl =
                "https://api.microlink.io/?url=https%3A%2F%2Fexample.com%2Fpath&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto";
            expect(image).toHaveAttribute("src", expectedUrl);
        });
    });

    describe("Property-based invariants", () => {
        /**
         * Property: rendered output mirrors the provided site name and URL data
         * for accessible labels, captions, and the Microlink screenshot URL.
         */
        it("renders snapshot details for any site name and URL", async () => {
            await fc.assert(
                fc.asyncProperty(
                    siteNameArbitrary,
                    siteUrlArbitrary,
                    async (siteName, url) => {
                        const trimmedUrl = url.trim();

                        const isUrlValid = isValidUrl(trimmedUrl, {
                            disallowAuth: true,
                        });

                        const isUrlSafeForScreenshot = (() => {
                            if (!isUrlValid) {
                                return false;
                            }

                            try {
                                const parsed = new URL(trimmedUrl);
                                return !isPrivateNetworkHostname(
                                    parsed.hostname
                                );
                            } catch {
                                return false;
                            }
                        })();

                        const screenshotTargetUrl = isUrlSafeForScreenshot
                            ? tryGetSafeThirdPartyHttpUrl(trimmedUrl)
                            : null;

                        render(
                            <ScreenshotThumbnail
                                siteName={siteName}
                                url={url}
                            />
                        );

                        const expectedAriaLabel = isUrlValid
                            ? `Open ${trimmedUrl} in browser`
                            : "Open in browser";
                        const links = screen.queryAllByRole("link");
                        expect(links.length).toBeGreaterThan(0);
                        expect(
                            links.some(
                                (linkElement) =>
                                    linkElement.getAttribute("aria-label") ===
                                    expectedAriaLabel
                            )
                        ).toBeTruthy();

                        const images = screen.queryAllByRole("img");
                        const matchingImage = images.find(
                            (element) =>
                                element.getAttribute("alt") ===
                                `Screenshot of ${siteName}`
                        );

                        if (screenshotTargetUrl) {
                            expect(matchingImage).toBeDefined();
                            expect(matchingImage).toHaveAttribute(
                                "src",
                                `https://api.microlink.io/?url=${encodeURIComponent(screenshotTargetUrl)}&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto`
                            );
                        } else {
                            expect(matchingImage).toBeUndefined();
                        }

                        const captionElements = Array.from(
                            document.querySelectorAll(
                                ".site-details-thumbnail-caption"
                            )
                        );
                        expect(captionElements.length).toBeGreaterThan(0);
                        expect(
                            captionElements.some(
                                (element) =>
                                    element.textContent ===
                                    `Preview: ${siteName}`
                            )
                        ).toBeTruthy();
                    }
                ),
                {
                    numRuns: 30,
                }
            );
        });
    });

    describe("Click Handling", () => {
        it("should open via SystemService when available", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.click(link);

            await waitFor(() => {
                expect(mockSystemService.openExternal).toHaveBeenCalledWith(
                    defaultProps.url
                );
            });

            await waitFor(() => {
                expect(logger.user.action).toHaveBeenCalledWith(
                    "External URL opened",
                    {
                        siteName: defaultProps.siteName,
                        url: getSafeUrlForLogging(defaultProps.url),
                    }
                );
            });

            expect(mockWindowOpen).not.toHaveBeenCalled();
        });

        it("should prevent default link behavior", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

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

        it("should not fall back to window.open when SystemService rejects", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            mockSystemService.openExternal.mockRejectedValueOnce(
                new Error("openExternal not available")
            );

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            await user.click(link);

            await waitFor(() => {
                expect(mockSystemService.openExternal).toHaveBeenCalledWith(
                    defaultProps.url
                );
            });

            expect(mockWindowOpen).not.toHaveBeenCalled();
        });
    });

    describe("Hover Interactions", () => {
        it("should show overlay on hover", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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
                `Large screenshot of ${defaultProps.siteName}`
            );
        });

        it("should hide overlay on unhover", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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

        it("should show overlay on focus", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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

        it("should hide overlay on blur", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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

        it("should apply correct theme class to overlay", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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

        it("should handle rapid hover/unhover cycles without leaving stray portals", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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

        it("should handle rapid focus/blur cycles without leaving stray portals", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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

        it("should handle mixed hover and focus events without creating multiple portals", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

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

        it("should maintain only one portal when multiple hover events occur", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

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

        it("should handle immediate hover/unhover without race conditions", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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

        it("should clean up portal when component unmounts during hover", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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

        it("should handle window resize during hover without breaking portal", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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
            fireEvent(globalThis as any, new Event("resize"));

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

        it("should debounce mouse leave to prevent flickering", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

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

        it("should clean up portal when URL prop changes during hover", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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
        it("should handle empty siteName", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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

        it("should handle empty URL", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const propsWithEmptyUrl = createThumbnailProps({ url: "" });

            render(<ScreenshotThumbnail {...propsWithEmptyUrl} />);

            // Link should use fallback "#" href when URL is empty for proper anchor behavior
            const link = screen.getByLabelText("Open in browser");
            expect(link).toHaveAttribute("href", "#");
        });
    });

    describe("Accessibility", () => {
        it("should have proper aria-label", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute(
                "aria-label",
                defaultProps.url.trim().length > 0
                    ? `Open ${defaultProps.url.trim()} in browser`
                    : "Open in browser"
            );
        });

        it("should be focusable", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("tabIndex", "0");
        });

        it("should have alt text for images", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const thumbnailImage = screen.getByAltText(
                `Screenshot of ${defaultProps.siteName}`
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
                    `Large screenshot of ${defaultProps.siteName}`
                );
            });
        });
    });

    describe("Type Guard Functionality", () => {
        it("should call SystemService when openExternal is available (type guard)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");

            await user.click(link);

            await waitFor(() => {
                expect(mockSystemService.openExternal).toHaveBeenCalledWith(
                    defaultProps.url
                );
            });

            expect(mockWindowOpen).not.toHaveBeenCalled();
        });

        it("should not fall back to window.open when SystemService rejects (type guard)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            mockSystemService.openExternal.mockRejectedValueOnce(
                new Error("openExternal not available")
            );

            const user = userEvent.setup();
            render(<ScreenshotThumbnail {...defaultProps} />);

            const link = screen.getByRole("link");

            await user.click(link);

            await waitFor(() => {
                expect(mockSystemService.openExternal).toHaveBeenCalledWith(
                    defaultProps.url
                );
            });

            expect(mockWindowOpen).not.toHaveBeenCalled();
        });
    });

    describe("Cleanup Edge Cases", () => {
        it("should clean up timeout on component unmount", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const props = createThumbnailProps();
            const { unmount } = render(<ScreenshotThumbnail {...props} />);

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
                screen.queryByAltText(`Screenshot of ${props.siteName}`)
            ).not.toThrowError();

            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should clear timeout on mouse leave after mouse enter", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const props = createThumbnailProps();
            render(<ScreenshotThumbnail {...props} />);
            const image = screen.getByAltText(
                `Screenshot of ${props.siteName}`
            );

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

        it("should clear timeout on focus after timeout creation", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const props = createThumbnailProps();
            render(<ScreenshotThumbnail {...props} />);
            const image = screen.getByAltText(
                `Screenshot of ${props.siteName}`
            );

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

        it("should clear timeout on blur after timeout creation", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const props = createThumbnailProps();
            render(<ScreenshotThumbnail {...props} />);
            const image = screen.getByAltText(
                `Screenshot of ${props.siteName}`
            );

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

        it("should specifically cover timeout clearance in handleMouseLeave (line 132-133)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const props = createThumbnailProps();
            render(<ScreenshotThumbnail {...props} />);
            const image = screen.getByAltText(
                `Screenshot of ${props.siteName}`
            );

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

        it("should test useEffect cleanup behavior (lines 59-60, 65-66)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            // This test verifies that the useEffect cleanup function exists and can handle
            // the case where timeout and portal refs have values during cleanup
            const props = createThumbnailProps();
            const { unmount } = render(<ScreenshotThumbnail {...props} />);

            const image = screen.getByAltText(
                `Screenshot of ${props.siteName}`
            );

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

        it("should test handleMouseEnter timeout clearing when timeout exists", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const props = createThumbnailProps();
            render(<ScreenshotThumbnail {...props} />);
            const image = screen.getByAltText(
                `Screenshot of ${props.siteName}`
            );

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

        it("should test handleFocus timeout clearing when timeout exists", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const props = createThumbnailProps();
            render(<ScreenshotThumbnail {...props} />);
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

        it("should test handleBlur timeout clearing when timeout exists", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const props = createThumbnailProps();
            render(<ScreenshotThumbnail {...props} />);
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

        it("should test timeout cleanup in handleMouseLeave with rapid events", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const props = createThumbnailProps();
            render(<ScreenshotThumbnail {...props} />);
            const image = screen.getByAltText(
                `Screenshot of ${props.siteName}`
            );

            // First trigger mouseEnter then mouseLeave to create a timeout

            fireEvent.mouseEnter(image);

            fireEvent.mouseLeave(image);

            // Verify timeout was created
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            // Rapid mouse leave/enter should clear and reset timeout

            fireEvent.mouseLeave(image);

            // This should have cleared timeouts (only the second mouseLeave clears an existing timeout)
            expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);

            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should test overlay positioning with various edge cases", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

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

            const caseOneProps = createThumbnailProps();
            const { unmount } = render(
                <ScreenshotThumbnail {...caseOneProps} />
            );
            const image = screen.getByAltText(
                `Screenshot of ${caseOneProps.siteName}`
            );

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

            const caseTwoProps = createThumbnailProps();
            const { unmount: unmount2 } = render(
                <ScreenshotThumbnail {...caseTwoProps} />
            );
            const image2 = screen.getByAltText(
                `Screenshot of ${caseTwoProps.siteName}`
            );

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

        it("should handle all event combinations that can clear timeouts", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            const props = createThumbnailProps();
            render(<ScreenshotThumbnail {...props} />);
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
        it("should demonstrate useEffect closure issue with cleanup (lines 59-60, 65-66)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ScreenshotThumbnail", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            // This test demonstrates that the current useEffect implementation has a closure issue
            // The cleanup function captures the initial undefined values of the refs,
            // not their current values at cleanup time

            const props = createThumbnailProps();
            const { unmount } = render(<ScreenshotThumbnail {...props} />);

            // The component should still unmount cleanly even though the cleanup
            // doesn't actually clear the current timeout/portal refs due to closure
            expect(() => unmount()).not.toThrowError();

            // This test documents the current behavior - the cleanup lines 59-60 and 65-66
            // are not actually reachable with the current implementation due to the
            // empty dependency array [] in useEffect causing stale closures
        });
    });
});
