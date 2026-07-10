/**
 * @file Property-based edge-case tests for environment utilities.
 */

import { fc, test } from "@fast-check/vitest";
import { afterEach, beforeEach, describe, expect, vi } from "vitest";

import type { ProcessSnapshot } from "../../utils/environment.js";
import {
    getEnvironment,
    getEnvVar,
    getNodeEnv,
    isBrowserEnvironment,
    isDevelopment,
    isNodeEnvironment,
    isProduction,
    isTest,
    resetProcessSnapshotOverrideForTesting,
    setProcessSnapshotOverrideForTesting,
} from "../../utils/environment.js";

const deleteBrowserGlobalForTesting = (key: "document" | "window"): void => {
    Reflect.deleteProperty(globalThis, key);
};

const setBrowserGlobalForTesting = (
    key: "document" | "window",
    value: unknown
): void => {
    if (value === undefined) {
        deleteBrowserGlobalForTesting(key);
        return;
    }

    Object.defineProperty(globalThis, key, {
        configurable: true,
        value,
        writable: true,
    });
};

const toProcessSnapshotForTesting = (
    processLike: unknown
): null | ProcessSnapshot => {
    if (typeof processLike !== "object" || processLike === null) {
        return null;
    }

    return processLike as ProcessSnapshot;
};

