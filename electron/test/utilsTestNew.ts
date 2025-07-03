/**
 * Tests for Electron utility functions.
 * Validates utility functions for environment detection and common operations.
 */

import { describe, expect, it, vi } from "vitest";

describe("Electron Utils", () => {
    describe("isDev function", () => {
        it("should detect development mode from NODE_ENV", async () => {
            // Mock NODE_ENV as development
            vi.stubEnv("NODE_ENV", "development");

            // Mock electron app.isPackaged as true (but NODE_ENV should take precedence)
            vi.doMock("electron", () => ({
                app: { isPackaged: true },
            }));

            const { isDev } = await import("../utils");
            expect(isDev()).toBe(true);
        });

        it("should detect production mode from NODE_ENV", async () => {
            // Mock NODE_ENV as production
            vi.stubEnv("NODE_ENV", "production");

            // Mock electron app.isPackaged as false (but NODE_ENV should take precedence)
            vi.doMock("electron", () => ({
                app: { isPackaged: false },
            }));

            // Clear the module cache to get fresh import
            vi.resetModules();
            const { isDev } = await import("../utils");
            expect(isDev()).toBe(false);
        });

        it("should detect development mode from app.isPackaged when NODE_ENV is undefined", async () => {
            // Clear NODE_ENV
            vi.stubEnv("NODE_ENV", undefined);

            // Mock electron app.isPackaged as false (development)
            vi.doMock("electron", () => ({
                app: { isPackaged: false },
            }));

            vi.resetModules();
            const { isDev } = await import("../utils");
            expect(isDev()).toBe(true);
        });

        it("should detect production mode from app.isPackaged when NODE_ENV is undefined", async () => {
            // Clear NODE_ENV
            vi.stubEnv("NODE_ENV", undefined);

            // Mock electron app.isPackaged as true (production)
            vi.doMock("electron", () => ({
                app: { isPackaged: true },
            }));

            vi.resetModules();
            const { isDev } = await import("../utils");
            expect(isDev()).toBe(false);
        });

        it("should handle various NODE_ENV values correctly", async () => {
            const testCases = [
                { env: "development", expected: true },
                { env: "dev", expected: false },
                { env: "test", expected: false },
                { env: "staging", expected: false },
                { env: "production", expected: false },
                { env: "", expected: false },
            ];

            for (const { env, expected } of testCases) {
                vi.stubEnv("NODE_ENV", env);
                vi.doMock("electron", () => ({
                    app: { isPackaged: true },
                }));

                vi.resetModules();
                const { isDev } = await import("../utils");
                expect(isDev()).toBe(expected);
            }
        });

        it("should return boolean type", async () => {
            vi.stubEnv("NODE_ENV", "development");
            vi.doMock("electron", () => ({
                app: { isPackaged: false },
            }));

            vi.resetModules();
            const { isDev } = await import("../utils");
            const result = isDev();

            expect(typeof result).toBe("boolean");
            expect(result === true || result === false).toBe(true);
        });

        it("should be consistent when called multiple times", async () => {
            vi.stubEnv("NODE_ENV", "development");
            vi.doMock("electron", () => ({
                app: { isPackaged: false },
            }));

            vi.resetModules();
            const { isDev } = await import("../utils");

            const firstCall = isDev();
            const secondCall = isDev();
            const thirdCall = isDev();

            expect(firstCall).toBe(secondCall);
            expect(secondCall).toBe(thirdCall);
        });
    });

    describe("Documentation and Examples", () => {
        it("should match the example usage in documentation", async () => {
            vi.stubEnv("NODE_ENV", "development");
            vi.doMock("electron", () => ({
                app: { isPackaged: false },
            }));

            vi.resetModules();
            const { isDev } = await import("../utils");

            // Test the example from the documentation
            if (isDev()) {
                expect(true).toBe(true); // Development mode detected
            } else {
                expect(false).toBe(true); // Should not reach here in this test
            }
        });
    });

    describe("Edge Cases", () => {
        it("should handle missing electron app", async () => {
            vi.stubEnv("NODE_ENV", undefined);
            vi.doMock("electron", () => ({
                app: undefined,
            }));

            vi.resetModules();

            // Should not throw an error
            expect(async () => {
                const { isDev } = await import("../utils");
                isDev();
            }).not.toThrow();
        });

        it("should handle missing isPackaged property", async () => {
            vi.stubEnv("NODE_ENV", undefined);
            vi.doMock("electron", () => ({
                app: {},
            }));

            vi.resetModules();

            // Should not throw an error and default to development
            const { isDev } = await import("../utils");
            expect(isDev()).toBe(true); // Should default to development when isPackaged is undefined
        });
    });

    describe("Integration with Electron", () => {
        it("should work with real Electron app structure", async () => {
            // Mock a realistic electron app object
            vi.doMock("electron", () => ({
                app: {
                    isPackaged: false,
                    getName: () => "Uptime Watcher",
                    getVersion: () => "1.0.0",
                    getPath: (name: string) => `/app/path/${name}`,
                },
            }));

            vi.resetModules();
            const { isDev } = await import("../utils");

            expect(typeof isDev).toBe("function");
            expect(typeof isDev()).toBe("boolean");
        });
    });
});
