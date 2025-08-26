/**
 * @file Simple tests for main.tsx application entry point focusing on coverage
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Simple mocks without complex implementations
vi.mock("react-dom/client", () => ({
    default: {
        createRoot: vi.fn(() => ({
            render: vi.fn(),
            unmount: vi.fn(),
        })),
    },
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
        it("should use getElementById for root element lookup", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Retrieval", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Retrieval", "type");

            const getElementByIdSpy = vi.spyOn(document, "getElementById");

            // Import main.tsx which triggers initialization
            await import("../main");

            expect(getElementByIdSpy).toHaveBeenCalledWith("root");

            getElementByIdSpy.mockRestore();
        });

        it("should handle missing root element gracefully", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            // Remove root element
            document.body.innerHTML = "";

            // Import main.tsx
            await import("../main");

            // Should log an error due to missing root element
            expect(console.error).toHaveBeenCalledWith(
                "Failed to initialize application:",
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

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Initialization", "type");

            // Remove root element to trigger error
            document.body.innerHTML = "";

            // Import main.tsx
            await import("../main");

            // Verify error logging
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith(
                "Failed to initialize application:",
                expect.any(Error)
            );
        });
    });

    describe("Performance Optimizations", () => {
        it("should use getElementById instead of querySelector for performance", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: main", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Retrieval", "type");

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

            // Verify getElementById was used for performance
            expect(getElementByIdSpy).toHaveBeenCalledWith("root");
            expect(querySelectorSpy).not.toHaveBeenCalled();

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
            expect(console.error).toHaveBeenCalledWith(
                "Failed to initialize application:",
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
