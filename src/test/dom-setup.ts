/**
 * DOM-specific setup for Vitest frontend tests Enhanced DOM environment
 * configuration for better React component testing
 */

import "@testing-library/jest-dom";
import fc from "fast-check";

// Configure fast-check for property-based testing
fc.configureGlobal({ numRuns: 10 });

// Enhanced DOM polyfills for comprehensive testing support
beforeAll(() => {
    // Mock window.matchMedia for responsive design testing
    Object.defineProperty(globalThis, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });

    // Mock IntersectionObserver for component visibility testing
    globalThis.IntersectionObserver = class MockIntersectionObserver {
        root = null;
        rootMargin = "";
        thresholds = [];

        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
            return [];
        }
    } as any;

    // Mock ResizeObserver for responsive component testing
    globalThis.ResizeObserver = class MockResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    } as any;

    // Mock requestIdleCallback for performance testing
    globalThis.requestIdleCallback = (
        callback: IdleRequestCallback
    ): number => {
        const id = setTimeout(
            () =>
                callback({
                    didTimeout: false,
                    timeRemaining: () => 50,
                }),
            1
        );
        return id as unknown as number;
    };

    globalThis.cancelIdleCallback = (id: number): void => {
        clearTimeout(id as unknown as number);
    };

    // Mock getComputedStyle for CSS-dependent tests
    globalThis.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue(""),
    });

    // Mock Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    // Mock Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
    });

    // Mock navigator properties
    Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: {
            writeText: vi.fn().mockResolvedValue(undefined),
            readText: vi.fn().mockResolvedValue(""),
        },
    });

    // Mock URL.createObjectURL
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    globalThis.URL.revokeObjectURL = vi.fn();

    // Mock File and FileReader for file upload testing
    globalThis.File = class MockFile {
        constructor(
            public chunks: any[],
            public name: string,
            public options: any = {}
        ) {}
        get size() {
            return this.chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        }
        get type() {
            return this.options.type || "";
        }
        get lastModified() {
            return this.options.lastModified || Date.now();
        }
    } as any;

    globalThis.FileReader = class MockFileReader {
        readAsDataURL = vi.fn();
        readAsText = vi.fn();
        result = "";
        onload = null;
        onerror = null;
    } as any;

    // Mock performance.now for timing tests
    globalThis.performance.now = vi.fn(() => Date.now());

    // Mock console methods to reduce test noise (optional)
    const originalConsole = { ...console };
    globalThis.console = {
        ...originalConsole,
        // Suppress console.log in tests unless specifically needed
        log: process.env["NODE_ENV"] === "test" ? vi.fn() : originalConsole.log,
        debug:
            process.env["NODE_ENV"] === "test"
                ? vi.fn()
                : originalConsole.debug,
        info: originalConsole.info,
        warn: originalConsole.warn,
        error: originalConsole.error,
    };
});

// Cleanup after each test
afterEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset DOM state
    document.body.innerHTML = "";
    document.head.innerHTML = "";
});

// Global cleanup
afterAll(() => {
    // Restore original console
    Object.assign(console, console);
});
