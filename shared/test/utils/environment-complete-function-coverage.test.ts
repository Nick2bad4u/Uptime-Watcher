/**
 * @file Complete Function Coverage Tests for // Test in defa            // Test in default environment (undefined NODE_ENV)
            delete process.env["NODE_ENV"];
            expect(environmentModule.isDevelopment()).toBe(false);

            // Test with development environment
            process.env["NODE_ENV"] = "development";
            expect(environmentModule.isDevelopment()).toBe(true);

            // Test with production environment
            process.env["NODE_ENV"] = "production";
            expect(environmentModule.isDevelopment()).toBe(false);

            // Test with test environment
            process.env["NODE_ENV"] = "test";t
 *   (undefined NODE_ENV) delete process.env["NODE_ENV"];
 *   expect(environmentModule.isDevelopment()).toBe(false);
 *
 *   ```
 *   // Test with development environment
 *   process.env["NODE_ENV"] = "development";
 *   expect(environmentModule.isDevelopment()).toBe(true);
 *
 *   // Test with production environment
 *   process.env["NODE_ENV"] = "production";
 *   expect(environmentModule.isDevelopment()).toBe(false);
 *
 *   // Test with test environment
 *   process.env["NODE_ENV"] = "development";
 *   ```
 *
 *   This test ensures 100% function coverage for the environment module using the
 *   proven Function Coverage Validation pattern with namespace imports and
 *   systematic function calls.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import * as environmentModule from "../../utils/environment.js";

describe("Environment - Complete Function Coverage", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.clearAllMocks();
    });

    describe("Function Coverage Validation", () => {
        it("should call every exported function for complete coverage", () => {
            // Verify the module exports we expect
            expect(typeof environmentModule).toBe("object");
            expect(environmentModule).toBeDefined();

            // Test isProduction function
            expect(typeof environmentModule.isProduction).toBe("function");

            // Test in default environment (undefined NODE_ENV)
            delete process.env["NODE_ENV"];
            expect(environmentModule.isProduction()).toBe(false);

            // Test with production environment
            process.env["NODE_ENV"] = "production";
            expect(environmentModule.isProduction()).toBe(true);

            // Test with development environment
            process.env["NODE_ENV"] = "development";
            expect(environmentModule.isProduction()).toBe(false);

            // Test with test environment
            process.env["NODE_ENV"] = "test";
            expect(environmentModule.isProduction()).toBe(false);

            // Test isDevelopment function
            expect(typeof environmentModule.isDevelopment).toBe("function");

            // Test in default environment (undefined NODE_ENV)
            delete process.env["NODE_ENV"];
            expect(environmentModule.isDevelopment()).toBe(false); // undefined !== 'development'

            // Test with development environment
            process.env["NODE_ENV"] = "development";
            expect(environmentModule.isDevelopment()).toBe(true);

            // Test with production environment
            process.env["NODE_ENV"] = "production";
            expect(environmentModule.isDevelopment()).toBe(false);

            // Test with test environment
            process.env["NODE_ENV"] = "test";
            expect(environmentModule.isDevelopment()).toBe(false);

            // Test isTest function
            expect(typeof environmentModule.isTest).toBe("function");

            // Test in default environment (undefined NODE_ENV)
            delete process.env["NODE_ENV"];
            expect(environmentModule.isTest()).toBe(false);

            // Test with test environment
            process.env["NODE_ENV"] = "test";
            expect(environmentModule.isTest()).toBe(true);

            // Test with production environment
            process.env["NODE_ENV"] = "production";
            expect(environmentModule.isTest()).toBe(false);

            // Test with development environment
            process.env["NODE_ENV"] = "development";
            expect(environmentModule.isTest()).toBe(false);

            // Test getNodeEnv function
            expect(typeof environmentModule.getNodeEnv).toBe("function");

            // Test in default environment (undefined NODE_ENV)
            delete process.env["NODE_ENV"];
            expect(environmentModule.getNodeEnv()).toBe("development");

            // Test with explicit environments
            process.env["NODE_ENV"] = "production";
            expect(environmentModule.getNodeEnv()).toBe("production");

            process.env["NODE_ENV"] = "development";
            expect(environmentModule.getNodeEnv()).toBe("development");

            process.env["NODE_ENV"] = "test";
            expect(environmentModule.getNodeEnv()).toBe("test");

            // Test with custom environment
            process.env["NODE_ENV"] = "staging";
            expect(environmentModule.getNodeEnv()).toBe("staging");

            // Test isBrowserEnvironment function
            expect(typeof environmentModule.isBrowserEnvironment).toBe(
                "function"
            );

            // Test in Node.js environment (default - no window/document available)
            expect(environmentModule.isBrowserEnvironment()).toBe(false);

            // Test isNodeEnvironment function
            expect(typeof environmentModule.isNodeEnvironment).toBe("function");

            // Test in Node.js environment (should be true)
            expect(environmentModule.isNodeEnvironment()).toBe(true);

            // Test getEnvironment function
            expect(typeof environmentModule.getEnvironment).toBe("function");

            // Reset environment
            process.env["NODE_ENV"] = "test";
            expect(environmentModule.getEnvironment()).toBe("test");

            // Test with production environment
            process.env["NODE_ENV"] = "production";
            expect(environmentModule.getEnvironment()).toBe("production");

            // Test with undefined NODE_ENV
            delete process.env["NODE_ENV"];
            expect(environmentModule.getEnvironment()).toBe("unknown");

            // Test getEnvVar function
            expect(typeof environmentModule.getEnvVar).toBe("function");

            // Test with existing environment variable
            process.env["NODE_ENV"] = "test";
            expect(environmentModule.getEnvVar("NODE_ENV")).toBe("test");

            // Test with undefined environment variable
            delete process.env["NODE_ENV"];
            expect(environmentModule.getEnvVar("NODE_ENV")).toBeUndefined();

            // Test with CODECOV_TOKEN
            process.env["CODECOV_TOKEN"] = "test-token";
            expect(environmentModule.getEnvVar("CODECOV_TOKEN")).toBe(
                "test-token"
            );
            delete process.env["CODECOV_TOKEN"];
        });

        it("should handle edge cases and special environments", () => {
            // Test with empty string NODE_ENV (empty string is not nullish, so is returned as-is)
            process.env["NODE_ENV"] = "";
            expect(environmentModule.getNodeEnv()).toBe(""); // Empty string is returned, not fallback
            expect(environmentModule.isDevelopment()).toBe(false); // Empty string !== 'development'
            expect(environmentModule.isProduction()).toBe(false);
            expect(environmentModule.isTest()).toBe(false);
            expect(environmentModule.getEnvironment()).toBe(""); // Empty string is returned

            // Test with undefined NODE_ENV
            delete process.env["NODE_ENV"];
            expect(environmentModule.getNodeEnv()).toBe("development");
            expect(environmentModule.isDevelopment()).toBe(false); // undefined !== 'development'
            expect(environmentModule.isProduction()).toBe(false);
            expect(environmentModule.isTest()).toBe(false);
            expect(environmentModule.getEnvironment()).toBe("unknown");

            // Test case sensitivity
            process.env["NODE_ENV"] = "PRODUCTION";
            expect(environmentModule.isProduction()).toBe(false); // Case sensitive
            expect(environmentModule.getNodeEnv()).toBe("PRODUCTION");
            expect(environmentModule.getEnvironment()).toBe("PRODUCTION");
        });

        it("should handle runtime environment detection edge cases", () => {
            // Test browser detection edge cases
            // In Node.js environment, window and document don't exist
            expect(environmentModule.isBrowserEnvironment()).toBe(false);

            // We can't easily mock window/document in Node.js vitest environment
            // because the function checks for typeof window/document which can't be mocked
            // The function is working correctly - it detects we're not in a browser

            // Test edge case where process might be undefined
            expect(environmentModule.isNodeEnvironment()).toBe(true); // Should be true in test environment
        });

        it("should provide consistent environment detection", () => {
            // Test consistency between functions
            process.env["NODE_ENV"] = "development";

            expect(environmentModule.getNodeEnv()).toBe("development");
            expect(environmentModule.getEnvironment()).toBe("development");
            expect(environmentModule.isDevelopment()).toBe(true);
            expect(environmentModule.isProduction()).toBe(false);
            expect(environmentModule.isTest()).toBe(false);

            // Test production consistency
            process.env["NODE_ENV"] = "production";

            expect(environmentModule.getNodeEnv()).toBe("production");
            expect(environmentModule.getEnvironment()).toBe("production");
            expect(environmentModule.isDevelopment()).toBe(false);
            expect(environmentModule.isProduction()).toBe(true);
            expect(environmentModule.isTest()).toBe(false);

            // Test test environment consistency
            process.env["NODE_ENV"] = "test";

            expect(environmentModule.getNodeEnv()).toBe("test");
            expect(environmentModule.getEnvironment()).toBe("test");
            expect(environmentModule.isDevelopment()).toBe(false);
            expect(environmentModule.isProduction()).toBe(false);
            expect(environmentModule.isTest()).toBe(true);
        });

        it("should handle getEnvVar edge cases", () => {
            // Test with various environment variables
            process.env["CODECOV_TOKEN"] = "test-codecov-token";
            expect(environmentModule.getEnvVar("CODECOV_TOKEN")).toBe(
                "test-codecov-token"
            );

            // Test with undefined variable
            delete process.env["CODECOV_TOKEN"];
            expect(
                environmentModule.getEnvVar("CODECOV_TOKEN")
            ).toBeUndefined();

            // Clean up all test environment variables
            delete process.env["NODE_ENV"];
            delete process.env["CODECOV_TOKEN"];
        });
    });
});
