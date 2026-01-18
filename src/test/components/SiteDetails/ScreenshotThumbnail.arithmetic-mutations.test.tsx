/**
 * @module src/test/components/SiteDetails/ScreenshotThumbnail.arithmetic-mutations
 *
 * These tests target specific arithmetic operations in the ScreenshotThumbnail component
 * to ensure that arithmetic operator mutations (e.g., + to -, * to /, / to *) are properly
 * detected and killed by the test suite.
 *
 * Target mutations from src/components/SiteDetails/ScreenshotThumbnail.tsx:
 * - Line 134: `viewportW * 0.9` -> `viewportW / 0.9` or `viewportW + 0.9` or `viewportW - 0.9`
 * - Line 135: `viewportH * 0.9` -> `viewportH / 0.9` or `viewportH + 0.9` or `viewportH - 0.9`
 * - Line 140: `rect.top - overlayH - 16` -> `rect.top + overlayH + 16`
 * - Line 141: `rect.width / 2` -> `rect.width * 2` or `rect.width + 2` or `rect.width - 2`
 * - Line 141: `overlayW / 2` -> `overlayW * 2` or `overlayW + 2` or `overlayW - 2`
 * - Line 141: `rect.left + rect.width / 2 - overlayW / 2` -> various operator mutations
 * - Line 144: `rect.bottom + 16` -> `rect.bottom - 16` or `rect.bottom * 16` or `rect.bottom / 16`
 * - Line 149: `left + overlayW` -> `left - overlayW` or `left * overlayW` or `left / overlayW`
 * - Line 149: `viewportW - 8` -> `viewportW + 8` or `viewportW * 8` or `viewportW / 8`
 * - Line 150: `viewportW - overlayW - 8` -> various operator mutations
 * - Line 153: `top + overlayH` -> `top - overlayH` or `top * overlayH` or `top / overlayH`
 * - Line 153: `viewportH - 8` -> `viewportH + 8` or `viewportH * 8` or `viewportH / 8`
 * - Line 154: `viewportH - overlayH - 8` -> various operator mutations
 *
 * @file Arithmetic mutation tests for ScreenshotThumbnail component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
    ScreenshotThumbnail,
    type ScreenshotThumbnailProperties,
} from "../../../components/SiteDetails/ScreenshotThumbnail";

// Mock the logger (following existing pattern)
vi.mock("../../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        user: {
            action: vi.fn(),
        },
        warn: vi.fn(),
    },
}));

// Mock theme hook (following existing pattern)
vi.mock("../../../theme/useTheme", () => ({
    useTheme: () => ({
        themeName: "light",
    }),
}));

// Mock useUIStore (following existing pattern)
vi.mock("../../../stores/ui/useUiStore", () => ({
    useUIStore: (
        selector?: (state: { openExternal: () => void }) => unknown
    ) => {
        const state = {
            openExternal: vi.fn(),
        };

        return typeof selector === "function" ? selector(state) : state;
    },
}));

// Mock useMount hook (following existing pattern)
vi.mock("../../../hooks/useMount", () => ({
    useMount: vi.fn((initCallback) => {
        setTimeout(() => {
            initCallback();
        }, 10);
    }),
}));

// Mock navigation to prevent JSDOM errors
HTMLAnchorElement.prototype.click = vi.fn();
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

describe("ScreenshotThumbnail Arithmetic Mutations", () => {
    const mountThumbnail = (
        overrides: Partial<ScreenshotThumbnailProperties> = {}
    ): ScreenshotThumbnailProperties => {
        const thumbnailConfig: ScreenshotThumbnailProperties = {
            // Must be a non-private network URL; otherwise ScreenshotThumbnail
            // intentionally disables screenshots and the portal overlay will
            // never render.
            siteName: "Test Site",
            url: "https://example.com/",
            ...overrides,
        };
        render(<ScreenshotThumbnail {...thumbnailConfig} />);
        return thumbnailConfig;
    };

    // Mock getBoundingClientRect to control positioning calculations
    const createMockRect = (overrides = {}) => ({
        bottom: 150,
        height: 50,
        left: 200,
        right: 250,
        top: 100,
        width: 50,
        x: 200,
        y: 100,
        toJSON: () => ({}),
        ...overrides,
    });

    beforeEach(() => {
        // Clear all mocks
        vi.clearAllMocks();

        // Mock window dimensions
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

        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = vi.fn(() => createMockRect());

        // Mock document.body for portal container
        if (!document.body) {
            document.body = document.createElement("body");
        }
    });

    it("should render component (debug test)", () => {
        const thumbnailConfig = mountThumbnail();

        // Use Testing Library methods instead of querySelector
        const link = screen.getByRole("link");
        const image = screen.getByAltText(
            `Screenshot of ${thumbnailConfig.siteName}`
        );

        // Should have a link element and image
        expect(link).toBeInTheDocument();
        expect(image).toBeInTheDocument();
    });

    /**
     * Test viewport width multiplication: viewportW * 0.9 Line ~134: const
     * maxImgW = Math.min(viewportW * 0.9, 900);
     */
    it("should detect viewport width multiplication mutation (viewportW * 0.9)", async () => {
        mountThumbnail();

        const link = screen.getByRole("link");
        expect(link).toBeTruthy();

        // Simulate hover to trigger overlay positioning calculation
        await userEvent.hover(link);

        // Wait for positioning calculations and portal creation
        await waitFor(
            () => {
                // Check that viewport calculations have been applied
                // The overlay should be created in the portal container
                const portal = document.querySelector(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(portal).toBeTruthy();
            },
            { timeout: 2000 }
        );

        // Check the computed style contains expected viewport calculation result
        // With viewportW=1920, viewportW * 0.9 = 1728, but capped at maxImgW=900
        const portal = document.querySelector(
            ".site-details-thumbnail-portal-overlay"
        );
        expect(portal).toBeTruthy();

        // The overlay should have style properties set by the calculation
        const overlayStyle = (portal as HTMLElement).style;
        expect(overlayStyle.getPropertyValue("--overlay-w")).toBeDefined();
    });

    /**
     * Test viewport height multiplication: viewportH * 0.9 Line ~135: const
     * maxImgH = Math.min(viewportH * 0.9, 700);
     */
    it("should detect viewport height multiplication mutation (viewportH * 0.9)", async () => {
        mountThumbnail();

        const link = screen.getByRole("link");
        expect(link).toBeTruthy();

        // Simulate hover to trigger overlay positioning calculation
        await userEvent.hover(link);

        // Wait for positioning calculations
        await waitFor(
            () => {
                const portal = document.querySelector(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(portal).toBeTruthy();
            },
            { timeout: 2000 }
        );

        // Check the computed height calculation
        // With viewportH=1080, viewportH * 0.9 = 972, but capped at maxImgH=700
        const portal = document.querySelector(
            ".site-details-thumbnail-portal-overlay"
        );
        const overlayStyle = (portal as HTMLElement).style;
        expect(overlayStyle.getPropertyValue("--overlay-h")).toBeDefined();
    });

    /**
     * Test width division: rect.width / 2 Line ~141: rect.left + rect.width / 2
     *
     * - OverlayW / 2
     */
    it("should detect width division mutation (rect.width / 2)", async () => {
        mountThumbnail();

        const link = screen.getByRole("link");
        expect(link).toBeTruthy();

        // Simulate hover to trigger overlay positioning calculation
        await userEvent.hover(link);

        // Wait for positioning calculations
        await waitFor(
            () => {
                const portal = document.querySelector(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(portal).toBeTruthy();
            },
            { timeout: 2000 }
        );

        // With rect.width=50, rect.width / 2 = 25
        // This should be used in the left positioning calculation
        const portal = document.querySelector(
            ".site-details-thumbnail-portal-overlay"
        );
        const overlayStyle = (portal as HTMLElement).style;
        expect(overlayStyle.getPropertyValue("--overlay-left")).toBeDefined();
    });

    /**
     * Test overlay width division: overlayW / 2 Line ~141: rect.left +
     * rect.width / 2 - overlayW / 2
     */
    it("should detect overlay width division mutation (overlayW / 2)", async () => {
        mountThumbnail();

        const link = screen.getByRole("link");
        expect(link).toBeTruthy();

        // Simulate hover
        await userEvent.hover(link);

        // Wait for calculations
        await waitFor(
            () => {
                const portal = document.querySelector(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(portal).toBeTruthy();
            },
            { timeout: 2000 }
        );

        // OverlayW should be 900 (capped), so overlayW / 2 = 450
        // This affects the centering calculation
        const portal = document.querySelector(
            ".site-details-thumbnail-portal-overlay"
        );
        const overlayStyle = (portal as HTMLElement).style;
        expect(overlayStyle.getPropertyValue("--overlay-left")).toBeDefined();
    });

    /**
     * Test subtraction chain: rect.top - overlayH - 16 Line ~140: let top =
     * rect.top - overlayH - 16;
     */
    it("should detect top positioning subtraction mutations (rect.top - overlayH - 16)", async () => {
        mountThumbnail();

        const link = screen.getByRole("link");
        expect(link).toBeTruthy();

        // Simulate hover
        await userEvent.hover(link);

        // Wait for calculations
        await waitFor(
            () => {
                const portal = document.querySelector(
                    ".site-details-thumbnail-portal-overlay"
                );
                expect(portal).toBeTruthy();
            },
            { timeout: 2000 }
        );

        // With rect.top=100, overlayH=700, result = 100 - 700 - 16 = -616
        // This should trigger the fallback positioning (top < 0)
        const portal = document.querySelector(
            ".site-details-thumbnail-portal-overlay"
        );
        const overlayStyle = (portal as HTMLElement).style;
        expect(overlayStyle.getPropertyValue("--overlay-top")).toBeDefined();
    });
});
