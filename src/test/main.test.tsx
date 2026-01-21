/**
 * Tests for the React application entrypoint (main.tsx).
 *
 * These tests intentionally validate observable behavior:
 *
 * - Successful initialization renders via ReactDOM.createRoot
 * - Missing root element is caught and logged (module-level try/catch)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
    render: mockRender,
    unmount: vi.fn(),
}));

const mockAppLogger = {
    error: vi.fn(),
};

vi.mock("../services/logger", () => ({
    logger: {
        app: mockAppLogger,
    },
}));

vi.mock("react-dom/client", () => ({
    createRoot: mockCreateRoot,
}));

vi.mock("../App", () => ({
    App: () => "MockedApp",
}));

vi.mock("../index.css", () => ({}));

describe("main.tsx - Application Entry Point", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Fresh DOM for each test.
        document.body.innerHTML = "";

        mockCreateRoot.mockClear();
        mockRender.mockClear();
    });

    afterEach(() => {
        // Ensure `../main` executes fresh per test.
        vi.resetModules();
    });

    it("initializes and renders when root exists", async ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: main", "component");
        annotate("Category: Core", "category");
        annotate("Type: Initialization", "type");

        const root = document.createElement("div");
        root.id = "root";
        document.body.append(root);

        await import("../main");

        expect(mockCreateRoot).toHaveBeenCalledWith(root);
        expect(mockRender).toHaveBeenCalledTimes(1);
        expect(mockAppLogger.error).not.toHaveBeenCalled();
    });

    it("logs an error when root element is missing", async ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: main", "component");
        annotate("Category: Core", "category");
        annotate("Type: Error Handling", "type");

        document.body.innerHTML = "";

        await import("../main");

        expect(mockAppLogger.error).toHaveBeenCalledWith(
            "initializeApp",
            expect.objectContaining({
                message: "Root element not found",
            })
        );
    });

    it("logs an error when createRoot throws", async ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: main", "component");
        annotate("Category: Core", "category");
        annotate("Type: Error Handling", "type");

        const root = document.createElement("div");
        root.id = "root";
        document.body.append(root);

        mockCreateRoot.mockImplementationOnce(() => {
            throw new Error("ReactDOM createRoot failed");
        });

        await import("../main");

        expect(mockAppLogger.error).toHaveBeenCalledWith(
            "initializeApp",
            expect.objectContaining({
                message: expect.stringContaining("ReactDOM createRoot failed"),
            })
        );
    });
});
