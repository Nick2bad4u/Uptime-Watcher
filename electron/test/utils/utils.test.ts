/**
 * Tests for Electron utilities.
 * Validates development mode detection and other utility functions.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

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
        originalNodeEnv = process.env['NODE_ENV'];
    });

    afterEach(() => {
        // Restore original NODE_ENV
        if (originalNodeEnv !== undefined) {
            process.env['NODE_ENV'] = originalNodeEnv;
        } else {
            delete process.env['NODE_ENV'];
        }
        vi.resetAllMocks();
    });

    describe("isDev", () => {
        it("should return true when NODE_ENV is development", () => {
            process.env['NODE_ENV'] = "development";
            mockApp.isPackaged = true; // Should still return true due to NODE_ENV

            expect(isDev()).toBe(true);
        });

        it("should return true when app is not packaged", () => {
            process.env['NODE_ENV'] = "production";
            mockApp.isPackaged = false;

            expect(isDev()).toBe(true);
        });

        it("should return false when NODE_ENV is production and app is packaged", () => {
            process.env['NODE_ENV'] = "production";
            mockApp.isPackaged = true;

            expect(isDev()).toBe(false);
        });

        it("should return true when NODE_ENV is undefined and app is not packaged", () => {
            delete process.env['NODE_ENV'];
            mockApp.isPackaged = false;

            expect(isDev()).toBe(true);
        });

        it("should return false when NODE_ENV is undefined and app is packaged", () => {
            delete process.env['NODE_ENV'];
            mockApp.isPackaged = true;

            expect(isDev()).toBe(false);
        });

        it("should return false when NODE_ENV is test and app is packaged", () => {
            process.env['NODE_ENV'] = "test";
            mockApp.isPackaged = true;

            expect(isDev()).toBe(false); // NODE_ENV !== "development" AND app.isPackaged
        });

        it("should return false when NODE_ENV is any other value and app is packaged", () => {
            process.env['NODE_ENV'] = "staging";
            mockApp.isPackaged = true;

            expect(isDev()).toBe(false); // NODE_ENV !== "development" AND app.isPackaged
        });

        it("should handle mixed scenarios correctly", () => {
            // Test case 1: development + packaged
            process.env['NODE_ENV'] = "development";
            mockApp.isPackaged = true;
            expect(isDev()).toBe(true);

            // Test case 2: production + not packaged
            process.env['NODE_ENV'] = "production";
            mockApp.isPackaged = false;
            expect(isDev()).toBe(true);

            // Test case 3: empty string NODE_ENV + packaged
            process.env['NODE_ENV'] = "";
            mockApp.isPackaged = true;
            expect(isDev()).toBe(false); // Empty string !== "development" AND app.isPackaged

            // Test case 4: development + not packaged
            process.env['NODE_ENV'] = "development";
            mockApp.isPackaged = false;
            expect(isDev()).toBe(true);
        });
    });
});
