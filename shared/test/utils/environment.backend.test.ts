/**
 * Backend tests for environment utilities Focus on backend-specific usage
 * patterns in electron environment
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
} from "../../utils/environment";

describe("environment utilities - Backend Coverage", () => {
    let originalEnv: Record<string, string | undefined> = {};

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };
    });
    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });
    describe(getEnvironment, () => {
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

            const envValues = [
                "development",
                "production",
                "test",
            ] as const;

            for (const env of envValues) {
                process.env["NODE_ENV"] = env;
                expect(getEnvironment()).toBe(env);
            }
        });
    });
    describe(getEnvVar, () => {
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
    describe(getNodeEnv, () => {
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

            const envValues = [
                "development",
                "production",
                "test",
            ] as const;

            for (const env of envValues) {
                process.env["NODE_ENV"] = env;
                expect(getNodeEnv()).toBe(env);
            }
        });
    });
    describe(isBrowserEnvironment, () => {
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
            expect(isBrowserEnvironment()).toBeFalsy();
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
            expect(isBrowserEnvironment()).toBeFalsy();
        });
    });
    describe(isNodeEnvironment, () => {
        it("should return true in backend context", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: environment utilities - Backend Coverage",
                "component"
            );

            expect(isNodeEnvironment()).toBeTruthy();
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
            expect(isNodeEnvironment()).toBeTruthy();
        });
    });
    describe(isDevelopment, () => {
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
            expect(isDevelopment()).toBeTruthy();
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
            expect(isDevelopment()).toBeFalsy();

            process.env["NODE_ENV"] = "test";
            expect(isDevelopment()).toBeFalsy();
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
            expect(isDevelopment()).toBeFalsy();
        });
    });
    describe(isProduction, () => {
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
            expect(isProduction()).toBeTruthy();
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
            expect(isProduction()).toBeFalsy();

            process.env["NODE_ENV"] = "test";
            expect(isProduction()).toBeFalsy();
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
            expect(isProduction()).toBeFalsy();
        });
    });
    describe(isTest, () => {
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
            expect(isTest()).toBeTruthy();
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
            expect(isTest()).toBeFalsy();

            process.env["NODE_ENV"] = "production";
            expect(isTest()).toBeFalsy();
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
            expect(isTest()).toBeFalsy();
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

            const environments = [
                "development",
                "production",
                "test",
            ] as const;

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
            expect(isNodeEnvironment()).toBeTruthy();
            expect(isBrowserEnvironment()).toBeFalsy();

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

            expect(isProduction()).toBeTruthy();
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
