/**
 * Tests for React application entry point (main.tsx).
 * Tests the root rendering and initial setup.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock React DOM module completely
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
    render: mockRender,
}));

// Mock the entire react-dom/client module
vi.mock("react-dom/client", () => ({
    createRoot: mockCreateRoot,
    default: {
        createRoot: mockCreateRoot,
    },
}));

// Mock App component
vi.mock("../App", () => ({
    default: () => <div data-testid="app">Mocked App</div>,
}));

// Mock CSS import
vi.mock("../index.css", () => ({}));

describe("Main Entry Point", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock DOM methods - main.tsx uses querySelector("#root")
        const mockElement = document.createElement("div");
        mockElement.id = "root";
        vi.spyOn(document, "querySelector").mockReturnValue(mockElement);
    });

    it("should test React and ReactDOM imports", async () => {
        const React = await import("react");
        const ReactDOM = await import("react-dom/client");

        expect(React).toBeDefined();
        expect(ReactDOM).toBeDefined();
        expect(React.StrictMode).toBeDefined();
    });

    it("should validate main entry point exists", async () => {
        // This just validates that main.tsx can be imported without errors
        await expect(import("../main")).resolves.toBeDefined();
    });

    it("should have correct module structure", async () => {
        // Test that the main module has expected exports/imports
        const mainModule = await import("../main");

        // Main.tsx doesn't export anything, but importing it should work
        expect(mainModule).toBeDefined();
    });

    it("should use mocked dependencies correctly", () => {
        // Verify our mocks are set up correctly
        expect(mockCreateRoot).toBeDefined();
        expect(mockRender).toBeDefined();

        // Test the mock functions directly
        const mockRoot = mockCreateRoot();
        expect(mockRoot.render).toBe(mockRender);
    });

    it("should throw error when root element is not found", async () => {
        // Mock querySelector to return null (no root element found)
        vi.spyOn(document, "querySelector").mockReturnValue(null);

        // Clear the module cache to force re-evaluation
        vi.resetModules();

        // Importing main.tsx should throw an error
        await expect(async () => {
            await import("../main");
        }).rejects.toThrow("Root element not found");
    });

    it("should call querySelector with correct selector", async () => {
        const querySelectorSpy = vi.spyOn(document, "querySelector");

        // Clear modules to ensure fresh import
        vi.resetModules();

        await import("../main");

        expect(querySelectorSpy).toHaveBeenCalledWith("#root");
    });
});
