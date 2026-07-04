/**
 * Test to cover remaining uncovered lines in ScreenshotThumbnail component
 */

import {
    sampleOne,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    ScreenshotThumbnail,
    type ScreenshotThumbnailProperties,
} from "../components/SiteDetails/ScreenshotThumbnail";
import { installElectronApiMock } from "./utils/electronApiMock";

// Mock logger
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

// Mock stores/utils
vi.mock("../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

// Mock SystemService
vi.mock("../services/SystemService", () => ({
    SystemService: {
        openExternal: vi.fn().mockResolvedValue(true),
    },
}));

// Mock useTheme hook
vi.mock("../theme/useTheme", () => ({
    useTheme: () => ({
        themeName: "dark" as const,
    }),
}));

// Mock the services and stores
const mockOpenExternal = vi.fn();

// Mock useUIStore hook
vi.mock("../stores/ui/useUiStore", () => ({
    useUIStore: (
        selector?: (state: { openExternal: typeof mockOpenExternal }) => unknown
    ) => {
        const state = {
            openExternal: mockOpenExternal,
        };

        return typeof selector === "function" ? selector(state) : state;
    },
}));

// Mock useMount hook
vi.mock("../hooks/useMount", () => {
    const calledCallbacks = new WeakSet();
    return {
        useMount: vi.fn(
            (callback: () => void, cleanupCallback?: () => void) => {
                // Only call the callback once per component instance to avoid infinite loops
                // This simulates the real useMount behavior
                if (!calledCallbacks.has(callback)) {
                    calledCallbacks.add(callback);
                    callback();
                }
                // Return cleanup function if provided (for testing unmount behavior)
                return cleanupCallback;
            }
        ),
    };
});

// Prevent JSDOM navigation errors by mocking HTMLAnchorElement.prototype.click
vi.spyOn(HTMLAnchorElement.prototype, "click").mockReturnValue(undefined);

// Mock the anchor element href setter to use hash URLs to prevent JSDOM navigation errors
const originalSetAttribute = Element.prototype.setAttribute;
Element.prototype.setAttribute = function (name: string, value: string) {
    if (
        this instanceof HTMLAnchorElement &&
        name === "href" &&
        value.startsWith("http")
    ) {
        // Use a hash URL instead of the actual URL to prevent JSDOM navigation
        originalSetAttribute.call(this, name, "#");
        return;
    }
    originalSetAttribute.call(this, name, value);
};

// Mock window properties
const mockWindowOpen = vi.fn();
const mockElectronAPI = {
    sites: {
        getSites: vi.fn(),
    },
    system: {
        openExternal: vi.fn().mockResolvedValue(true),
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

let restoreElectronApi: (() => void) | undefined;

describe("ScreenshotThumbnail - Complete Coverage", () => {
    const createProps = (
        overrides: Partial<ScreenshotThumbnailProperties> = {}
    ): ScreenshotThumbnailProperties => ({
        siteName: sampleOne(siteNameArbitrary),
        url: sampleOne(siteUrlArbitrary),
        ...overrides,
    });

    const defaultProps = createProps();

    beforeEach(() => {
        vi.clearAllMocks();
        mockOpenExternal.mockClear();

        ({ restore: restoreElectronApi } =
            installElectronApiMock(mockElectronAPI));
        // Clear any existing timeouts
        vi.useFakeTimers();

        // Mock window.open to prevent navigation
        Object.defineProperty(globalThis, "open", {
            configurable: true,
            value: mockWindowOpen,
        });

        // Mock getBoundingClientRect for all elements
        vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(
            createMockBoundingClientRect()
        );

        // Set up document.body for portal mounting
        document.body.replaceChildren();
    });

    afterEach(() => {
        restoreElectronApi?.();
        restoreElectronApi = undefined;
        vi.useRealTimers();
    });

    it("should handle cleanup with current timeout and portal removal (lines 60-61, 67-68)", ({
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

        const props = createProps({
            url: "https://example.com",
        });

        const { unmount } = render(<ScreenshotThumbnail {...props} />);

        const thumbnail = screen.getByRole("link");

        // Trigger leave to create a pending timeout that unmount cleanup clears.
        fireEvent.mouseEnter(thumbnail);
        fireEvent.mouseLeave(thumbnail);

        expect(vi.getTimerCount()).toBeGreaterThan(0);

        // Unmount component to trigger cleanup useEffect
        act(() => {
            unmount();
        });

        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("should handle hover timeout creation and cleanup", ({
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

        const props = createProps({
            url: "https://example.com",
        });
        const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

        render(<ScreenshotThumbnail {...props} />);

        const thumbnail = screen.getByRole("link");
        const initialTimerCount = vi.getTimerCount();

        // Test the timeout creation path
        fireEvent.mouseEnter(thumbnail);
        fireEvent.mouseLeave(thumbnail);

        expect(vi.getTimerCount()).toBeGreaterThan(initialTimerCount);

        fireEvent.mouseEnter(thumbnail);

        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(initialTimerCount);
    });

    it("should handle portal cleanup on unmount", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: ScreenshotThumbnail", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: ScreenshotThumbnail", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const props = createProps({
            url: "https://example.com",
        });

        const { unmount } = render(<ScreenshotThumbnail {...props} />);

        const thumbnail = screen.getByRole("link");

        // Trigger hover to potentially create portal
        fireEvent.mouseEnter(thumbnail);
        act(() => {
            vi.advanceTimersByTime(500); // Advance past hover delay
        });

        // Unmount should trigger cleanup including portal removal (lines 67-68)
        act(() => {
            unmount();
        });

        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("should handle click event and log user action", async ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: ScreenshotThumbnail", "component");
        annotate("Category: Core", "category");
        annotate("Type: Event Processing", "type");

        const props = defaultProps;

        render(<ScreenshotThumbnail {...props} />);

        const thumbnail = screen.getByRole("link");

        // Use fireEvent instead of userEvent to avoid timer complications
        fireEvent.click(thumbnail);

        // Verify UI store openExternal was called with correct arguments
        expect(mockOpenExternal).toHaveBeenCalledWith(props.url, {
            siteName: props.siteName,
        });
    });

    it("should handle rapid hover/unhover cycles", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: ScreenshotThumbnail", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const props = defaultProps; // Use consistent props
        const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

        render(<ScreenshotThumbnail {...props} />);

        const trimmedUrl = defaultProps.url.trim();
        const thumbnail = screen.getByRole("link", {
            name:
                trimmedUrl.length > 0
                    ? `Open ${trimmedUrl} in browser`
                    : "Open in browser",
        });

        // Rapid hover/unhover to test timeout handling
        fireEvent.mouseEnter(thumbnail);
        fireEvent.mouseLeave(thumbnail);
        fireEvent.mouseEnter(thumbnail);
        fireEvent.mouseLeave(thumbnail);

        act(() => {
            // Advance timers to trigger any pending timeouts
            vi.advanceTimersByTime(1000);
        });

        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(
            screen.queryByAltText(`Large screenshot of ${props.siteName}`)
        ).not.toBeInTheDocument();
    });
});
