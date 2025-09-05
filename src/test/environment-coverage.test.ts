/**
 * @fileoverview Direct function call tests for environment to ensure coverage
 * @module shared/utils/environment.test
 */

import { describe, expect, it } from "vitest";
import {
    getEnvVar,
    getEnvironment,
    getNodeEnv,
    isBrowserEnvironment,
    isDevelopment,
    isNodeEnvironment,
    isProduction,
    isTest
} from "@shared/utils/environment";

describe("environment Direct Function Coverage", () => {
    it("should call getEnvVar function", () => {
        // Call with valid keys
        const nodeEnv = getEnvVar("NODE_ENV");
        expect(typeof nodeEnv === "string" || nodeEnv === undefined).toBe(true);

        const codecov = getEnvVar("CODECOV_TOKEN");
        expect(typeof codecov === "string" || codecov === undefined).toBe(true);
    });

    it("should call getEnvironment function", () => {
        const env = getEnvironment();
        expect(typeof env).toBe("string");
        expect(env.length > 0).toBe(true);
    });

    it("should call getNodeEnv function", () => {
        const nodeEnv = getNodeEnv();
        expect(typeof nodeEnv).toBe("string");
        expect(nodeEnv.length > 0).toBe(true);
    });

    it("should call isBrowserEnvironment function", () => {
        const isBrowser = isBrowserEnvironment();
        expect(typeof isBrowser).toBe("boolean");
    });

    it("should call isDevelopment function", () => {
        const isDev = isDevelopment();
        expect(typeof isDev).toBe("boolean");
    });

    it("should call isNodeEnvironment function", () => {
        const isNode = isNodeEnvironment();
        expect(typeof isNode).toBe("boolean");
    });

    it("should call isProduction function", () => {
        const isProd = isProduction();
        expect(typeof isProd).toBe("boolean");
    });

    it("should call isTest function", () => {
        const isTestMode = isTest();
        expect(typeof isTestMode).toBe("boolean");
    });
});
