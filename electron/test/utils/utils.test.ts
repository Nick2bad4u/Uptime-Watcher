/**
 * Tests for Electron utilities. Validates development mode detection and other
 * utility functions.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { isDev } from "../../electronUtils";

// Mock dependencies
vi.mock("electron", () => ({
    app: {
        isPackaged: false,
    },
}));

describe("Electron Utils", () => {
    let mockApp: any;
    let originalNodeEnv: string | undefined;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockApp = await import("electron").then((m) => m.app);

        // Store original NODE_ENV
        originalNodeEnv = process.env["NODE_ENV"];
    });

    afterEach(() => {
        // Restore original NODE_ENV
        if (originalNodeEnv === undefined) {
            delete process.env["NODE_ENV"];
        } else {
            process.env["NODE_ENV"] = originalNodeEnv;
        }
        vi.resetAllMocks();
    });

    describe("isDev", () => {
        it("should return true when NODE_ENV is development AND app is not packaged", () => {
            process.env["NODE_ENV"] = "development";
            mockApp.isPackaged = false; // Both conditions met

            expect(isDev()).toBe(true);
        });

        it("should return false when NODE_ENV is development but app is packaged", () => {
            process.env["NODE_ENV"] = "development";
            mockApp.isPackaged = true; // Both conditions not met: app IS packaged

            expect(isDev()).toBe(false);
        });

        it("should return false when app is not packaged but NODE_ENV is not development", () => {
            process.env["NODE_ENV"] = "production";
            mockApp.isPackaged = false; // Both conditions not met: NODE_ENV !== "development"

            expect(isDev()).toBe(false);
        });

        it("should return false when NODE_ENV is production and app is packaged", () => {
            process.env["NODE_ENV"] = "production";
            mockApp.isPackaged = true;

            expect(isDev()).toBe(false);
        });

        it("should return false when NODE_ENV is undefined and app is not packaged", () => {
            delete process.env["NODE_ENV"];
            mockApp.isPackaged = false; // NODE_ENV undefined means isDevelopment() returns false

            expect(isDev()).toBe(false);
        });

        it("should return false when NODE_ENV is undefined and app is packaged", () => {
            delete process.env["NODE_ENV"];
            mockApp.isPackaged = true;

            expect(isDev()).toBe(false);
        });

        it("should return false when NODE_ENV is test and app is packaged", () => {
            process.env["NODE_ENV"] = "test";
            mockApp.isPackaged = true;

            expect(isDev()).toBe(false); // NODE_ENV !== "development" AND app.isPackaged
        });

        it("should return false when NODE_ENV is any other value and app is packaged", () => {
            process.env["NODE_ENV"] = "staging";
            mockApp.isPackaged = true;

            expect(isDev()).toBe(false); // NODE_ENV !== "development" AND app.isPackaged
        });

        it("should handle mixed scenarios correctly", () => {
            // Test case 1: development + packaged (should be FALSE)
            process.env["NODE_ENV"] = "development";
            mockApp.isPackaged = true;
            expect(isDev()).toBe(false);

            // Test case 2: production + not packaged (should be FALSE)
            process.env["NODE_ENV"] = "production";
            mockApp.isPackaged = false;
            expect(isDev()).toBe(false);

            // Test case 3: development + not packaged (should be TRUE)
            process.env["NODE_ENV"] = "development";
            mockApp.isPackaged = false;
            expect(isDev()).toBe(true);

            // Test case 4: empty string NODE_ENV + packaged (should be FALSE)
            process.env["NODE_ENV"] = "";
            mockApp.isPackaged = true;
            expect(isDev()).toBe(false); // Empty string !== "development" AND app.isPackaged
        });
    });
});
