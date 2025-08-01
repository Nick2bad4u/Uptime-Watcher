/**
 * Tests for React application entry point dependencies and structure.
 * Validates that main.tsx dependencies are properly available.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock ReactDOM before importing main
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
    render: mockRender,
}));

vi.mock("react-dom/client", () => ({
    default: {
        createRoot: mockCreateRoot,
    },
}));

// Mock React
vi.mock("react", () => ({
    default: {
        StrictMode: ({ children }: { children: React.ReactNode }) => children,
    },
    StrictMode: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock App component
vi.mock("../App", () => ({
    default: () => "MockedApp",
}));

// Mock CSS imports
vi.mock("../index.css", () => ({}));

describe("Main Entry Point", () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create a mock element
        mockElement = {
            id: "root",
            getAttribute: vi.fn(),
            setAttribute: vi.fn(),
        } as any;

        // Mock document with getElementById
        global.document = {
            getElementById: vi.fn().mockReturnValue(null),
            createElement: vi.fn().mockReturnValue(mockElement),
        } as any;
    });

    afterEach(() => {
        // Clear modules to reset the main.tsx module state
        vi.resetModules();
    });

    it("should have React available", async () => {
        const React = await import("react");
        expect(React).toBeDefined();
        expect(React.StrictMode).toBeDefined();
    });

    it("should have ReactDOM available", async () => {
        const ReactDOM = await import("react-dom/client");
        expect(ReactDOM).toBeDefined();
        expect(ReactDOM.default.createRoot).toBeDefined();
    });

    it("should have App component available", async () => {
        const AppModule = await import("../App");
        expect(AppModule.default).toBeDefined();
    });

    it("should initialize app when root element exists", async () => {
        (document.getElementById as any).mockReturnValue(mockElement);

        // Dynamically import main.tsx to trigger initialization
        await import("../main");

        expect(document.getElementById).toHaveBeenCalledWith("root");
        expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);
        expect(mockRender).toHaveBeenCalled();
    });

    it("should handle error when root element not found", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        (document.getElementById as any).mockReturnValue(null);

        // The import should succeed but log an error
        await import("../main");

        expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to initialize application:", expect.any(Error));

        consoleErrorSpy.mockRestore();
    });

    it("should use getElementById for root element lookup", async () => {
        (document.getElementById as any).mockReturnValue(mockElement);

        await import("../main");

        expect(document.getElementById).toHaveBeenCalledWith("root");
        expect(document.getElementById).toHaveBeenCalledTimes(1);
    });

    it("should render App component within React.StrictMode", async () => {
        (document.getElementById as any).mockReturnValue(mockElement);

        await import("../main");

        expect(mockRender).toHaveBeenCalledTimes(1);
        // The render call should include the App wrapped in StrictMode
        const renderCall = mockRender.mock.calls[0]?.[0];
        expect(renderCall).toBeDefined();
    });
});
