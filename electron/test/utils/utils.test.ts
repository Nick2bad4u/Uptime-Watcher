/**
 * Tests for Electron utilities. Validates development mode detection and other
 * utility functions.
 */

import { afterEach, beforeEach, describe, expect, it, test, vi } from "vitest";

import { isDev } from "../../electronUtils";

// Mock dependencies
vi.mock("electron", () => ({
    app: {
        isPackaged: false,
    },
}));

describe("Electron Utils", () => {
    let mockApp: { isPackaged: boolean };
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

    describe(isDev, () => {
        test.for([
            {
                expected: true,
                isPackaged: false,
                name: "should return true when NODE_ENV is development AND app is not packaged",
                nodeEnv: "development",
            },
            {
                expected: false,
                isPackaged: true,
                name: "should return false when NODE_ENV is development but app is packaged",
                nodeEnv: "development",
            },
            {
                expected: false,
                isPackaged: false,
                name: "should return false when app is not packaged but NODE_ENV is not development",
                nodeEnv: "production",
            },
            {
                expected: false,
                isPackaged: true,
                name: "should return false when NODE_ENV is production and app is packaged",
                nodeEnv: "production",
            },
            {
                expected: false,
                isPackaged: false,
                name: "should return false when NODE_ENV is undefined and app is not packaged",
            },
            {
                expected: false,
                isPackaged: true,
                name: "should return false when NODE_ENV is undefined and app is packaged",
            },
            {
                expected: false,
                isPackaged: true,
                name: "should return false when NODE_ENV is test and app is packaged",
                nodeEnv: "test",
            },
            {
                expected: false,
                isPackaged: true,
                name: "should return false when NODE_ENV is any other value and app is packaged",
                nodeEnv: "staging",
            },
        ])(
            "$name",
            async ({ expected, isPackaged, nodeEnv }, { task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                if (nodeEnv === undefined) {
                    delete process.env["NODE_ENV"];
                } else {
                    process.env["NODE_ENV"] = nodeEnv;
                }
                mockApp.isPackaged = isPackaged;

                if (expected) {
                    expect(isDev()).toBeTruthy();
                } else {
                    expect(isDev()).toBeFalsy();
                }
            }
        );

        it("should handle mixed scenarios correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: utils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test case 1: development + packaged (should be FALSE)
            process.env["NODE_ENV"] = "development";
            mockApp.isPackaged = true;
            expect(isDev()).toBeFalsy();

            // Test case 2: production + not packaged (should be FALSE)
            process.env["NODE_ENV"] = "production";
            mockApp.isPackaged = false;
            expect(isDev()).toBeFalsy();

            // Test case 3: development + not packaged (should be TRUE)
            process.env["NODE_ENV"] = "development";
            mockApp.isPackaged = false;
            expect(isDev()).toBeTruthy();

            // Test case 4: empty string NODE_ENV + packaged (should be FALSE)
            process.env["NODE_ENV"] = "";
            mockApp.isPackaged = true;
            expect(isDev()).toBeFalsy(); // Empty string !== "development" AND app.isPackaged
        });
    });
});
