/**
 * Complete function coverage tests for shared/utils/environment.ts
 *
 * @description
 * Tests all exported functions to achieve 100% function coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Import all functions from environment utils
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

describe("shared/utils/environment.ts - Complete Function Coverage", () => {
  const originalProcess = global.process;
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset global state before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original globals
    global.process = originalProcess;
    global.window = originalWindow;
  });

  describe("getEnvVar", () => {
    it("should return environment variable value when process exists", () => {
      // Mock process with env
      global.process = {
        env: {
          NODE_ENV: "test",
          CODECOV_TOKEN: "test-token",
        }
      } as any;

      expect(getEnvVar("NODE_ENV")).toBe("test");
      expect(getEnvVar("CODECOV_TOKEN")).toBe("test-token");
    });

    it("should return undefined when process is undefined", () => {
      global.process = undefined as any;
      expect(getEnvVar("NODE_ENV")).toBeUndefined();
    });

    it("should return undefined when process.env access throws", () => {
      // Mock process that throws when accessing env
      global.process = {
        get env() {
          throw new Error("Access denied");
        }
      } as any;

      expect(getEnvVar("NODE_ENV")).toBeUndefined();
    });

    it("should return undefined for non-existent environment variables", () => {
      global.process = {
        env: {}
      } as any;

      expect(getEnvVar("NODE_ENV")).toBeUndefined();
      expect(getEnvVar("CODECOV_TOKEN")).toBeUndefined();
    });
  });

  describe("getEnvironment", () => {
    it("should return NODE_ENV value when available", () => {
      global.process = {
        env: { NODE_ENV: "production" }
      } as any;

      expect(getEnvironment()).toBe("production");
    });

    it("should return 'development' as default when NODE_ENV is not set", () => {
      global.process = {
        env: {}
      } as any;

      expect(getEnvironment()).toBe("development");
    });

    it("should return 'development' when process is undefined", () => {
      global.process = undefined as any;
      expect(getEnvironment()).toBe("development");
    });
  });

  describe("getNodeEnv", () => {
    it("should return NODE_ENV value when available", () => {
      global.process = {
        env: { NODE_ENV: "test" }
      } as any;

      expect(getNodeEnv()).toBe("test");
    });

    it("should return 'development' as default when NODE_ENV is not set", () => {
      global.process = {
        env: {}
      } as any;

      expect(getNodeEnv()).toBe("development");
    });

    it("should return 'development' when process is undefined", () => {
      global.process = undefined as any;
      expect(getNodeEnv()).toBe("development");
    });
  });

  describe("isBrowserEnvironment", () => {
    it("should return true when window is defined", () => {
      global.window = {} as any;
      expect(isBrowserEnvironment()).toBe(true);
    });

    it("should return false when window is undefined", () => {
      global.window = undefined as any;
      expect(isBrowserEnvironment()).toBe(false);
    });

    it("should return false when window access throws", () => {
      // Create a getter that throws
      Object.defineProperty(global, 'window', {
        get() {
          throw new Error("Window access denied");
        },
        configurable: true
      });

      expect(isBrowserEnvironment()).toBe(false);

      // Clean up
      delete (global as any).window;
    });
  });

  describe("isDevelopment", () => {
    it("should return true when NODE_ENV is 'development'", () => {
      global.process = {
        env: { NODE_ENV: "development" }
      } as any;

      expect(isDevelopment()).toBe(true);
    });

    it("should return false when NODE_ENV is not 'development'", () => {
      global.process = {
        env: { NODE_ENV: "production" }
      } as any;

      expect(isDevelopment()).toBe(false);
    });

    it("should return true when NODE_ENV is not set (defaults to development)", () => {
      global.process = {
        env: {}
      } as any;

      expect(isDevelopment()).toBe(true);
    });

    it("should return true when process is undefined (defaults to development)", () => {
      global.process = undefined as any;
      expect(isDevelopment()).toBe(true);
    });
  });

  describe("isNodeEnvironment", () => {
    it("should return true when process is defined", () => {
      global.process = {
        env: {}
      } as any;

      expect(isNodeEnvironment()).toBe(true);
    });

    it("should return false when process is undefined", () => {
      global.process = undefined as any;
      expect(isNodeEnvironment()).toBe(false);
    });

    it("should return false when process access throws", () => {
      // Create a getter that throws
      Object.defineProperty(global, 'process', {
        get() {
          throw new Error("Process access denied");
        },
        configurable: true
      });

      expect(isNodeEnvironment()).toBe(false);

      // Clean up
      global.process = originalProcess;
    });
  });

  describe("isProduction", () => {
    it("should return true when NODE_ENV is 'production'", () => {
      global.process = {
        env: { NODE_ENV: "production" }
      } as any;

      expect(isProduction()).toBe(true);
    });

    it("should return false when NODE_ENV is not 'production'", () => {
      global.process = {
        env: { NODE_ENV: "development" }
      } as any;

      expect(isProduction()).toBe(false);
    });

    it("should return false when NODE_ENV is not set", () => {
      global.process = {
        env: {}
      } as any;

      expect(isProduction()).toBe(false);
    });

    it("should return false when process is undefined", () => {
      global.process = undefined as any;
      expect(isProduction()).toBe(false);
    });
  });

  describe("isTest", () => {
    it("should return true when NODE_ENV is 'test'", () => {
      global.process = {
        env: { NODE_ENV: "test" }
      } as any;

      expect(isTest()).toBe(true);
    });

    it("should return false when NODE_ENV is not 'test'", () => {
      global.process = {
        env: { NODE_ENV: "production" }
      } as any;

      expect(isTest()).toBe(false);
    });

    it("should return false when NODE_ENV is not set", () => {
      global.process = {
        env: {}
      } as any;

      expect(isTest()).toBe(false);
    });

    it("should return false when process is undefined", () => {
      global.process = undefined as any;
      expect(isTest()).toBe(false);
    });
  });

  describe("Edge cases and integration", () => {
    it("should handle multiple environment checks consistently", () => {
      global.process = {
        env: { NODE_ENV: "test" }
      } as any;

      expect(isTest()).toBe(true);
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(false);
      expect(getEnvironment()).toBe("test");
      expect(getNodeEnv()).toBe("test");
    });

    it("should handle empty string NODE_ENV", () => {
      global.process = {
        env: { NODE_ENV: "" }
      } as any;

      expect(getEnvironment()).toBe("");
      expect(getNodeEnv()).toBe("");
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(false);
      expect(isTest()).toBe(false);
    });

    it("should handle case sensitivity", () => {
      global.process = {
        env: { NODE_ENV: "PRODUCTION" }
      } as any;

      expect(isProduction()).toBe(false); // Should be case sensitive
      expect(getEnvironment()).toBe("PRODUCTION");
    });
  });
});
