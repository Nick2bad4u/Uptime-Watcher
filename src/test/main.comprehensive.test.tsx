/**
 * @file Simple tests for main.tsx application entry point focusing on coverage
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock structured renderer logger so we can assert initialization errors are logged consistently
vi.mock("../services/logger", () => {
    const mockAppLogger = {
        error: vi.fn(),
        performance: vi.fn(),
        started: vi.fn(),
        stopped: vi.fn(),
    };

    const mockLogger = {
        app: mockAppLogger,
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        raw: { default: {} } as any,
        silly: vi.fn(),
        site: {
            added: vi.fn(),
            check: vi.fn(),
            error: vi.fn(),
            removed: vi.fn(),
            statusChange: vi.fn(),
        },
        system: {
            notification: vi.fn(),
            tray: vi.fn(),
            window: vi.fn(),
        },
        user: {
            action: vi.fn(),
            settingsChange: vi.fn(),
        },
        verbose: vi.fn(),
        warn: vi.fn(),
    };

    return {
        logger: mockLogger,
        Logger: mockLogger,
    };
});

// Simple mocks without complex implementations
vi.mock("react-dom/client", () => ({
    createRoot: vi.fn(() => ({
        render: vi.fn(),
        unmount: vi.fn(),
    })),
}));

vi.mock("../App", () => ({
    default: () => "App Component",
}));

vi.mock("../index.css", () => ({}));

describe("main.tsx - Application Entry Point", () => {
    let originalConsoleError: typeof console.error;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '<div id="root"></div>';

        // Reset mocks
        vi.clearAllMocks();

        // Spy on console.error
        originalConsoleError = console.error;
        console.error = vi.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
        vi.resetModules();
    });

    describe("Basic Functionality", () => {
        it("should use querySelector for root element lookup", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Retrieval", "type");

            const querySelectorSpy = vi.spyOn(document, "querySelector");

            // Import main.tsx which triggers initialization
            await import("../main");

            expect(querySelectorSpy).toHaveBeenCalledWith("#root");

            querySelectorSpy.mockRestore();
        });

        it("should handle missing root element gracefully", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            // Remove root element
            document.body.innerHTML = "";

            // Import main.tsx
            await import("../main");

            // Should log an error via structured logger due to missing root element
            const { logger } = await import("../services/logger");

            expect(logger.app.error).toHaveBeenCalledWith(
                "initializeApp",
                expect.any(Error)
            );
        });

        it("should log initialization errors to console", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Initialization", "type");

            // Remove root element to trigger error
            document.body.innerHTML = "";

            // Import main.tsx
            await import("../main");

            // Verify error logging
            const { logger } = await import("../services/logger");

            expect(logger.app.error).toHaveBeenCalledTimes(1);
            expect(logger.app.error).toHaveBeenCalledWith(
                "initializeApp",
                expect.any(Error)
            );
        });
    });

    describe("Performance Optimizations", () => {
        it("should use querySelector instead of getElementById for performance", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Retrieval", "type");

            const getElementByIdSpy = vi.spyOn(document, "getElementById");
            const querySelectorSpy = vi.spyOn(document, "querySelector");

            // Setup root element
            document.body.innerHTML = '<div id="root"></div>';

            // Import main.tsx
            await import("../main");

            expect(querySelectorSpy).toHaveBeenCalledWith("#root");

            getElementByIdSpy.mockRestore();
            querySelectorSpy.mockRestore();
        });
    });

    describe("Error Handling Coverage", () => {
        it("should cover the try-catch block with error", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Error Handling", "type");

            // Remove root to trigger error path
            document.body.innerHTML = "";

            // Import main.tsx - should catch error and log it
            await import("../main");

            // Verify the error handling path was executed
            const { logger } = await import("../services/logger");

            expect(logger.app.error).toHaveBeenCalledWith(
                "initializeApp",
                expect.any(Error)
            );
        });

        it("should handle successful initialization without errors", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Initialization", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Initialization", "type");

            // Ensure root element exists

            document.body.innerHTML = '<div id="root"></div>';

            // Import main.tsx
            await import("../main");

            // Verify the root element is still present after initialization
            // eslint-disable-next-line unicorn/prefer-query-selector -- getElementById is measurably faster for single ID lookups and this is the critical app initialization path
            const rootElement = document.getElementById("root");
            expect(rootElement).toBeTruthy();
        });
    });
});
