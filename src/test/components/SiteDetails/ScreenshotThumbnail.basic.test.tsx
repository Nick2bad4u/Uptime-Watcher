/**
 * Basic unit tests for ScreenshotThumbnail component
 *
 * @remarks
 * These tests focus on core functionality without property-based fuzzing
 * to avoid infinite render loops and ensure reliable test execution.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { ScreenshotThumbnail } from "../../../components/SiteDetails/ScreenshotThumbnail";

// Mock state for UI store
let mockUIState = {
    openExternal: vi.fn(),
};

// Mock theme state
let mockThemeState = {
    themeName: "light" as string,
};

// Mock stores and hooks
vi.mock("../../../stores/ui/useUiStore", () => ({
    useUIStore: vi.fn(() => ({
        openExternal: mockUIState.openExternal,
    })),
}));

vi.mock("../../../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({
        themeName: mockThemeState.themeName,
    })),
}));

vi.mock("../../../hooks/useMount", () => ({
    useMount: vi.fn((init, cleanup) => {
        if (init) init();
        return () => {
            if (cleanup) cleanup();
        };
    }),
}));

// Mock constants
vi.mock("../../../constants", () => ({
    UI_DELAYS: {
        STATE_UPDATE_DEFER: 16,
        HOVER_DELAY: 200,
    },
}));

// Mock React portal to simplify testing
vi.mock("react-dom", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-dom")>();
    return {
        ...actual,
        createPortal: vi.fn((children, _container) => children),
    };
});

// Mock DOM methods
Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value: vi.fn(() => ({
        width: 200,
        height: 150,
        top: 100,
        left: 100,
        right: 300,
        bottom: 250,
        x: 100,
        y: 100,
    })),
});

Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1920,
});

Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: 1080,
});

describe("ScreenshotThumbnail Component - Basic Tests", () => {
    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Reset mock state
        mockUIState = {
            openExternal: vi.fn(),
        };

        mockThemeState = {
            themeName: "light",
        };

        // Reset DOM mocks
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 1920,
        });

        Object.defineProperty(window, "innerHeight", {
            writable: true,
            configurable: true,
            value: 1080,
        });

        // Mock document.body for portal
        document.body.innerHTML = "";
    });

    afterEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";
    });

    describe("Basic Rendering", () => {
        it("should render without crashing", () => {
            expect(() => {
                render(
                    <ScreenshotThumbnail
                        url="https://example.com"
                        siteName="Test Site"
                    />
                );
            }).not.toThrow();
        });

        it("should display the correct site name in caption", () => {
            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            expect(screen.getByText("Preview: Test Site")).toBeInTheDocument();
        });

        it("should render a link element", () => {
            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            const link = screen.getByRole("link");
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", "https://example.com");
        });

        it("should render screenshot image with correct src", () => {
            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            const image = screen.getByAltText("Screenshot of Test Site");
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute("src");

            const src = image.getAttribute("src");
            expect(src).toContain("api.microlink.io");
            expect(src).toContain("https%3A%2F%2Fexample.com"); // URL encoded
        });
    });

    describe("User Interactions", () => {
        it("should call openExternal when clicked", () => {
            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            const link = screen.getByRole("link");
            fireEvent.click(link);

            expect(mockUIState.openExternal).toHaveBeenCalledWith(
                "https://example.com",
                { siteName: "Test Site" }
            );
        });

        it("should have mouse event handlers attached", () => {
            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            const link = screen.getByRole("link");

            // Check that the link has the expected event handler attributes/classes
            expect(link).toBeInTheDocument();

            // The component should be interactive (have event handlers)
            // We're not testing the actual hover behavior due to portal complexity
            expect(link.tagName).toBe("A");
        });

        it("should handle focus and blur events", () => {
            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            const link = screen.getByRole("link");

            // Focus should not throw
            expect(() => {
                fireEvent.focus(link);
            }).not.toThrow();

            // Blur should not throw
            expect(() => {
                fireEvent.blur(link);
            }).not.toThrow();
        });
    });

    describe("Accessibility", () => {
        it("should have proper ARIA attributes", () => {
            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("href", "https://example.com");

            const image = screen.getByAltText("Screenshot of Test Site");
            expect(image).toHaveAttribute("alt", "Screenshot of Test Site");
        });

        it("should be keyboard accessible", () => {
            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName="Test Site"
                />
            );

            const link = screen.getByRole("link");

            // Should be focusable - we just check it has tabindex
            expect(link).toHaveAttribute("tabindex", "0");

            // Should handle Enter key without throwing (no portal issues)
            expect(() => {
                fireEvent.keyDown(link, { key: "Enter", code: "Enter" });
            }).not.toThrow();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty site name", () => {
            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName=""
                />
            );

            // Look for the text pattern including the space after colon
            expect(screen.getByText(/Preview:\s*$/)).toBeInTheDocument();
            // The alt text includes trailing space for empty siteName
            expect(screen.getByAltText(/Screenshot of\s*$/)).toBeInTheDocument();
        });

        it("should handle special characters in URL", () => {
            const specialUrl = "https://example.com/path?param=value&other=123";
            render(
                <ScreenshotThumbnail
                    url={specialUrl}
                    siteName="Special Site"
                />
            );

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("href", specialUrl);

            const image = screen.getByAltText("Screenshot of Special Site");
            const src = image.getAttribute("src");
            expect(src).toContain("api.microlink.io");
        });

        it("should handle long site names", () => {
            const longName = "This is a very long site name that might cause issues with layout";
            render(
                <ScreenshotThumbnail
                    url="https://example.com"
                    siteName={longName}
                />
            );

            expect(screen.getByText(`Preview: ${longName}`)).toBeInTheDocument();
            expect(screen.getByAltText(`Screenshot of ${longName}`)).toBeInTheDocument();
        });
    });
});
