/**
 * Basic Electron app launch and initialization tests.
 *
 * These tests verify that the Electron application can be launched, initialized
 * properly, and basic functionality works as expected.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";

test.describe(
    "electron app - basic functionality",
    {
        tag: [
            "@e2e",
            "@smoke",
            "@core",
        ],
        annotation: {
            type: "category",
            description: "Essential app launch and initialization tests",
        },
    },
    () => {
        test(
            "should launch the app successfully",
            {
                tag: ["@fast", "@critical"],
                annotation: [
                    { type: "issue", description: "Core functionality test" },
                    {
                        type: "performance",
                        description: "App startup time critical",
                    },
                ],
            },
            async () => {
                // Launch the Electron app
                const electronApp = await launchElectronApp();

                // Verify the app launched
                expect(electronApp).toBeTruthy();

                // Get app info
                const isPackaged = await electronApp.evaluate(
                    async ({ app }) => {
                        // This runs in Electron's main process
                        return app.isPackaged;
                    }
                );

                // Should not be packaged in development/test mode
                expect(isPackaged).toBe(false);

                // Close the app
                await electronApp.close();
            }
        );

        test(
            "should create a main window",
            {
                tag: ["@fast", "@ui"],
                annotation: [
                    {
                        type: "ui",
                        description:
                            "Verifies main window creation and properties",
                    },
                    {
                        type: "performance",
                        description: "Window creation timing critical",
                    },
                ],
            },
            async () => {
                const electronApp = await launchElectronApp();

                // Wait for the first window to be created
                const window = await electronApp.firstWindow();

                // Verify window exists
                expect(window).toBeTruthy();

                // Check window title
                const title = await window.title();
                expect(title).toContain("Uptime Watcher");

                // Take a screenshot for debugging
                await window.screenshot({
                    path: "playwright/test-results/main-window.png",
                });

                // Close the app
                await electronApp.close();
            }
        );

        test(
            "should have correct app metadata",
            {
                tag: ["@slow", "@metadata"],
                annotation: [
                    {
                        type: "metadata",
                        description:
                            "Verifies application metadata and version info",
                    },
                    {
                        type: "issue",
                        description:
                            "Known failing test - metadata access issues",
                    },
                ],
            },
            async () => {
                const electronApp = await launchElectronApp();

                // Get app name and version
                const appName = await electronApp.evaluate(async ({ app }) => {
                    return app.getName();
                });

                const appVersion = await electronApp.evaluate(
                    async ({ app }) => {
                        return app.getVersion();
                    }
                );

                // Verify app metadata
                // In development mode, app name defaults to "Electron" unless explicitly set
                expect(appName).toMatch(/^(uptime-watcher|Electron)$/); // Allow both dev and production names
                expect(appVersion).toMatch(/^\d+\.\d+\.\d+/); // Semver pattern

                await electronApp.close();
            }
        );

        test(
            "should handle app ready state correctly",
            {
                tag: ["@fast", "@core"],
                annotation: [
                    {
                        type: "core",
                        description:
                            "Verifies app initialization and ready state",
                    },
                    {
                        type: "performance",
                        description: "App ready state timing verification",
                    },
                ],
            },
            async () => {
                const electronApp = await launchElectronApp();

                // Check if app is ready
                const isReady = await electronApp.evaluate(async ({ app }) => {
                    return app.isReady();
                });

                expect(isReady).toBe(true);

                await electronApp.close();
            }
        );
    }
);
