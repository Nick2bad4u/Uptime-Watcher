/**
 * @fileoverview Comprehensive tests for main.tsx application entry point
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import ReactDOM from "react-dom/client";

// Mock ReactDOM.createRoot properly
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
    render: mockRender,
    unmount: vi.fn(),
}));

vi.mock("react-dom/client", () => ({
    default: {
        createRoot: mockCreateRoot,
    },
}));

// Mock App component
vi.mock("../App", () => ({
    default: () => React.createElement("div", { "data-testid": "app" }, "Mocked App"),
}));

// Mock CSS import
vi.mock("../index.css", () => ({}));

describe("main.tsx - Application Entry Point", () => {
    let originalConsoleError: typeof console.error;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '<div id="root"></div>';
        
        // Reset mocks
        vi.clearAllMocks();
        mockCreateRoot.mockClear();
        mockRender.mockClear();
        
        // Spy on console.error
        originalConsoleError = console.error;
        console.error = vi.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
        vi.resetModules();
    });

    describe("Application Initialization", () => {
        it("should throw error when root element not found", async () => {
            // Remove the root element
            document.body.innerHTML = "";

            // Import and execute main.tsx - it should handle the error gracefully
            const mainModule = await import("../main");
            
            // Since main.tsx wraps in try-catch, we expect console.error to be called
            expect(console.error).toHaveBeenCalledWith(
                "Failed to initialize application:",
                expect.objectContaining({
                    message: "Root element not found"
                })
            );
        });

        it("should handle initialization errors gracefully with try-catch", async () => {
            // Remove root element to trigger error
            document.body.innerHTML = "";

            // Import main.tsx which will trigger initialization
            await import("../main");

            // Verify error was caught and logged
            expect(console.error).toHaveBeenCalledWith(
                "Failed to initialize application:",
                expect.objectContaining({
                    message: "Root element not found"
                })
            );
        });

        it("should use getElementById for root element lookup", async () => {
            const getElementByIdSpy = vi.spyOn(document, "getElementById");
            
            // Ensure root element exists
            document.body.innerHTML = '<div id="root"></div>';

            // Import main.tsx
            await import("../main");

            expect(getElementByIdSpy).toHaveBeenCalledWith("root");
            
            getElementByIdSpy.mockRestore();
        });

        it("should create React root with correct element", async () => {
            // Ensure root element exists
            const rootElement = document.createElement("div");
            rootElement.id = "root";
            document.body.append(rootElement);

            // Import main.tsx
            await import("../main");

            expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
        });

        it("should render App in StrictMode", async () => {
            // Ensure root element exists
            document.body.innerHTML = '<div id="root"></div>';

            // Import main.tsx
            await import("../main");

            expect(mockRender).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: React.StrictMode,
                    props: {
                        children: expect.objectContaining({
                            type: expect.any(Function) // App component
                        })
                    }
                })
            );
        });
    });

    describe("Error Handling", () => {
        it("should catch and log initialization errors", async () => {
            // First reset modules to ensure fresh import
            vi.resetModules();

            // Simulate createRoot failure to test error handling  
            mockCreateRoot.mockImplementation(() => {
                throw new Error("ReactDOM createRoot failed");
            });

            // Setup DOM with root element
            document.body.innerHTML = '<div id="root"></div>';

            // Import main.tsx fresh after setting up the failing mock
            await import("../main");

            expect(console.error).toHaveBeenCalledWith(
                "Failed to initialize application:",
                expect.objectContaining({
                    message: expect.stringContaining("ReactDOM createRoot failed")
                })
            );

            // Restore original mock behavior for subsequent tests
            mockCreateRoot.mockImplementation(() => ({
                render: mockRender,
                unmount: vi.fn(),
            }));
        });

        it("should handle createRoot failures gracefully", async () => {
            // Make createRoot throw an error
            mockCreateRoot.mockImplementationOnce(() => {
                throw new Error("createRoot failed");
            });

            // Ensure root element exists
            document.body.innerHTML = '<div id="root"></div>';

            // Import main.tsx
            await import("../main");

            expect(console.error).toHaveBeenCalledWith(
                "Failed to initialize application:",
                expect.objectContaining({
                    message: "createRoot failed"
                })
            );
        });
    });

    describe("Critical Path Coverage", () => {
        it("should cover the main initialization path", async () => {
            // Setup DOM with proper root element
            const rootElement = document.createElement("div");
            rootElement.id = "root";
            document.body.append(rootElement);

            // Verify the element exists and has correct ID
            const foundElement = document.querySelector("#root");
            expect(foundElement).toBeTruthy();
            expect(foundElement?.id).toBe("root");

            // Import main.tsx to trigger initialization
            await import("../main");

            // Verify createRoot was called with the correct element
            expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
            
            // Verify render was called
            expect(mockRender).toHaveBeenCalled();
        });

        it("should cover error logging path", async () => {
            // Setup scenario that will cause error
            document.body.innerHTML = ""; // No root element

            // Import main.tsx
            await import("../main");

            // Verify error logging was triggered
            expect(console.error).toHaveBeenCalledWith(
                "Failed to initialize application:",
                expect.any(Error)
            );
        });

        it("should handle React.StrictMode rendering", async () => {
            // Setup DOM
            document.body.innerHTML = '<div id="root"></div>';

            // Import main.tsx
            await import("../main");

            // Verify render was called with StrictMode
            expect(mockRender).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: React.StrictMode
                })
            );
        });
    });

    describe("DOM Integration", () => {
        it("should successfully find root element in normal conditions", async () => {
            // Create root element with proper setup
            const rootDiv = document.createElement("div");
            rootDiv.id = "root";
            document.body.append(rootDiv);

            // Import main.tsx
            await import("../main");

            // Verify no errors were logged
            expect(console.error).not.toHaveBeenCalled();
            
            // Verify successful initialization
            expect(mockCreateRoot).toHaveBeenCalledWith(rootDiv);
            expect(mockRender).toHaveBeenCalled();
        });

        it("should handle multiple script executions gracefully", async () => {
            // Setup root element
            document.body.innerHTML = '<div id="root"></div>';

            // Import main.tsx multiple times (simulating multiple script loads)
            await import("../main");
            await import("../main");

            // Should still work correctly
            expect(mockCreateRoot).toHaveBeenCalled();
            expect(mockRender).toHaveBeenCalled();
        });
    });

    describe("Performance Considerations", () => {
        it("should use getElementById instead of querySelector for performance", async () => {
            const getElementByIdSpy = vi.spyOn(document, "getElementById");
            const querySelectorSpy = vi.spyOn(document, "querySelector");

            // Setup root element
            document.body.innerHTML = '<div id="root"></div>';

            // Import main.tsx
            await import("../main");

            // Verify getElementById was used (performance optimization)
            expect(getElementByIdSpy).toHaveBeenCalledWith("root");
            expect(querySelectorSpy).not.toHaveBeenCalled();

            getElementByIdSpy.mockRestore();
            querySelectorSpy.mockRestore();
        });
    });
});
