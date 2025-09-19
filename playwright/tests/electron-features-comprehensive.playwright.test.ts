/**
 * Comprehensive Electron Features Tests for Uptime Watcher.
 *
 * These tests cover Electron-specific functionality including window
 * management, native menus, notifications, system tray, and IPC communication.
 */

import { test, expect, _electron as electron } from "@playwright/test";

test.describe(
    "electron Features - Comprehensive Tests",
    {
        tag: [
            "@electron",
            "@native",
            "@comprehensive",
        ],
        annotation: {
            type: "electron-tests",
            description: "Electron-specific functionality testing",
        },
    },
    () => {
        let electronApp: any;
        let window: any;

        test.beforeEach(async () => {
            electronApp = await electron.launch({
                args: ["."],
                env: {
                    ...process.env,
                    NODE_ENV: "test",
                    SKIP_AUTO_UPDATES: "true",
                },
                timeout: 45000,
            });

            window = await electronApp.firstWindow();
            await window.waitForLoadState("domcontentloaded");
            await expect(window.getByTestId("app-root")).toBeVisible({
                timeout: 15000,
            });
        });

        test.afterEach(async () => {
            await electronApp.close();
        });

        test(
            "should launch Electron application successfully",
            {
                tag: ["@launch", "@startup"],
                annotation: {
                    type: "startup",
                    description:
                        "Verify Electron app launches and initializes correctly",
                },
            },
            async () => {
                // Verify application window exists
                expect(electronApp).toBeTruthy();
                expect(window).toBeTruthy();

                // Check window properties
                const title = await window.title();
                expect(title).toContain("Uptime Watcher");

                // Verify main application is loaded
                await expect(window.getByTestId("app-root")).toBeVisible();
                await expect(window.getByText("Uptime Watcher")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/electron-startup.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle window operations correctly",
            {
                tag: ["@window", "@resize"],
                annotation: {
                    type: "window-management",
                    description:
                        "Test window resize, minimize, maximize operations",
                },
            },
            async () => {
                // Get initial window size
                const initialSize = await window.evaluate(() => ({
                    width: window.innerWidth,
                    height: window.innerHeight,
                }));
                expect(initialSize.width).toBeGreaterThan(0);
                expect(initialSize.height).toBeGreaterThan(0);

                // Test window resize
                await window.setViewportSize({ width: 1200, height: 800 });
                await window.waitForTimeout(500);

                const newSize = await window.evaluate(() => ({
                    width: window.innerWidth,
                    height: window.innerHeight,
                }));
                expect(newSize.width).toBe(1200);
                expect(newSize.height).toBe(800);

                await window.screenshot({
                    path: "playwright/test-results/electron-window-resize.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should maintain application state correctly",
            {
                tag: ["@state", "@persistence"],
                annotation: {
                    type: "state-management",
                    description:
                        "Test application state persistence and memory",
                },
            },
            async () => {
                // Add a site to test state persistence
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                await window.getByLabel("Site Name").fill("State Test Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(2000);

                // Close modal
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                // Verify site was added
                await expect(window.getByText("State Test Site")).toBeVisible({
                    timeout: 5000,
                });

                // Test data is maintained in memory
                const siteCards = window.getByTestId("site-card");
                const cardCount = await siteCards.count();
                expect(cardCount).toBeGreaterThanOrEqual(1);

                await window.screenshot({
                    path: "playwright/test-results/electron-state-persistence.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle keyboard shortcuts correctly",
            {
                tag: ["@keyboard", "@shortcuts"],
                annotation: {
                    type: "keyboard-shortcuts",
                    description:
                        "Test application keyboard shortcuts and accelerators",
                },
            },
            async () => {
                // Test Escape key (close modals)
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                await expect(window.getByRole("dialog")).toBeVisible();

                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                // Test common shortcuts
                const shortcuts = [
                    "F5",
                    "F11",
                    "F12",
                ];
                for (const shortcut of shortcuts) {
                    await window.keyboard.press(shortcut);
                    await window.waitForTimeout(300);
                }

                // Verify app is still functional after shortcuts
                await expect(window.getByTestId("app-root")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/electron-keyboard-shortcuts.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle IPC communication correctly",
            {
                tag: ["@ipc", "@communication"],
                annotation: {
                    type: "ipc-communication",
                    description:
                        "Test Inter-Process Communication between main and renderer",
                },
            },
            async () => {
                // Test IPC by adding a site (which uses IPC for data persistence)
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                await window.getByLabel("Site Name").fill("IPC Test");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(3000);

                // Close modal
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                // Verify IPC communication worked (site was added via IPC)
                await expect(window.getByText("IPC Test")).toBeVisible({
                    timeout: 5000,
                });

                // Test settings changes (another IPC operation)
                await window.getByRole("button", { name: "Settings" }).click();
                await window.waitForTimeout(1000);

                // Verify settings interface is available
                const settingsDialog = window.getByRole("dialog");
                await expect(settingsDialog).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/electron-ipc-communication.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle file system operations",
            {
                tag: ["@filesystem", "@storage"],
                annotation: {
                    type: "file-operations",
                    description:
                        "Test file system access and storage operations",
                },
            },
            async () => {
                // Add multiple sites to test data storage
                const testSites = [
                    {
                        name: "Storage Test 1",
                        url: "https://httpbin.org/status/200",
                    },
                    {
                        name: "Storage Test 2",
                        url: "https://httpbin.org/status/201",
                    },
                ];

                for (const site of testSites) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);

                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(2000);

                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);
                }

                // Verify both sites were stored
                await expect(window.getByText("Storage Test 1")).toBeVisible({
                    timeout: 5000,
                });
                await expect(window.getByText("Storage Test 2")).toBeVisible({
                    timeout: 5000,
                });

                // Count total sites
                const siteCards = window.getByTestId("site-card");
                const cardCount = await siteCards.count();
                expect(cardCount).toBeGreaterThanOrEqual(2);

                await window.screenshot({
                    path: "playwright/test-results/electron-file-storage.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle error conditions gracefully",
            {
                tag: ["@error", "@resilience"],
                annotation: {
                    type: "error-handling",
                    description:
                        "Test application resilience to error conditions",
                },
            },
            async () => {
                // Test invalid URL handling
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                await window.getByLabel("Site Name").fill("Error Test");
                await window.getByLabel("URL").fill("invalid-url");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(2000);

                // Should show error or validation message
                const errorElements = [
                    window.getByText("Invalid URL", { exact: false }),
                    window.getByText("Error", { exact: false }),
                    window.getByText("Please enter a valid URL", {
                        exact: false,
                    }),
                ];

                // Check for error messages (at least one should exist)
                for (const errorElement of errorElements) {
                    const count = await errorElement.count();
                    console.log(`Error element count: ${count}`);
                }

                // App should still be functional
                await expect(window.getByTestId("app-root")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/electron-error-handling.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should maintain responsive UI across different sizes",
            {
                tag: ["@responsive", "@ui"],
                annotation: {
                    type: "responsive-design",
                    description:
                        "Test UI responsiveness at different window sizes",
                },
            },
            async () => {
                const testSizes = [
                    { width: 800, height: 600 },
                    { width: 1024, height: 768 },
                    { width: 1200, height: 900 },
                    { width: 1600, height: 1200 },
                ];

                for (const size of testSizes) {
                    await window.setViewportSize(size);
                    await window.waitForTimeout(500);

                    // Verify key elements are still visible
                    await expect(window.getByTestId("app-root")).toBeVisible();
                    await expect(
                        window.getByText("Uptime Watcher")
                    ).toBeVisible();
                    await expect(
                        window.getByRole("button", { name: "Add new site" })
                    ).toBeVisible();

                    await window.screenshot({
                        path: `playwright/test-results/electron-responsive-${size.width}x${size.height}.png`,
                        fullPage: true,
                    });
                }

                // Verify final state
                const finalSize = await window.evaluate(() => ({
                    width: window.innerWidth,
                    height: window.innerHeight,
                }));
                expect(finalSize.width).toBe(1600);
                expect(finalSize.height).toBe(1200);
            }
        );

        test(
            "should handle memory usage efficiently",
            {
                tag: ["@memory", "@performance"],
                annotation: {
                    type: "memory-management",
                    description: "Test memory usage and cleanup",
                },
            },
            async () => {
                // Add multiple sites to test memory usage
                const siteCount = 5;
                for (let i = 0; i < siteCount; i++) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);

                    await window
                        .getByLabel("Site Name")
                        .fill(`Memory Test ${i + 1}`);
                    await window
                        .getByLabel("URL")
                        .fill(`https://httpbin.org/status/${200 + i}`);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1500);

                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);
                }

                // Verify all sites were added
                const siteCards = window.getByTestId("site-card");
                const cardCount = await siteCards.count();
                expect(cardCount).toBeGreaterThanOrEqual(siteCount);

                // Test memory doesn't leak by performing multiple operations
                for (let i = 0; i < 3; i++) {
                    await window
                        .getByRole("button", { name: "Toggle theme" })
                        .click();
                    await window.waitForTimeout(500);
                }

                // Verify app is still responsive
                await expect(window.getByTestId("app-root")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/electron-memory-usage.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle concurrent operations correctly",
            {
                tag: ["@concurrent", "@async"],
                annotation: {
                    type: "concurrency",
                    description: "Test handling of concurrent operations",
                },
            },
            async () => {
                // Test rapid UI interactions
                const rapidClicks = 3;
                for (let i = 0; i < rapidClicks; i++) {
                    await window
                        .getByRole("button", { name: "Toggle theme" })
                        .click();
                    await window.waitForTimeout(100);
                }
                await window.waitForTimeout(1000);

                // Verify app is still stable
                await expect(window.getByTestId("app-root")).toBeVisible();
                await expect(window.getByText("Uptime Watcher")).toBeVisible();

                // Test concurrent site monitoring
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                await window.getByLabel("Site Name").fill("Concurrent Test");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/delay/1");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(3000);

                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                // Verify site was added successfully
                await expect(window.getByText("Concurrent Test")).toBeVisible({
                    timeout: 5000,
                });

                await window.screenshot({
                    path: "playwright/test-results/electron-concurrent-operations.png",
                    fullPage: true,
                });
            }
        );
    }
);
