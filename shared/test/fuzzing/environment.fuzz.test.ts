/**
 * @fileoverview Fuzzing tests for environment utilities
 * @author AI Generated
 * @since 2024
 */

import fc from "fast-check";
import { test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";
import {
    getEnvVar,
    getEnvironment,
    getNodeEnv,
    isBrowserEnvironment,
    isDevelopment,
    isNodeEnvironment,
    isProduction,
    isTest,
} from "../../utils/environment";

describe("Environment utilities fuzzing tests", () => {
    describe(getEnvVar, () => {
        test.prop([
            fc.constantFrom("NODE_ENV", "CODECOV_TOKEN"),
            fc.oneof(fc.constant(undefined), fc.string())
        ])("should safely handle environment variable access", (key, envValue) => {
            // Mock process.env for this test
            const originalProcess = globalThis.process;

            globalThis.process = envValue === undefined ? {
                    ...originalProcess,
                    env: {}
                } as any : {
                    ...originalProcess,
                    env: { [key]: envValue }
                } as any;

            const result = getEnvVar(key as "NODE_ENV" | "CODECOV_TOKEN");

            if (envValue === undefined) {
                expect(result).toBeUndefined();
            } else {
                expect(result).toBe(envValue);
            }

            // Restore original process
            globalThis.process = originalProcess;
        });

        it("should handle missing process object", () => {
            const originalProcess = globalThis.process;
            delete (globalThis as any).process;

            const result = getEnvVar("NODE_ENV");
            expect(result).toBeUndefined();

            // Restore original process
            globalThis.process = originalProcess;
        });

        it("should handle process.env access errors", () => {
            const originalProcess = globalThis.process;
            globalThis.process = {
                ...originalProcess,
                env: new Proxy({}, {
                    get() {
                        throw new Error("Access denied");
                    }
                })
            } as any;

            const result = getEnvVar("NODE_ENV");
            expect(result).toBeUndefined();

            // Restore original process
            globalThis.process = originalProcess;
        });
    });

    describe(getEnvironment, () => {
        test.prop([
            fc.oneof(
                fc.constant(undefined),
                fc.constantFrom("development", "production", "test"),
                fc.string()
            )
        ])("should return environment name or unknown", (nodeEnv) => {
            const originalProcess = globalThis.process;

            globalThis.process = nodeEnv === undefined ? {
                    ...originalProcess,
                    env: {}
                } as any : {
                    ...originalProcess,
                    env: { NODE_ENV: nodeEnv }
                } as any;

            const result = getEnvironment();

            if (nodeEnv === undefined) {
                expect(result).toBe("unknown");
            } else {
                expect(result).toBe(nodeEnv);
            }

            // Restore original process
            globalThis.process = originalProcess;
        });

        it("should return unknown when process is undefined", () => {
            const originalProcess = globalThis.process;
            delete (globalThis as any).process;

            const result = getEnvironment();
            expect(result).toBe("unknown");

            // Restore original process
            globalThis.process = originalProcess;
        });
    });

    describe(getNodeEnv, () => {
        test.prop([
            fc.oneof(
                fc.constant(undefined),
                fc.constantFrom("development", "production", "test"),
                fc.string()
            )
        ])("should return NODE_ENV or development as fallback", (nodeEnv) => {
            const originalProcess = globalThis.process;

            globalThis.process = nodeEnv === undefined ? {
                    ...originalProcess,
                    env: {}
                } as any : {
                    ...originalProcess,
                    env: { NODE_ENV: nodeEnv }
                } as any;

            const result = getNodeEnv();

            if (nodeEnv === undefined) {
                expect(result).toBe("development");
            } else {
                expect(result).toBe(nodeEnv);
            }

            // Restore original process
            globalThis.process = originalProcess;
        });

        it("should return development when process is undefined", () => {
            const originalProcess = globalThis.process;
            delete (globalThis as any).process;

            const result = getNodeEnv();
            expect(result).toBe("development");

            // Restore original process
            globalThis.process = originalProcess;
        });
    });

    describe(isBrowserEnvironment, () => {
        test.prop([
            fc.oneof(fc.constant(undefined), fc.record({})),
            fc.oneof(fc.constant(undefined), fc.record({}))
        ])("should detect browser environment based on window and document", (windowObj, documentObj) => {
            const originalWindow = (globalThis as any).window;
            const originalDocument = (globalThis as any).document;

            if (windowObj) {
                (globalThis as any).window = windowObj;
            } else {
                delete (globalThis as any).window;
            }

            if (documentObj) {
                (globalThis as any).document = documentObj;
            } else {
                delete (globalThis as any).document;
            }

            const result = isBrowserEnvironment();
            const expected = windowObj !== undefined && documentObj !== undefined;
            expect(result).toBe(expected);

            // Restore originals
            if (originalWindow === undefined) {
                delete (globalThis as any).window;
            } else {
                (globalThis as any).window = originalWindow;
            }
            if (originalDocument === undefined) {
                delete (globalThis as any).document;
            } else {
                (globalThis as any).document = originalDocument;
            }
        });
    });

    describe(isDevelopment, () => {
        test.prop([
            fc.oneof(
                fc.constant(undefined),
                fc.constantFrom("development", "production", "test"),
                fc.string()
            )
        ])("should return true only for development environment", (nodeEnv) => {
            const originalProcess = globalThis.process;

            globalThis.process = nodeEnv === undefined ? {
                    ...originalProcess,
                    env: {}
                } as any : {
                    ...originalProcess,
                    env: { NODE_ENV: nodeEnv }
                } as any;

            const result = isDevelopment();
            expect(result).toBe(nodeEnv === "development");

            // Restore original process
            globalThis.process = originalProcess;
        });

        it("should return false when process is undefined", () => {
            const originalProcess = globalThis.process;
            delete (globalThis as any).process;

            const result = isDevelopment();
            expect(result).toBeFalsy();

            // Restore original process
            globalThis.process = originalProcess;
        });
    });

    describe(isNodeEnvironment, () => {
        test.prop([
            fc.oneof(
                fc.constant(undefined),
                fc.record({
                    versions: fc.oneof(
                        fc.constant(undefined),
                        fc.record({ node: fc.string() }),
                        fc.string(),
                        fc.integer()
                    )
                })
            )
        ])("should detect Node.js environment", (processObj) => {
            const originalProcess = globalThis.process;

            if (processObj) {
                globalThis.process = processObj as any;
            } else {
                delete (globalThis as any).process;
            }

            const result = isNodeEnvironment();

            const expected = processObj !== undefined &&
                            typeof processObj.versions === "object" &&
                            Boolean((processObj.versions as any)?.node);

            expect(result).toBe(expected);

            // Restore original process
            globalThis.process = originalProcess;
        });
    });

    describe(isProduction, () => {
        test.prop([
            fc.oneof(
                fc.constant(undefined),
                fc.constantFrom("development", "production", "test"),
                fc.string()
            )
        ])("should return true only for production environment", (nodeEnv) => {
            const originalProcess = globalThis.process;

            globalThis.process = nodeEnv === undefined ? {
                    ...originalProcess,
                    env: {}
                } as any : {
                    ...originalProcess,
                    env: { NODE_ENV: nodeEnv }
                } as any;

            const result = isProduction();
            expect(result).toBe(nodeEnv === "production");

            // Restore original process
            globalThis.process = originalProcess;
        });

        it("should return false when process is undefined", () => {
            const originalProcess = globalThis.process;
            delete (globalThis as any).process;

            const result = isProduction();
            expect(result).toBeFalsy();

            // Restore original process
            globalThis.process = originalProcess;
        });
    });

    describe(isTest, () => {
        test.prop([
            fc.oneof(
                fc.constant(undefined),
                fc.constantFrom("development", "production", "test"),
                fc.string()
            )
        ])("should return true only for test environment", (nodeEnv) => {
            const originalProcess = globalThis.process;

            globalThis.process = nodeEnv === undefined ? {
                    ...originalProcess,
                    env: {}
                } as any : {
                    ...originalProcess,
                    env: { NODE_ENV: nodeEnv }
                } as any;

            const result = isTest();
            expect(result).toBe(nodeEnv === "test");

            // Restore original process
            globalThis.process = originalProcess;
        });

        it("should return false when process is undefined", () => {
            const originalProcess = globalThis.process;
            delete (globalThis as any).process;

            const result = isTest();
            expect(result).toBeFalsy();

            // Restore original process
            globalThis.process = originalProcess;
        });
    });

    describe("Edge cases and invariants", () => {
        test.prop([
            fc.oneof(
                fc.constant(undefined),
                fc.record({}),
                fc.record({ env: fc.record({}) }),
                fc.record({ env: fc.record({ NODE_ENV: fc.string() }) }),
                fc.record({ versions: fc.record({}) }),
                fc.record({ versions: fc.record({ node: fc.string() }) })
            )
        ])(
            "all environment functions should handle various process objects",
            (processObj) => {
                // Test with various valid process-like objects
                const originalProcess = globalThis.process;
                const originalWindow = (globalThis as any).window;
                const originalDocument = (globalThis as any).document;

                try {
                    // Test with valid process object variations
                    if (processObj === undefined) {
                        delete (globalThis as any).process;
                    } else {
                        globalThis.process = processObj as any;
                    }

                    expect(() => getEnvVar("NODE_ENV")).not.toThrow();
                    expect(() => getEnvironment()).not.toThrow();
                    expect(() => getNodeEnv()).not.toThrow();
                    expect(() => isDevelopment()).not.toThrow();
                    expect(() => isNodeEnvironment()).not.toThrow();
                    expect(() => isProduction()).not.toThrow();
                    expect(() => isTest()).not.toThrow();

                    // Test browser environment detection
                    expect(() => isBrowserEnvironment()).not.toThrow();
                } finally {
                    // Restore originals
                    globalThis.process = originalProcess;
                    (globalThis as any).window = originalWindow;
                    (globalThis as any).document = originalDocument;
                }
            }
        );

        test.prop([fc.string()])(
            "environment detection should be consistent",
            (nodeEnv) => {
                const originalProcess = globalThis.process;
                globalThis.process = {
                    ...originalProcess,
                    env: { NODE_ENV: nodeEnv }
                } as any;

                const environment = getEnvironment();
                const nodeEnvironment = getNodeEnv();
                const isDev = isDevelopment();
                const isProd = isProduction();
                const isTestEnv = isTest();

                // Consistency checks
                expect(environment).toBe(nodeEnv);
                expect(nodeEnvironment).toBe(nodeEnv);
                expect(isDev).toBe(nodeEnv === "development");
                expect(isProd).toBe(nodeEnv === "production");
                expect(isTestEnv).toBe(nodeEnv === "test");

                // Only one environment should be true at a time
                const trueCount = [isDev, isProd, isTestEnv].filter(Boolean).length;
                if (["development", "production", "test"].includes(nodeEnv)) {
                    expect(trueCount).toBe(1);
                } else {
                    expect(trueCount).toBe(0);
                }

                // Restore original process
                globalThis.process = originalProcess;
            }
        );
    });
});
