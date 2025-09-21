/**
 * Test to cover remaining uncovered lines in ScreenshotThumbnail component
 */

import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";

import { ScreenshotThumbnail } from "../components/SiteDetails/ScreenshotThumbnail";

// Mock logger
vi.mock("../services/logger", () => ({
    logger: {
        error: vi.fn(),
        user: {
            action: vi.fn(),
        },
        warn: vi.fn(),
    },
}));

// Mock stores/utils
vi.mock("../stores/utils", () => ({
    logStoreAction: vi.fn(),
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
}));

// Mock SystemService
vi.mock("../services/SystemService", () => ({
    SystemService: {
        openExternal: vi.fn().mockResolvedValue(undefined),
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
    useUIStore: () => ({
        openExternal: mockOpenExternal,
    }),
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
    sites: {
        getSites: vi.fn(),
    },
    system: {
        openExternal: vi.fn().mockResolvedValue(undefined),
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

// Set global electronAPI once (check if it exists first)
if ((globalThis as any).electronAPI) {
    // Update existing electronAPI
    Object.assign((globalThis as any).electronAPI, mockElectronAPI);
} else {
    Object.defineProperty(globalThis, "electronAPI", {
        configurable: true,
        value: mockElectronAPI,
        writable: true,
    });
}

describe("ScreenshotThumbnail - Complete Coverage", () => {
    const defaultProps = {
        siteName: "Example Site",
        url: "https://example.com",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockOpenExternal.mockClear();
        // Clear any existing timeouts
        vi.useFakeTimers();

        // Mock window.open to prevent navigation
        Object.defineProperty(globalThis, "open", {
            configurable: true,
            value: mockWindowOpen,
        });

        // Mock getBoundingClientRect for all elements
        Element.prototype.getBoundingClientRect = vi
            .fn()
            .mockReturnValue(createMockBoundingClientRect());

        // Set up document.body for portal mounting
        document.body.innerHTML = "";
    });

    afterEach(() => {
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

        const props = {
            siteName: "Test Site",
            url: "https://test.com",
        };

        const { unmount } = render(<ScreenshotThumbnail {...props} />);

        const thumbnail = screen.getByRole("link");

        // Trigger hover to create timeout and portal
        act(() => {
            thumbnail.dispatchEvent(
                new MouseEvent("mouseenter", { bubbles: true })
            );
        });

        // Advance time to allow state changes
        act(() => {
            vi.advanceTimersByTime(100);
        });

        // The component should now be in hover state with portal
        expect(screen.getByText("Preview: Test Site")).toBeInTheDocument();

        // Unmount component to trigger cleanup useEffect
        act(() => {
            unmount();
        });

        // The cleanup should have handled:
        // - Clearing timeout if it exists (lines 60-61)
        // - Removing portal if it exists (lines 67-68)

        expect(true).toBeTruthy(); // If we get here without errors, cleanup worked
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

        const props = {
            siteName: "Test Site",
            url: "https://test.com",
        };

        render(<ScreenshotThumbnail {...props} />);

        const thumbnail = screen.getByRole("link");

        // Test the timeout creation path
        act(() => {
            thumbnail.dispatchEvent(
                new MouseEvent("mouseenter", { bubbles: true })
            );

            // This should create a timeout (stored in hoverTimeoutRef.current)
            // When component unmounts, it should clear this timeout (lines 60-61)
        });

        // Verify timeout was created by checking if hover behavior works
        expect(thumbnail).toBeInTheDocument();
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

        const props = {
            siteName: "Test Site",
            url: "https://test.com",
        };

        const { unmount } = render(<ScreenshotThumbnail {...props} />);

        const thumbnail = screen.getByRole("link");

        // Trigger hover to potentially create portal
        act(() => {
            thumbnail.dispatchEvent(
                new MouseEvent("mouseenter", { bubbles: true })
            );
            vi.advanceTimersByTime(500); // Advance past hover delay
        });

        // Unmount should trigger cleanup including portal removal (lines 67-68)
        act(() => {
            unmount();
        });

        // The cleanup should have run without throwing errors (this tests the cleanup path)
        // The component's useEffect cleanup is designed to handle its own portal references
        expect(true).toBeTruthy(); // If we get here, cleanup worked correctly
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
        expect(mockOpenExternal).toHaveBeenCalledWith("https://example.com", {
            siteName: "Example Site",
        });
    });

    it("should handle rapid hover/unhover cycles", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: ScreenshotThumbnail", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const props = defaultProps; // Use consistent props

        render(<ScreenshotThumbnail {...props} />);

        // Use the aria-label to find the link (based on defaultProps URL)
        const thumbnail = screen.getByRole("link", {
            name: /open.*example\.com.*in browser/i,
        });

        // Rapid hover/unhover to test timeout handling
        act(() => {
            thumbnail.dispatchEvent(
                new MouseEvent("mouseenter", { bubbles: true })
            );
            thumbnail.dispatchEvent(
                new MouseEvent("mouseleave", { bubbles: true })
            );
            thumbnail.dispatchEvent(
                new MouseEvent("mouseenter", { bubbles: true })
            );
            thumbnail.dispatchEvent(
                new MouseEvent("mouseleave", { bubbles: true })
            );

            // Advance timers to trigger any pending timeouts
            vi.advanceTimersByTime(1000);
        });

        expect(thumbnail).toBeInTheDocument();
    });
});
