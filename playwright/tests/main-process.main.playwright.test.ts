/**
 * Main process specific tests for Electron app.
 *
 * These tests focus on testing the main process functionality, IPC
 * communication, and Electron APIs.
 */

import { expect, test } from "@playwright/test";

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
                const appPath = await electronApp.evaluate(async ({ app }) =>
                    app.getAppPath()
                );
                expect.soft(appPath).toBeTruthy();
                expect.soft(typeof appPath).toBe("string");

                // Test process information
                const processInfo = await electronApp.evaluate(async () => ({
                    platform: process.platform,
                    arch: process.arch,
                    version: process.version,
                }));

                expect.soft(processInfo.platform).toBeTruthy();
                expect.soft(processInfo.arch).toBeTruthy();
                expect.soft(processInfo.version).toMatch(/^v\d+\.\d+\.\d+/v);

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
                const bounds = await electronApp.evaluate(
                    async ({ BrowserWindow }) => {
                        const windows = BrowserWindow.getAllWindows();
                        if (windows.length > 0) {
                            return windows[0]?.getBounds();
                        }
                        return null;
                    }
                );

                expect.soft(bounds).toBeTruthy();
                expect.soft(bounds).toHaveProperty("width");
                expect.soft(bounds).toHaveProperty("height");
                expect.soft(bounds).toHaveProperty("x");
                expect.soft(bounds).toHaveProperty("y");

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
                const readyState = await electronApp.evaluate(
                    async ({ app }) => ({
                        isReady: app.isReady(),
                        name: app.getName(),
                        locale: app.getLocale(),
                    })
                );

                expect.soft(readyState.isReady).toBe(true);
                expect.soft(readyState.name).toBeTruthy();
                expect.soft(readyState.locale).toBeTruthy();

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
                const systemInfo = await electronApp.evaluate(
                    async ({ app }) => ({
                        version: app.getVersion(),
                        locale: app.getLocale(),
                        systemLocale: app.getSystemLocale(),
                        preferredSystemLanguages:
                            app.getPreferredSystemLanguages(),
                    })
                );

                expect.soft(systemInfo.version).toBeTruthy();
                expect.soft(systemInfo.locale).toBeTruthy();
                expect.soft(systemInfo.systemLocale).toBeTruthy();
                expect
                    .soft(Array.isArray(systemInfo.preferredSystemLanguages))
                    .toBe(true);

                await electronApp.close();
            }
        );
    }
);
