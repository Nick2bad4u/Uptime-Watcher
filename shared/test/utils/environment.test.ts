/**
 * Function coverage validation test for shared/utils/environment.ts
 *
 * This test ensures all exported functions are called to achieve 100% function
 * coverage.
 *
 * @file Function coverage validation for environment utilities
 */

import { describe, it, expect } from "vitest";
import * as environmentModule from "../../utils/environment.js";

describe("Function Coverage Validation", () => {
    it("should call all exported functions to ensure 100% function coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

        // Verify all functions are accessible
        expect(typeof environmentModule.getEnvVar).toBe("function");
        expect(typeof environmentModule.getEnvironment).toBe("function");
        expect(typeof environmentModule.getNodeEnv).toBe("function");
        expect(typeof environmentModule.isBrowserEnvironment).toBe("function");
        expect(typeof environmentModule.isDevelopment).toBe("function");
        expect(typeof environmentModule.isNodeEnvironment).toBe("function");
        expect(typeof environmentModule.isProduction).toBe("function");
        expect(typeof environmentModule.isTest).toBe("function");

        // Call all functions to register coverage

        // Test getEnvVar with known environment variable keys
        const nodeEnvValue = environmentModule.getEnvVar("NODE_ENV");
        expect(
            typeof nodeEnvValue === "string" || nodeEnvValue === undefined
        ).toBe(true);

        const codecovValue = environmentModule.getEnvVar("CODECOV_TOKEN");
        expect(
            typeof codecovValue === "string" || codecovValue === undefined
        ).toBe(true);

        // Test environment detection functions
        const environment = environmentModule.getEnvironment();
        expect(typeof environment).toBe("string");

        const nodeEnv = environmentModule.getNodeEnv();
        expect(typeof nodeEnv).toBe("string");

        // Test boolean environment checks
        const isBrowser = environmentModule.isBrowserEnvironment();
        expect(typeof isBrowser).toBe("boolean");

        const isDev = environmentModule.isDevelopment();
        expect(typeof isDev).toBe("boolean");

        const isNode = environmentModule.isNodeEnvironment();
        expect(typeof isNode).toBe("boolean");

        const isProd = environmentModule.isProduction();
        expect(typeof isProd).toBe("boolean");

        const isTestEnv = environmentModule.isTest();
        expect(typeof isTestEnv).toBe("boolean");

        // Validate consistent behavior between related functions
        if (isDev) {
            expect(isProd).toBe(false);
        }

        if (isProd) {
            expect(isDev).toBe(false);
        }

        // In Node.js environment, we expect isNode to be true and isBrowser to be false
        if (typeof process !== "undefined") {
            expect(isNode).toBe(true);
            expect(isBrowser).toBe(false);
        }
    });
});
