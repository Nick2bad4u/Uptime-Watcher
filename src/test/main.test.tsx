/**
 * Tests for React application entry point dependencies and structure.
 * Validates that main.tsx dependencies are properly available.
 */

import { describe, expect, it } from "vitest";

describe("Main Entry Point", () => {
    it("should have React available", async () => {
        const React = await import("react");
        expect(React).toBeDefined();
        expect(React.StrictMode).toBeDefined();
    });

    it("should have ReactDOM available", async () => {
        const ReactDOM = await import("react-dom/client");
        expect(ReactDOM).toBeDefined();
        expect(ReactDOM.createRoot).toBeDefined();
    });

    it("should have App component available", async () => {
        const AppModule = await import("../App");
        expect(AppModule.default).toBeDefined();
    });
});
