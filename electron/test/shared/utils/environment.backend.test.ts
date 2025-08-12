/**
 * Backend tests for environment utilities
 * Focus on backend-specific usage patterns in electron environment
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
    getEnvironment,
    getEnvVar,
    getNodeEnv,
    isBrowserEnvironment,
    isDevelopment,
    isNodeEnvironment,
    isProduction,
    isTest,
} from "../../../../shared/utils/environment";

describe("environment utilities - Backend Coverage", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };
    });
    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });
    describe("getEnvironment", () => {
        it("should return NODE_ENV value in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "production";
            expect(getEnvironment()).toBe("production");
        });
        it("should return unknown as default in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            delete process.env["NODE_ENV"];
            expect(getEnvironment()).toBe("unknown");
        });
        it("should handle all valid NODE_ENV values in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            const envValues = ["development", "production", "test"] as const;

            for (const env of envValues) {
                process.env["NODE_ENV"] = env;
                expect(getEnvironment()).toBe(env);
            }
        });
    });
    describe("getEnvVar", () => {
        it("should retrieve NODE_ENV in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "production";
            expect(getEnvVar("NODE_ENV")).toBe("production");
        });
        it("should return undefined for NODE_ENV when not set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            delete process.env["NODE_ENV"];
            expect(getEnvVar("NODE_ENV")).toBeUndefined();
        });
        it("should handle CODECOV_TOKEN in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["CODECOV_TOKEN"] = "test-token";
            expect(getEnvVar("CODECOV_TOKEN")).toBe("test-token");
        });
        it("should return undefined for CODECOV_TOKEN when not set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            delete process.env["CODECOV_TOKEN"];
            expect(getEnvVar("CODECOV_TOKEN")).toBeUndefined();
        });
        it("should handle empty string environment variables", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "";
            expect(getEnvVar("NODE_ENV")).toBe("");
        });
    });
    describe("getNodeEnv", () => {
        it("should return NODE_ENV value in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "production";
            expect(getNodeEnv()).toBe("production");
        });
        it("should return development as default in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            delete process.env["NODE_ENV"];
            expect(getNodeEnv()).toBe("development");
        });
        it("should handle all valid NODE_ENV values in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            const envValues = ["development", "production", "test"] as const;

            for (const env of envValues) {
                process.env["NODE_ENV"] = env;
                expect(getNodeEnv()).toBe(env);
            }
        });
    });
    describe("isBrowserEnvironment", () => {
        it("should return false in backend context", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            // In electron backend, window should be undefined
            expect(typeof globalThis.window).toBe("undefined");
            expect(isBrowserEnvironment()).toBe(false);
        });
        it("should handle backend environment correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            // Ensure we're in a Node.js environment
            expect(typeof process).toBe("object");
            expect(typeof process.versions).toBe("object");
            expect(typeof process.versions.node).toBe("string");
            expect(isBrowserEnvironment()).toBe(false);
        });
    });
    describe("isNodeEnvironment", () => {
        it("should return true in backend context", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            expect(isNodeEnvironment()).toBe(true);
        });
        it("should detect Node.js environment correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            expect(typeof process).toBe("object");
            expect(typeof process.versions).toBe("object");
            expect(typeof process.versions.node).toBe("string");
            expect(isNodeEnvironment()).toBe(true);
        });
    });
    describe("isDevelopment", () => {
        it("should return true when NODE_ENV is development in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "development";
            expect(isDevelopment()).toBe(true);
        });
        it("should return false when NODE_ENV is not development in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "production";
            expect(isDevelopment()).toBe(false);

            process.env["NODE_ENV"] = "test";
            expect(isDevelopment()).toBe(false);
        });
        it("should return false as default in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            delete process.env["NODE_ENV"];
            expect(isDevelopment()).toBe(false);
        });
    });
    describe("isProduction", () => {
        it("should return true when NODE_ENV is production in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "production";
            expect(isProduction()).toBe(true);
        });
        it("should return false when NODE_ENV is not production in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "development";
            expect(isProduction()).toBe(false);

            process.env["NODE_ENV"] = "test";
            expect(isProduction()).toBe(false);
        });
        it("should return false as default in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            delete process.env["NODE_ENV"];
            expect(isProduction()).toBe(false);
        });
    });
    describe("isTest", () => {
        it("should return true when NODE_ENV is test in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "test";
            expect(isTest()).toBe(true);
        });
        it("should return false when NODE_ENV is not test in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "development";
            expect(isTest()).toBe(false);

            process.env["NODE_ENV"] = "production";
            expect(isTest()).toBe(false);
        });
        it("should return false as default in backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            delete process.env["NODE_ENV"];
            expect(isTest()).toBe(false);
        });
    });
    describe("Backend-specific integration scenarios", () => {
        it("should work consistently across all environment detection functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            const environments = ["development", "production", "test"] as const;

            for (const env of environments) {
                process.env["NODE_ENV"] = env;

                expect(getEnvironment()).toBe(env);
                expect(getNodeEnv()).toBe(env);
                expect(isDevelopment()).toBe(env === "development");
                expect(isProduction()).toBe(env === "production");
                expect(isTest()).toBe(env === "test");
            }
        });
        it("should handle electron main process environment correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            // Electron main process should be detected as Node environment
            expect(isNodeEnvironment()).toBe(true);
            expect(isBrowserEnvironment()).toBe(false);

            // Should have access to Node.js APIs
            expect(typeof process).toBe("object");
            expect(typeof process.versions).toBe("object");
        });
        it("should handle backend configuration scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            process.env["NODE_ENV"] = "production";
            process.env["CODECOV_TOKEN"] = "backend-token";

            expect(isProduction()).toBe(true);
            expect(getEnvVar("CODECOV_TOKEN")).toBe("backend-token");
        });
        it("should maintain consistency with shared utilities", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            // Ensure backend environment detection is consistent
            const currentEnv = getEnvironment();

            expect(getNodeEnv()).toBe(currentEnv);
            expect(isDevelopment()).toBe(currentEnv === "development");
            expect(isProduction()).toBe(currentEnv === "production");
            expect(isTest()).toBe(currentEnv === "test");
        });
    });
});
