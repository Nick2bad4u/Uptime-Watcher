import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Test suite for shared/utils/environment.ts
 *
 * @fileoverview Comprehensive tests for environment detection utilities
 */

// Mock process object for environment testing
const mockProcess = {
    env: {} as Record<string, string | undefined>,
    versions: { node: "18.0.0" } as any,
} as any;

describe("Environment Detection Utilities", () => {
    let originalProcess: any;

    beforeEach(() => {
        // Store original process
        originalProcess = globalThis.process;

        // Reset mock process environment
        mockProcess.env = {};

        // Clear any existing mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restore original process
        globalThis.process = originalProcess;
    });

    describe("getEnvironment", () => {
        it("should return NODE_ENV value when set", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "production" },
            } as any;

            const { getEnvironment } = await import("../../utils/environment");

            expect(getEnvironment()).toBe("production");
        });

        it("should return 'unknown' when NODE_ENV is not set", async () => {
            globalThis.process = { ...mockProcess, env: {} } as any;

            const { getEnvironment } = await import("../../utils/environment");

            expect(getEnvironment()).toBe("unknown");
        });

        it("should return 'unknown' when process is undefined", async () => {
            globalThis.process = undefined as any;

            const { getEnvironment } = await import("../../utils/environment");

            expect(getEnvironment()).toBe("unknown");
        });

        it("should handle all standard NODE_ENV values", async () => {
            const { getEnvironment } = await import("../../utils/environment");

            const environments = ["development", "production", "test"];

            for (const env of environments) {
                globalThis.process = {
                    ...mockProcess,
                    env: { NODE_ENV: env },
                } as any;
                expect(getEnvironment()).toBe(env);
            }
        });
    });

    describe("getEnvVar", () => {
        it("should return environment variable value when it exists", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "test", CODECOV_TOKEN: "test-token" },
            } as any;

            const { getEnvVar } = await import("../../utils/environment");

            expect(getEnvVar("NODE_ENV")).toBe("test");
            expect(getEnvVar("CODECOV_TOKEN")).toBe("test-token");
        });

        it("should return undefined when environment variable doesn't exist", async () => {
            globalThis.process = { ...mockProcess, env: {} } as any;

            const { getEnvVar } = await import("../../utils/environment");

            expect(getEnvVar("NODE_ENV")).toBeUndefined();
            expect(getEnvVar("CODECOV_TOKEN")).toBeUndefined();
        });

        it("should return undefined when process is undefined", async () => {
            globalThis.process = undefined as any;

            const { getEnvVar } = await import("../../utils/environment");

            expect(getEnvVar("NODE_ENV")).toBeUndefined();
            expect(getEnvVar("CODECOV_TOKEN")).toBeUndefined();
        });

        it("should handle empty string values", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "" },
            } as any;

            const { getEnvVar } = await import("../../utils/environment");

            expect(getEnvVar("NODE_ENV")).toBe("");
        });
    });

    describe("getNodeEnv", () => {
        it("should return NODE_ENV value when set", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "production" },
            } as any;

            const { getNodeEnv } = await import("../../utils/environment");

            expect(getNodeEnv()).toBe("production");
        });

        it("should return 'development' when NODE_ENV is not set", async () => {
            globalThis.process = { ...mockProcess, env: {} } as any;

            const { getNodeEnv } = await import("../../utils/environment");

            expect(getNodeEnv()).toBe("development");
        });

        it("should return 'development' when process is undefined", async () => {
            globalThis.process = undefined as any;

            const { getNodeEnv } = await import("../../utils/environment");

            expect(getNodeEnv()).toBe("development");
        });

        it("should handle all standard NODE_ENV values", async () => {
            const { getNodeEnv } = await import("../../utils/environment");

            const environments = ["development", "production", "test"];

            for (const env of environments) {
                globalThis.process = {
                    ...mockProcess,
                    env: { NODE_ENV: env },
                } as any;
                expect(getNodeEnv()).toBe(env);
            }
        });
    });

    describe("isBrowserEnvironment", () => {
        let originalWindow: any;
        let originalDocument: any;

        beforeEach(() => {
            originalWindow = globalThis.window;
            originalDocument = globalThis.document;
        });

        afterEach(() => {
            globalThis.window = originalWindow;
            globalThis.document = originalDocument;
        });

        it("should return true when window and document exist", async () => {
            globalThis.window = {} as any;
            globalThis.document = {} as any;

            const { isBrowserEnvironment } = await import(
                "../../utils/environment"
            );

            expect(isBrowserEnvironment()).toBe(true);
        });

        it("should return false when window is undefined", async () => {
            globalThis.window = undefined as any;
            globalThis.document = {} as any;

            const { isBrowserEnvironment } = await import(
                "../../utils/environment"
            );

            expect(isBrowserEnvironment()).toBe(false);
        });

        it("should return false when document is undefined", async () => {
            globalThis.window = {} as any;
            globalThis.document = undefined as any;

            const { isBrowserEnvironment } = await import(
                "../../utils/environment"
            );

            expect(isBrowserEnvironment()).toBe(false);
        });

        it("should return false when both window and document are undefined", async () => {
            globalThis.window = undefined as any;
            globalThis.document = undefined as any;

            const { isBrowserEnvironment } = await import(
                "../../utils/environment"
            );

            expect(isBrowserEnvironment()).toBe(false);
        });
    });

    describe("isDevelopment", () => {
        it("should return true when NODE_ENV is 'development'", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "development" },
            } as any;

            const { isDevelopment } = await import("../../utils/environment");

            expect(isDevelopment()).toBe(true);
        });

        it("should return false when NODE_ENV is 'production'", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "production" },
            } as any;

            const { isDevelopment } = await import("../../utils/environment");

            expect(isDevelopment()).toBe(false);
        });

        it("should return false when NODE_ENV is 'test'", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "test" },
            } as any;

            const { isDevelopment } = await import("../../utils/environment");

            expect(isDevelopment()).toBe(false);
        });

        it("should return false when NODE_ENV is not set", async () => {
            globalThis.process = { ...mockProcess, env: {} } as any;

            const { isDevelopment } = await import("../../utils/environment");

            expect(isDevelopment()).toBe(false);
        });

        it("should return false when process is undefined", async () => {
            globalThis.process = undefined as any;

            const { isDevelopment } = await import("../../utils/environment");

            expect(isDevelopment()).toBe(false);
        });

        it("should be case sensitive", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "Development" },
            } as any;

            const { isDevelopment } = await import("../../utils/environment");

            expect(isDevelopment()).toBe(false);
        });
    });

    describe("isNodeEnvironment", () => {
        it("should return true when process and process.versions.node exist", async () => {
            globalThis.process = {
                ...mockProcess,
                versions: { node: "18.0.0" },
            } as any;

            const { isNodeEnvironment } = await import(
                "../../utils/environment"
            );

            expect(isNodeEnvironment()).toBe(true);
        });

        it("should return false when process is undefined", async () => {
            globalThis.process = undefined as any;

            const { isNodeEnvironment } = await import(
                "../../utils/environment"
            );

            expect(isNodeEnvironment()).toBe(false);
        });

        it("should return false when process.versions is undefined", async () => {
            globalThis.process = {
                ...mockProcess,
                versions: undefined as any,
            } as any;

            const { isNodeEnvironment } = await import(
                "../../utils/environment"
            );

            expect(isNodeEnvironment()).toBe(false);
        });

        it("should return false when process.versions is not an object", async () => {
            globalThis.process = {
                ...mockProcess,
                versions: "not-an-object" as any,
            } as any;

            const { isNodeEnvironment } = await import(
                "../../utils/environment"
            );

            expect(isNodeEnvironment()).toBe(false);
        });

        it("should return false when process.versions.node is undefined", async () => {
            globalThis.process = { ...mockProcess, versions: {} as any } as any;

            const { isNodeEnvironment } = await import(
                "../../utils/environment"
            );

            expect(isNodeEnvironment()).toBe(false);
        });

        it("should return false when process.versions.node is empty string", async () => {
            globalThis.process = {
                ...mockProcess,
                versions: { node: "" } as any,
            } as any;

            const { isNodeEnvironment } = await import(
                "../../utils/environment"
            );

            expect(isNodeEnvironment()).toBe(false);
        });
    });

    describe("isProduction", () => {
        it("should return true when NODE_ENV is 'production'", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "production" },
            } as any;

            const { isProduction } = await import("../../utils/environment");

            expect(isProduction()).toBe(true);
        });

        it("should return false when NODE_ENV is 'development'", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "development" },
            } as any;

            const { isProduction } = await import("../../utils/environment");

            expect(isProduction()).toBe(false);
        });

        it("should return false when NODE_ENV is 'test'", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "test" },
            } as any;

            const { isProduction } = await import("../../utils/environment");

            expect(isProduction()).toBe(false);
        });

        it("should return false when NODE_ENV is not set", async () => {
            globalThis.process = { ...mockProcess, env: {} } as any;

            const { isProduction } = await import("../../utils/environment");

            expect(isProduction()).toBe(false);
        });

        it("should return false when process is undefined", async () => {
            globalThis.process = undefined as any;

            const { isProduction } = await import("../../utils/environment");

            expect(isProduction()).toBe(false);
        });

        it("should be case sensitive", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "Production" },
            } as any;

            const { isProduction } = await import("../../utils/environment");

            expect(isProduction()).toBe(false);
        });
    });

    describe("isTest", () => {
        it("should return true when NODE_ENV is 'test'", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "test" },
            } as any;

            const { isTest } = await import("../../utils/environment");

            expect(isTest()).toBe(true);
        });

        it("should return false when NODE_ENV is 'development'", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "development" },
            } as any;

            const { isTest } = await import("../../utils/environment");

            expect(isTest()).toBe(false);
        });

        it("should return false when NODE_ENV is 'production'", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "production" },
            } as any;

            const { isTest } = await import("../../utils/environment");

            expect(isTest()).toBe(false);
        });

        it("should return false when NODE_ENV is not set", async () => {
            globalThis.process = { ...mockProcess, env: {} } as any;

            const { isTest } = await import("../../utils/environment");

            expect(isTest()).toBe(false);
        });

        it("should return false when process is undefined", async () => {
            globalThis.process = undefined as any;

            const { isTest } = await import("../../utils/environment");

            expect(isTest()).toBe(false);
        });

        it("should be case sensitive", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "Test" },
            } as any;

            const { isTest } = await import("../../utils/environment");

            expect(isTest()).toBe(false);
        });
    });

    describe("Edge cases and integration", () => {
        it("should handle multiple environment checks consistently", async () => {
            globalThis.process = {
                ...mockProcess,
                env: { NODE_ENV: "development" },
            } as any;

            const {
                isDevelopment,
                isProduction,
                isTest,
                getNodeEnv,
                getEnvironment,
            } = await import("../../utils/environment");

            expect(isDevelopment()).toBe(true);
            expect(isProduction()).toBe(false);
            expect(isTest()).toBe(false);
            expect(getNodeEnv()).toBe("development");
            expect(getEnvironment()).toBe("development");
        });

        it("should handle undefined process consistently across all functions", async () => {
            globalThis.process = undefined as any;

            const {
                isDevelopment,
                isProduction,
                isTest,
                isNodeEnvironment,
                getNodeEnv,
                getEnvironment,
                getEnvVar,
            } = await import("../../utils/environment");

            expect(isDevelopment()).toBe(false);
            expect(isProduction()).toBe(false);
            expect(isTest()).toBe(false);
            expect(isNodeEnvironment()).toBe(false);
            expect(getNodeEnv()).toBe("development");
            expect(getEnvironment()).toBe("unknown");
            expect(getEnvVar("NODE_ENV")).toBeUndefined();
        });

        it("should handle different falsy values for environment variables", async () => {
            const { getEnvVar } = await import("../../utils/environment");

            const falsyValues = ["", "0", "false"];

            for (const value of falsyValues) {
                globalThis.process = {
                    ...mockProcess,
                    env: { NODE_ENV: value },
                } as any;
                expect(getEnvVar("NODE_ENV")).toBe(value);
            }
        });
    });
});
