/**
 * Test to cover line 41 in environment.ts - the catch block in getEnvVar
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";

describe("Environment - Catch Block Coverage", () => {
    let originalProcessEnv: any;

    beforeEach(() => {
        // Store original process.env
        originalProcessEnv = process.env;
    });

    afterEach(() => {
        // Restore original process.env
        process.env = originalProcessEnv;
    });

    it("should handle error when accessing process.env (line 41)", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: environment.catch-coverage", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Error Handling", "type");

        // Dynamic import to get the function after environment manipulation
        const { getEnvVar } = await import("../../utils/environment");

        // Mock process.env to throw an error when accessed
        Object.defineProperty(globalThis, "process", {
            value: {
                ...process,
                env: new Proxy(
                    {},
                    {
                        get() {
                            throw new Error("Mock process.env access error");
                        },
                    }
                ),
            },
            configurable: true,
        });

        // This should hit the catch block and return undefined
        const result = getEnvVar("NODE_ENV");
        expect(result).toBeUndefined();
    });

    it("should handle null process.env", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: environment.catch-coverage", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        // Dynamic import to get the function after environment manipulation
        const { getEnvVar } = await import("../../utils/environment");

        // Mock process.env to be null
        Object.defineProperty(globalThis, "process", {
            value: {
                ...process,
                env: null,
            },
            configurable: true,
        });

        // This should hit the catch block and return undefined
        const result = getEnvVar("NODE_ENV");
        expect(result).toBeUndefined();
    });

    it("should handle undefined process.env", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: environment.catch-coverage", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        // Dynamic import to get the function after environment manipulation
        const { getEnvVar } = await import("../../utils/environment");

        // Mock process.env to be undefined
        Object.defineProperty(globalThis, "process", {
            value: {
                ...process,
                env: undefined,
            },
            configurable: true,
        });

        // This should hit the catch block and return undefined
        const result = getEnvVar("NODE_ENV");
        expect(result).toBeUndefined();
    });
});
