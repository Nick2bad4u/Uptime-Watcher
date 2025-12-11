/**
 * Main process specific tests for Electron application.
 *
 * These tests focus on testing the main process functionality, IPC
 * communication, and Electron APIs.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";

test.describe(
    "electron main process",
    {
        tag: ["@main", "@core"],
        annotation: {
            type: "category",
            description: "Main process functionality and API tests",
        },
    },
    () => {
        test(
            "should access main process APIs",
            {
                tag: ["@fast", "@api"],
                annotation: [
                    {
                        type: "api",
                        description:
                            "Verifies main process API access and functionality",
                    },
                    {
                        type: "core",
                        description: "Essential main process operations",
                    },
                ],
            },
            async () => {
                const electronApp = await launchElectronApp();

                await electronApp.firstWindow();
                await electronApp.evaluate(async ({ app }) => {
                    if (!app.isReady()) {
                        await app.whenReady();
                    }
                });

                // Test app module
                const appPath = await electronApp.evaluate(async ({ app }) => {
                    return app.getAppPath();
                });
                expect(appPath).toBeTruthy();
                expect(typeof appPath).toBe("string");

                // Test process information
                const processInfo = await electronApp.evaluate(async () => {
                    return {
                        platform: process.platform,
                        arch: process.arch,
                        version: process.version,
                    };
                });

                expect(processInfo.platform).toBeTruthy();
                expect(processInfo.arch).toBeTruthy();
                expect(processInfo.version).toMatch(/^v\d+\.\d+\.\d+/);

                await electronApp.close();
            }
        );

        test(
            "should handle window management",
            {
                tag: ["@slow", "@ui"],
                annotation: [
                    {
                        type: "ui",
                        description: "Window management and bounds testing",
                    },
                    {
                        type: "issue",
                        description:
                            "Known failing test - window resize and bounds issues",
                    },
                ],
            },
            async () => {
                const electronApp = await launchElectronApp();

                // Get the main window (not directly used but needed for proper window management)
                await electronApp.firstWindow();

                // Test window properties
                const bounds = await electronApp.evaluate(async ({
                    BrowserWindow,
                }) => {
                    const windows = BrowserWindow.getAllWindows();
                    if (windows.length > 0) {
                        return windows[0]?.getBounds();
                    }
                    return null;
                });

                expect(bounds).toBeTruthy();
                expect(bounds).toHaveProperty("width");
                expect(bounds).toHaveProperty("height");
                expect(bounds).toHaveProperty("x");
                expect(bounds).toHaveProperty("y");

                await electronApp.close();
            }
        );

        test(
            "should handle app events properly",
            {
                tag: ["@fast", "@core"],
                annotation: [
                    {
                        type: "core",
                        description: "App event handling and state management",
                    },
                    {
                        type: "api",
                        description:
                            "Electron app API functionality verification",
                    },
                ],
            },
            async () => {
                const electronApp = await launchElectronApp();

                // Test app ready state
                const readyState = await electronApp.evaluate(async ({
                    app,
                }) => {
                    return {
                        isReady: app.isReady(),
                        name: app.getName(),
                        locale: app.getLocale(),
                    };
                });

                expect(readyState.isReady).toBe(true);
                expect(readyState.name).toBeTruthy();
                expect(readyState.locale).toBeTruthy();

                await electronApp.close();
            }
        );

        test(
            "should access system information",
            {
                tag: ["@slow", "@system"],
                annotation: [
                    {
                        type: "system",
                        description:
                            "System information and environment testing",
                    },
                    {
                        type: "api",
                        description: "Electron system API access verification",
                    },
                ],
            },
            async () => {
                const electronApp = await launchElectronApp();

                // Get system information
                const systemInfo = await electronApp.evaluate(async ({
                    app,
                }) => {
                    return {
                        version: app.getVersion(),
                        locale: app.getLocale(),
                        systemLocale: app.getSystemLocale(),
                        preferredSystemLanguages:
                            app.getPreferredSystemLanguages(),
                    };
                });

                expect(systemInfo.version).toBeTruthy();
                expect(systemInfo.locale).toBeTruthy();
                expect(systemInfo.systemLocale).toBeTruthy();
                expect(Array.isArray(systemInfo.preferredSystemLanguages)).toBe(
                    true
                );

                await electronApp.close();
            }
        );
    }
);
