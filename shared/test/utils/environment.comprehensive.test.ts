import {
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import type { ProcessSnapshot } from "../../utils/environment";

/**
 * Test suite for shared/utils/environment.ts
 *
 * @file Comprehensive tests for environment detection utilities
 */

type EnvironmentModule = typeof import("../../utils/environment");

let environmentModule: EnvironmentModule | undefined = undefined;

let mockProcessEnv: Record<string, string | undefined> = {};
let mockProcessVersions: ProcessSnapshot["versions"] = { node: "18.0.0" };

const mockProcess: ProcessSnapshot = {
    get env() {
        return mockProcessEnv;
    },
    get versions() {
        return mockProcessVersions;
    },
};

const resetMockProcessState = (): void => {
    mockProcessEnv = {};
    mockProcessVersions = { node: "18.0.0" };
};

const ensureEnvironmentModule = (): EnvironmentModule => {
    if (!environmentModule) {
        throw new Error("Environment utilities have not been initialized");
    }

    return environmentModule;
};

const cloneRecord = <T extends Record<string, string | undefined>>(
    source: T
): T => ({
    ...source,
});

const cloneVersions = (
    versions: ProcessSnapshot["versions"] | undefined
): ProcessSnapshot["versions"] => {
    if (!versions) {
        return versions;
    }

    return { ...versions };
};

const buildProcessSnapshot = (
    overrides: Partial<ProcessSnapshot> = {}
): ProcessSnapshot => {
    const defaultEnv = (mockProcess.env ?? {}) as Record<
        string,
        string | undefined
    >;
    const env = Object.hasOwn(overrides, "env")
        ? (overrides.env ?? {})
        : cloneRecord(defaultEnv);
    const versions = Object.hasOwn(overrides, "versions")
        ? overrides.versions
        : cloneVersions(mockProcess.versions);

    return { env, versions };
};

const applyProcessSnapshot = (
    snapshot: ProcessSnapshot | null
): EnvironmentModule => {
    const module = ensureEnvironmentModule();
    module.setProcessSnapshotOverrideForTesting(snapshot);
    return module;
};

const applyMockProcessSnapshot = (
    overrides?: Partial<ProcessSnapshot>
): EnvironmentModule => applyProcessSnapshot(buildProcessSnapshot(overrides));

const resetProcessSnapshot = (): void => {
    ensureEnvironmentModule().resetProcessSnapshotOverrideForTesting();
};

describe("Environment Detection Utilities", () => {
    beforeAll(async () => {
        environmentModule = await import("../../utils/environment");
    });

    beforeEach(() => {
        resetMockProcessState();
        vi.clearAllMocks();
        resetProcessSnapshot();
    });

    afterEach(() => {
        resetProcessSnapshot();
    });

    describe("getEnvironment", () => {
        it("should return NODE_ENV value when set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "production" },
            });

            expect(envModule.getEnvironment()).toBe("production");
        });

        it("should return 'unknown' when NODE_ENV is not set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({ env: {} });

            expect(envModule.getEnvironment()).toBe("unknown");
        });

        it("should return 'unknown' when process is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyProcessSnapshot(null);

            expect(envModule.getEnvironment()).toBe("unknown");
        });

        it("should handle all standard NODE_ENV values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = ensureEnvironmentModule();

            const environments = ["development", "production", "test"];

            for (const env of environments) {
                applyMockProcessSnapshot({ env: { NODE_ENV: env } });
                expect(envModule.getEnvironment()).toBe(env);
            }
        });
    });

    describe("getEnvVar", () => {
        it("should return environment variable value when it exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "test", CODECOV_TOKEN: "test-token" },
            });

            expect(envModule.getEnvVar("NODE_ENV")).toBe("test");
            expect(envModule.getEnvVar("CODECOV_TOKEN")).toBe("test-token");
        });

        it("should return undefined when environment variable doesn't exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({ env: {} });

            expect(envModule.getEnvVar("NODE_ENV")).toBeUndefined();
            expect(envModule.getEnvVar("CODECOV_TOKEN")).toBeUndefined();
        });

        it("should return undefined when process is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyProcessSnapshot(null);

            expect(envModule.getEnvVar("NODE_ENV")).toBeUndefined();
            expect(envModule.getEnvVar("CODECOV_TOKEN")).toBeUndefined();
        });

        it("should handle empty string values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "" },
            });

            expect(envModule.getEnvVar("NODE_ENV")).toBe("");
        });
    });

    describe("getNodeEnv", () => {
        it("should return NODE_ENV value when set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "production" },
            });

            expect(envModule.getNodeEnv()).toBe("production");
        });

        it("should return 'development' when NODE_ENV is not set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({ env: {} });

            expect(envModule.getNodeEnv()).toBe("development");
        });

        it("should return 'development' when process is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyProcessSnapshot(null);

            expect(envModule.getNodeEnv()).toBe("development");
        });

        it("should handle all standard NODE_ENV values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = ensureEnvironmentModule();

            const environments = ["development", "production", "test"];

            for (const env of environments) {
                applyMockProcessSnapshot({ env: { NODE_ENV: env } });
                expect(envModule.getNodeEnv()).toBe(env);
            }
        });
    });

    describe("isBrowserEnvironment", () => {
        let originalWindow: any = undefined;
        let originalDocument: any = undefined;

        beforeEach(() => {
            originalWindow = globalThis.window;
            originalDocument = globalThis.document;
        });

        afterEach(() => {
            globalThis.window = originalWindow;
            globalThis.document = originalDocument;
        });

        it("should return true when window and document exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            globalThis.window = {} as any;
            globalThis.document = {} as any;

            const { isBrowserEnvironment } =
                await import("../../utils/environment");

            expect(isBrowserEnvironment()).toBeTruthy();
        });

        it("should return false when window is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            globalThis.window = undefined as any;
            globalThis.document = {} as any;

            const { isBrowserEnvironment } =
                await import("../../utils/environment");

            expect(isBrowserEnvironment()).toBeFalsy();
        });

        it("should return false when document is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            globalThis.window = {} as any;
            globalThis.document = undefined as any;

            const { isBrowserEnvironment } =
                await import("../../utils/environment");

            expect(isBrowserEnvironment()).toBeFalsy();
        });

        it("should return false when both window and document are undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            globalThis.window = undefined as any;
            globalThis.document = undefined as any;

            const { isBrowserEnvironment } =
                await import("../../utils/environment");

            expect(isBrowserEnvironment()).toBeFalsy();
        });
    });

    describe("isDevelopment", () => {
        it("should return true when NODE_ENV is 'development'", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "development" },
            });

            expect(envModule.isDevelopment()).toBeTruthy();
        });

        it("should return false when NODE_ENV is 'production'", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "production" },
            });

            expect(envModule.isDevelopment()).toBeFalsy();
        });

        it("should return false when NODE_ENV is 'test'", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "test" },
            });

            expect(envModule.isDevelopment()).toBeFalsy();
        });

        it("should return false when NODE_ENV is not set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({ env: {} });

            expect(envModule.isDevelopment()).toBeFalsy();
        });

        it("should return false when process is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyProcessSnapshot(null);

            expect(envModule.isDevelopment()).toBeFalsy();
        });

        it("should be case sensitive", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "Development" },
            });

            expect(envModule.isDevelopment()).toBeFalsy();
        });
    });

    describe("isNodeEnvironment", () => {
        it("should return true when process and process.versions.node exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                versions: { node: "18.0.0" },
            });

            expect(envModule.isNodeEnvironment()).toBeTruthy();
        });

        it("should return false when process is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyProcessSnapshot(null);

            expect(envModule.isNodeEnvironment()).toBeFalsy();
        });

        it("should return false when process.versions is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                versions: undefined,
            });

            expect(envModule.isNodeEnvironment()).toBeFalsy();
        });

        it("should return false when process.versions is not an object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                versions: "not-an-object" as any,
            });

            expect(envModule.isNodeEnvironment()).toBeFalsy();
        });

        it("should return false when process.versions.node is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                versions: {} as any,
            });

            expect(envModule.isNodeEnvironment()).toBeFalsy();
        });

        it("should return false when process.versions.node is empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                versions: { node: "" } as any,
            });

            expect(envModule.isNodeEnvironment()).toBeFalsy();
        });
    });

    describe("isProduction", () => {
        it("should return true when NODE_ENV is 'production'", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "production" },
            });

            expect(envModule.isProduction()).toBeTruthy();
        });

        it("should return false when NODE_ENV is 'development'", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "development" },
            });

            expect(envModule.isProduction()).toBeFalsy();
        });

        it("should return false when NODE_ENV is 'test'", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "test" },
            });

            expect(envModule.isProduction()).toBeFalsy();
        });

        it("should return false when NODE_ENV is not set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({ env: {} });

            expect(envModule.isProduction()).toBeFalsy();
        });

        it("should return false when process is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyProcessSnapshot(null);

            expect(envModule.isProduction()).toBeFalsy();
        });

        it("should be case sensitive", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "Production" },
            });

            expect(envModule.isProduction()).toBeFalsy();
        });
    });

    describe("isTest", () => {
        it("should return true when NODE_ENV is 'test'", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "test" },
            });

            expect(envModule.isTest()).toBeTruthy();
        });

        it("should return false when NODE_ENV is 'development'", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "development" },
            });

            expect(envModule.isTest()).toBeFalsy();
        });

        it("should return false when NODE_ENV is 'production'", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "production" },
            });

            expect(envModule.isTest()).toBeFalsy();
        });

        it("should return false when NODE_ENV is not set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({ env: {} });

            expect(envModule.isTest()).toBeFalsy();
        });

        it("should return false when process is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyProcessSnapshot(null);

            expect(envModule.isTest()).toBeFalsy();
        });

        it("should be case sensitive", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = applyMockProcessSnapshot({
                env: { NODE_ENV: "Test" },
            });

            expect(envModule.isTest()).toBeFalsy();
        });
    });

    describe("Edge cases and integration", () => {
        it("should handle multiple environment checks consistently", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            applyMockProcessSnapshot({ env: { NODE_ENV: "development" } });

            const envModule = ensureEnvironmentModule();
            const {
                isDevelopment,
                isProduction,
                isTest,
                getNodeEnv,
                getEnvironment,
            } = envModule;

            expect(isDevelopment()).toBeTruthy();
            expect(isProduction()).toBeFalsy();
            expect(isTest()).toBeFalsy();
            expect(getNodeEnv()).toBe("development");
            expect(getEnvironment()).toBe("development");
        });

        it("should handle undefined process consistently across all functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            applyProcessSnapshot(null);

            const envModule = ensureEnvironmentModule();
            const {
                isDevelopment,
                isProduction,
                isTest,
                isNodeEnvironment,
                getNodeEnv,
                getEnvironment,
                getEnvVar,
            } = envModule;

            expect(isDevelopment()).toBeFalsy();
            expect(isProduction()).toBeFalsy();
            expect(isTest()).toBeFalsy();
            expect(isNodeEnvironment()).toBeFalsy();
            expect(getNodeEnv()).toBe("development");
            expect(getEnvironment()).toBe("unknown");
            expect(getEnvVar("NODE_ENV")).toBeUndefined();
        });

        it("should handle different falsy values for environment variables", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: environment", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const envModule = ensureEnvironmentModule();

            const falsyValues = ["", "0", "false"];

            for (const value of falsyValues) {
                applyMockProcessSnapshot({ env: { NODE_ENV: value } });
                expect(envModule.getEnvVar("NODE_ENV")).toBe(value);
            }
        });
    });
});