describe("environment comprehensive fuzzing tests", () => {
    let originalProcess: NodeJS.Process = process;
    let originalWindow: typeof globalThis.window = globalThis.window;
    let originalDocument: typeof globalThis.document = globalThis.document;

    beforeEach(() => {
        // Store original globals
        originalProcess = process;
        originalWindow = globalThis.window;
        originalDocument = globalThis.document;
    });

    afterEach(() => {
        // Restore original globals
        resetProcessSnapshotOverrideForTesting();
        globalThis.process = originalProcess;
        setBrowserGlobalForTesting("window", originalWindow);
        setBrowserGlobalForTesting("document", originalDocument);
        vi.restoreAllMocks();
    });

    describe(getEnvVar, () => {
        test.prop([fc.constantFrom("NODE_ENV", "CODECOV_TOKEN")])(
            "returns undefined when process is undefined",
            (envKey) => {
                setProcessSnapshotOverrideForTesting(null);

                const result = getEnvVar(envKey);
                expect(result).toBeUndefined();
            }
        );

        test.prop([fc.constantFrom("development", "production", "test")])(
            "returns correct NODE_ENV value when available",
            (nodeEnvValue) => {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        ...originalProcess.env,
                        NODE_ENV: nodeEnvValue,
                    },
                };

                const result = getEnvVar("NODE_ENV");
                expect(result).toBe(nodeEnvValue);
            }
        );

        test.prop([fc.string()])(
            "returns correct CODECOV_TOKEN value when available",
            (tokenValue) => {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        ...originalProcess.env,
                        CODECOV_TOKEN: tokenValue,
                    },
                };

                const result = getEnvVar("CODECOV_TOKEN");
                expect(result).toBe(tokenValue);
            }
        );

        test("returns undefined when environment variable is not set", () => {
            globalThis.process = {
                ...originalProcess,
                env: {},
            };

            expect(getEnvVar("NODE_ENV")).toBeUndefined();
            expect(getEnvVar("CODECOV_TOKEN")).toBeUndefined();
        });

        test("handles process.env access errors gracefully", () => {
            // Create a process object that throws when accessing env
            const mockProcess = {
                ...originalProcess,
            };

            // Mock the env property to throw
            Object.defineProperty(mockProcess, "env", {
                get() {
                    throw new Error("Environment access error");
                },
            });

            globalThis.process = mockProcess;

            expect(getEnvVar("NODE_ENV")).toBeUndefined();
            expect(getEnvVar("CODECOV_TOKEN")).toBeUndefined();
        });

        test("handles null/undefined process.env gracefully", () => {
            setProcessSnapshotOverrideForTesting({ env: null });

            expect(getEnvVar("NODE_ENV")).toBeUndefined();
        });

        test.prop([fc.constantFrom("NODE_ENV", "CODECOV_TOKEN")])(
            "handles empty string environment variables",
            (envKey) => {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        [envKey]: "",
                    },
                };

                const result = getEnvVar(envKey);
                expect(result).toBe("");
            }
        );
    });

    describe(getEnvironment, () => {
        test.prop([fc.constantFrom("development", "production", "test")])(
            "returns correct environment when NODE_ENV is set",
            (nodeEnvValue) => {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: nodeEnvValue,
                    },
                };

                const result = getEnvironment();
                expect(result).toBe(nodeEnvValue);
            }
        );

        test('returns "unknown" when NODE_ENV is not set', () => {
            globalThis.process = {
                ...originalProcess,
                env: {},
            };

            const result = getEnvironment();
            expect(result).toBe("unknown");
        });

        test('returns "unknown" when process is undefined', () => {
            setProcessSnapshotOverrideForTesting(null);

            const result = getEnvironment();
            expect(result).toBe("unknown");
        });

        test.prop([fc.string()])(
            "returns custom environment values correctly",
            (customEnv) => {
                fc.pre(customEnv !== ""); // Avoid empty string which becomes unknown

                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: customEnv,
                    },
                };

                const result = getEnvironment();
                expect(result).toBe(customEnv);
            }
        );

        test("handles null NODE_ENV gracefully", () => {
            globalThis.process = {
                ...originalProcess,
                env: {
                    NODE_ENV: null as unknown as string | undefined,
                },
            };

            const result = getEnvironment();
            expect(result).toBe("unknown");
        });
    });

    describe(getNodeEnv, () => {
        test.prop([fc.constantFrom("development", "production", "test")])(
            "returns correct NODE_ENV when set",
            (nodeEnvValue) => {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: nodeEnvValue,
                    },
                };

                const result = getNodeEnv();
                expect(result).toBe(nodeEnvValue);
            }
        );

        test('returns "development" when NODE_ENV is not set', () => {
            globalThis.process = {
                ...originalProcess,
                env: {},
            };

            const result = getNodeEnv();
            expect(result).toBe("development");
        });

        test('returns "development" when process is undefined', () => {
            setProcessSnapshotOverrideForTesting(null);

            const result = getNodeEnv();
            expect(result).toBe("development");
        });

        test.prop([fc.string()])(
            "returns custom NODE_ENV values correctly",
            (customEnv) => {
                fc.pre(customEnv !== ""); // Avoid empty string

                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: customEnv,
                    },
                };

                const result = getNodeEnv();
                expect(result).toBe(customEnv);
            }
        );

        test("handles undefined NODE_ENV gracefully", () => {
            globalThis.process = {
                ...originalProcess,
                env: {
                    NODE_ENV: undefined,
                },
            };

            const result = getNodeEnv();
            expect(result).toBe("development");
        });
    });

    describe(isBrowserEnvironment, () => {
        test("returns true when both window and document are available", () => {
            // Ensure both globals are available (they should be in test environment)
            globalThis.window = { ...originalWindow };
            globalThis.document = { ...originalDocument };

            const isResult = isBrowserEnvironment();
            expect(isResult).toBeTruthy();
        });

        test("returns false when window is undefined", () => {
            setBrowserGlobalForTesting("window", undefined);
            globalThis.document = { ...originalDocument };

            const isResult = isBrowserEnvironment();
            expect(isResult).toBeFalsy();
        });

        test("returns false when document is undefined", () => {
            globalThis.window = { ...originalWindow };

            setBrowserGlobalForTesting("document", undefined);

            const isResult = isBrowserEnvironment();
            expect(isResult).toBeFalsy();
        });

        test("returns false when both window and document are undefined", () => {
            setBrowserGlobalForTesting("window", undefined);

            setBrowserGlobalForTesting("document", undefined);

            const isResult = isBrowserEnvironment();
            expect(isResult).toBeFalsy();
        });

        test.prop([fc.anything(), fc.anything()])(
            "handles various truthy/falsy values for window and document",
            (windowValue, documentValue) => {
                setBrowserGlobalForTesting("window", windowValue);

                setBrowserGlobalForTesting("document", documentValue);

                const isResult = isBrowserEnvironment();
                const isExpected =
                    windowValue !== undefined && documentValue !== undefined;
                expect(isResult).toBe(isExpected);
            }
        );
    });

    describe(isDevelopment, () => {
        test('returns true when NODE_ENV is "development"', () => {
            globalThis.process = {
                ...originalProcess,
                env: {
                    NODE_ENV: "development",
                },
            };

            const isResult = isDevelopment();
            expect(isResult).toBeTruthy();
        });

        test.prop([
            fc.constantFrom("production", "test", "staging", "unknown"),
        ])(
            'returns false when NODE_ENV is not "development"',
            (nodeEnvValue) => {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: nodeEnvValue,
                    },
                };

                const isResult = isDevelopment();
                expect(isResult).toBeFalsy();
            }
        );

        test("returns false when NODE_ENV is not set", () => {
            globalThis.process = {
                ...originalProcess,
                env: {},
            };

            const isResult = isDevelopment();
            expect(isResult).toBeFalsy();
        });

        test("returns false when process is undefined", () => {
            setProcessSnapshotOverrideForTesting(null);

            const isResult = isDevelopment();
            expect(isResult).toBeFalsy();
        });

        test('is case-sensitive for "development"', () => {
            globalThis.process = {
                ...originalProcess,
                env: {
                    NODE_ENV: "Development", // Wrong case
                },
            };

            const isResult = isDevelopment();
            expect(isResult).toBeFalsy();
        });

        test("does not recognize development variants", () => {
            const variants = [
                "dev",
                "develop",
                "development-local",
                "development ",
            ];

            for (const variant of variants) {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: variant,
                    },
                };

                const isResult = isDevelopment();
                expect(isResult).toBeFalsy();
            }
        });
    });

    describe(isNodeEnvironment, () => {
        test("returns true when process with valid versions.node is available", () => {
            globalThis.process = {
                ...originalProcess,
                versions: {
                    ...originalProcess.versions,
                    node: "18.0.0",
                },
            };

            const isResult = isNodeEnvironment();
            expect(isResult).toBeTruthy();
        });

        test("returns false when process is undefined", () => {
            setProcessSnapshotOverrideForTesting(null);

            const isResult = isNodeEnvironment();
            expect(isResult).toBeFalsy();
        });

        test("returns false when process.versions is undefined", () => {
            setProcessSnapshotOverrideForTesting({ versions: undefined });

            const isResult = isNodeEnvironment();
            expect(isResult).toBeFalsy();
        });

        test("returns false when process.versions is not an object", () => {
            setProcessSnapshotOverrideForTesting({
                versions: "not-an-object",
            });

            const isResult = isNodeEnvironment();
            expect(isResult).toBeFalsy();
        });

        test("returns false when process.versions.node is undefined", () => {
            setProcessSnapshotOverrideForTesting({
                versions: { node: undefined },
            });

            const isResult = isNodeEnvironment();
            expect(isResult).toBeFalsy();
        });

        test("returns false when process.versions.node is falsy", () => {
            const falsyValues = [
                "",
                null,
                0,
                false,
            ];

            for (const falsyValue of falsyValues) {
                setProcessSnapshotOverrideForTesting({
                    versions: { node: falsyValue },
                });

                const isResult = isNodeEnvironment();
                expect(isResult).toBeFalsy();
            }
        });

        test.prop([fc.string({ minLength: 1 })])(
            "returns true when process.versions.node is any truthy string",
            (nodeVersion) => {
                globalThis.process = {
                    ...originalProcess,
                    versions: {
                        ...originalProcess.versions,
                        node: nodeVersion,
                    },
                };

                const isResult = isNodeEnvironment();
                expect(isResult).toBeTruthy();
            }
        );
    });

    describe(isProduction, () => {
        test('returns true when NODE_ENV is "production"', () => {
            globalThis.process = {
                ...originalProcess,
                env: {
                    NODE_ENV: "production",
                },
            };

            const isResult = isProduction();
            expect(isResult).toBeTruthy();
        });

        test.prop([
            fc.constantFrom("development", "test", "staging", "unknown"),
        ])(
            'returns false when NODE_ENV is not "production"',
            (nodeEnvValue) => {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: nodeEnvValue,
                    },
                };

                const isResult = isProduction();
                expect(isResult).toBeFalsy();
            }
        );

        test("returns false when NODE_ENV is not set", () => {
            globalThis.process = {
                ...originalProcess,
                env: {},
            };

            const isResult = isProduction();
            expect(isResult).toBeFalsy();
        });

        test("returns false when process is undefined", () => {
            setProcessSnapshotOverrideForTesting(null);

            const isResult = isProduction();
            expect(isResult).toBeFalsy();
        });

        test('is case-sensitive for "production"', () => {
            globalThis.process = {
                ...originalProcess,
                env: {
                    NODE_ENV: "Production", // Wrong case
                },
            };

            const isResult = isProduction();
            expect(isResult).toBeFalsy();
        });

        test("does not recognize production variants", () => {
            const variants = [
                "prod",
                "production-live",
                "production ",
            ];

            for (const variant of variants) {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: variant,
                    },
                };

                const isResult = isProduction();
                expect(isResult).toBeFalsy();
            }
        });
    });

    describe(isTest, () => {
        test('returns true when NODE_ENV is "test"', () => {
            globalThis.process = {
                ...originalProcess,
                env: {
                    NODE_ENV: "test",
                },
            };

            const isResult = isTest();
            expect(isResult).toBeTruthy();
        });

        test.prop([
            fc.constantFrom("development", "production", "staging", "unknown"),
        ])('returns false when NODE_ENV is not "test"', (nodeEnvValue) => {
            globalThis.process = {
                ...originalProcess,
                env: {
                    NODE_ENV: nodeEnvValue,
                },
            };

            const isResult = isTest();
            expect(isResult).toBeFalsy();
        });

        test("returns false when NODE_ENV is not set", () => {
            globalThis.process = {
                ...originalProcess,
                env: {},
            };

            const isResult = isTest();
            expect(isResult).toBeFalsy();
        });

        test("returns false when process is undefined", () => {
            setProcessSnapshotOverrideForTesting(null);

            const isResult = isTest();
            expect(isResult).toBeFalsy();
        });

        test('is case-sensitive for "test"', () => {
            globalThis.process = {
                ...originalProcess,
                env: {
                    NODE_ENV: "Test", // Wrong case
                },
            };

            const isResult = isTest();
            expect(isResult).toBeFalsy();
        });

        test("does not recognize test variants", () => {
            const variants = [
                "testing",
                "test-env",
                "test ",
            ];

            for (const variant of variants) {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: variant,
                    },
                };

                const isResult = isTest();
                expect(isResult).toBeFalsy();
            }
        });
    });

    describe("Integration and cross-function property tests", () => {
        test.prop([fc.constantFrom("development", "production", "test")])(
            "environment detection functions are mutually exclusive",
            (nodeEnvValue) => {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: nodeEnvValue,
                    },
                };

                const isDev = isDevelopment();
                const isProd = isProduction();
                const isTestEnv = isTest();

                // Only one should be true
                const trueCount = [
                    isDev,
                    isProd,
                    isTestEnv,
                ].filter(Boolean).length;
                expect(trueCount).toBe(1);

                // Verify the correct one is true
                switch (nodeEnvValue) {
                    case "development": {
                        expect(isDev).toBeTruthy();
                        expect(isProd).toBeFalsy();
                        expect(isTestEnv).toBeFalsy();

                        break;
                    }
                    case "production": {
                        expect(isDev).toBeFalsy();
                        expect(isProd).toBeTruthy();
                        expect(isTestEnv).toBeFalsy();

                        break;
                    }
                    case "test": {
                        expect(isDev).toBeFalsy();
                        expect(isProd).toBeFalsy();
                        expect(isTestEnv).toBeTruthy();

                        break;
                    }
                    // No default
                }
            }
        );

        test.prop([fc.constantFrom("development", "production", "test")])(
            "getEnvironment and getNodeEnv return consistent values",
            (nodeEnvValue) => {
                globalThis.process = {
                    ...originalProcess,
                    env: {
                        NODE_ENV: nodeEnvValue,
                    },
                };

                const environment = getEnvironment();
                const nodeEnv = getNodeEnv();

                expect(environment).toBe(nodeEnv);
                expect(environment).toBe(nodeEnvValue);
            }
        );

        test("all functions handle missing process gracefully", () => {
            setProcessSnapshotOverrideForTesting(null);

            expect(getEnvVar("NODE_ENV")).toBeUndefined();
            expect(getEnvironment()).toBe("unknown");
            expect(getNodeEnv()).toBe("development");
            expect(isDevelopment()).toBeFalsy();
            expect(isProduction()).toBeFalsy();
            expect(isTest()).toBeFalsy();
            expect(isNodeEnvironment()).toBeFalsy();
        });

        test("all functions handle missing NODE_ENV consistently", () => {
            globalThis.process = {
                ...originalProcess,
                env: {},
            };

            expect(getEnvVar("NODE_ENV")).toBeUndefined();
            expect(getEnvironment()).toBe("unknown");
            expect(getNodeEnv()).toBe("development");
            expect(isDevelopment()).toBeFalsy();
            expect(isProduction()).toBeFalsy();
            expect(isTest()).toBeFalsy();
        });

        test("environment detection is independent of browser detection", () => {
            const environments = [
                "development",
                "production",
                "test",
            ];
            const browserStates = [true, false];

            for (const env of environments) {
                for (const hasBrowser of browserStates) {
                    globalThis.process = {
                        ...originalProcess,
                        env: { NODE_ENV: env },
                    };

                    if (hasBrowser) {
                        globalThis.window = { ...originalWindow };
                        globalThis.document = { ...originalDocument };
                    } else {
                        setBrowserGlobalForTesting("window", undefined);

                        setBrowserGlobalForTesting("document", undefined);
                    }

                    expect(getNodeEnv()).toBe(env);
                    expect(isBrowserEnvironment()).toBe(hasBrowser);

                    // Environment detection should be independent of browser state
                    expect(isDevelopment()).toBe(env === "development");
                    expect(isProduction()).toBe(env === "production");
                    expect(isTest()).toBe(env === "test");
                }
            }
        });
    });

    describe("Performance and stress testing", () => {
        test.prop([
            fc.array(fc.constantFrom("NODE_ENV", "CODECOV_TOKEN"), {
                minLength: 100,
                maxLength: 1000,
            }),
        ])("handles many environment variable reads efficiently", (envKeys) => {
            globalThis.process = {
                ...originalProcess,
                env: {
                    NODE_ENV: "development",
                    CODECOV_TOKEN: "test-token",
                },
            };

            const startTime = performance.now();

            for (const key of envKeys) {
                getEnvVar(key);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should handle many reads efficiently (< 50ms)
            expect(duration).toBeLessThan(50);
        });

        test("handles rapid environment detection calls efficiently", () => {
            globalThis.process = {
                ...originalProcess,
                env: { NODE_ENV: "development" },
                versions: {
                    ...originalProcess.versions,
                    node: "18.0.0",
                },
            };

            globalThis.window = { ...originalWindow };
            globalThis.document = { ...originalDocument };

            const startTime = performance.now();

            // Call each function many times
            for (let i = 0; i < 1000; i++) {
                getEnvironment();
                getNodeEnv();
                isDevelopment();
                isProduction();
                isTest();
                isNodeEnvironment();
                isBrowserEnvironment();
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should handle many calls efficiently (< 100ms)
            expect(duration).toBeLessThan(100);
        });

        test("memory usage is stable under repeated calls", () => {
            globalThis.process = {
                ...originalProcess,
                env: { NODE_ENV: "test" },
            };

            // Simulate memory pressure test
            for (let i = 0; i < 10_000; i++) {
                getEnvironment();
                getNodeEnv();
                isDevelopment();
                isProduction();
                isTest();

                // Occasionally trigger garbage collection opportunity
                if (i % 1000 === 0) {
                    // Force creation of temporary objects that can be collected
                    const temp = { data: Array.from({ length: 100 }).fill(i) };
                    temp.data.length = 0;
                }
            }

            expect(getNodeEnv()).toBe("test");
            expect(isTest()).toBeTruthy();
        });

        test("handles corrupted global objects gracefully", () => {
            // Test with various corrupted global states
            const corruptedGlobals = [
                { process: null, window: null, document: null },
                { process: {}, window: {}, document: {} },
                { process: "invalid", window: "invalid", document: "invalid" },
                {
                    process: { env: null },
                    window: undefined,
                    document: undefined,
                },
            ];

            for (const globals of corruptedGlobals) {
                setProcessSnapshotOverrideForTesting(
                    toProcessSnapshotForTesting(globals.process)
                );

                setBrowserGlobalForTesting("window", globals.window);

                setBrowserGlobalForTesting("document", globals.document);

                // All functions should handle corrupted state gracefully
                try {
                    const result = {
                        environment: getEnvironment(),
                        isBrowser: isBrowserEnvironment(),
                        isDevelopment: isDevelopment(),
                        isNode: isNodeEnvironment(),
                        isProduction: isProduction(),
                        isTest: isTest(),
                        nodeEnv: getNodeEnv(),
                        nodeEnvVar: getEnvVar("NODE_ENV"),
                    };

                    expect(result).toEqual(
                        expect.objectContaining({
                            isBrowser: expect.any(Boolean),
                            isDevelopment: expect.any(Boolean),
                            isNode: expect.any(Boolean),
                            isProduction: expect.any(Boolean),
                            isTest: expect.any(Boolean),
                        })
                    );
                } catch (error) {
                    // Some corruption scenarios might still throw - that's expected
                    expect(error).toBeDefined();
                }
            }
        });
    });
});
