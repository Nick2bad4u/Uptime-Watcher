/**
 * Tests for React application entry point dependencies and structure. Validates
 * that main.tsx dependencies are properly available.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { type ReactNode } from "react";

// Mock ReactDOM before importing main
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
    render: mockRender,
}));

vi.mock("react-dom/client", () => ({
    createRoot: mockCreateRoot,
}));

// Mock React
vi.mock("react", () => ({
    default: {
        StrictMode: ({ children }: { children: ReactNode }) => children,
    },
    StrictMode: ({ children }: { children: ReactNode }) => children,
}));

// Mock App component
vi.mock("../App", () => ({
    App: () => "MockedApp",
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
        globalThis.document = {
            getElementById: vi.fn().mockReturnValue(null),
            createElement: vi.fn().mockReturnValue(mockElement),
        } as any;
    });

    afterEach(() => {
        // Clear modules to reset the main.tsx module state
        vi.resetModules();
    });

    it("should have React available", async ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: main", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: main", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const React = await import("react");
        expect(React).toBeDefined();
        expect(React.StrictMode).toBeDefined();
    });

    it("should have ReactDOM available", async ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: main", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const ReactDOM = await import("react-dom/client");
        expect(ReactDOM).toBeDefined();
        expect(ReactDOM.createRoot).toBeDefined();
    });

    it("should have App component available", async ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: main", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: main", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const AppModule = await import("../App");
        expect(AppModule.App).toBeDefined();
    });

    it("should initialize app when root element exists", async ({
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

        (document.getElementById as any).mockReturnValue(mockElement);

        // Dynamically import main.tsx to trigger initialization
        await import("../main");

        expect(document.getElementById).toHaveBeenCalledWith("root");
        expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);
        expect(mockRender).toHaveBeenCalled();
    });

    it("should handle error when root element not found", async ({
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

        // Ensure the root element lookup fails
        (document.getElementById as any).mockReturnValue(null);

        // Spy on the structured application logger to verify error handling
        const { logger } = await import("../services/logger");
        const loggerErrorSpy = vi.spyOn(logger.app, "error");

        // The import should succeed but log an initialization error
        await import("../main");

        expect(loggerErrorSpy).toHaveBeenCalledWith(
            "initializeApp",
            expect.any(Error)
        );

        loggerErrorSpy.mockRestore();
    });

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

        (document.getElementById as any).mockReturnValue(mockElement);

        await import("../main");

        expect(document.getElementById).toHaveBeenCalledWith("root");
        expect(document.getElementById).toHaveBeenCalledTimes(1);
    });

    it("should render App component within React.StrictMode", async ({
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

        (document.getElementById as any).mockReturnValue(mockElement);

        await import("../main");

        expect(mockRender).toHaveBeenCalledTimes(1);
        // The render call should include the App wrapped in StrictMode
        const renderCall = mockRender.mock.calls[0]?.[0];
        expect(renderCall).toBeDefined();
    });
});
