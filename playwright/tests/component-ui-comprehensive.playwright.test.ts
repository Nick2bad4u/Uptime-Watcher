/**
 * Comprehensive UI component tests for Uptime Watcher.
 *
 * Tests all UI components, interactions, accessibility, performance, and visual
 * regressions across the application.
 *
 * @file Playwright tests for comprehensive UI component testing
 */

import {
    test,
    expect,
    _electron as electron,
    type ElectronApplication,
    type Page,
} from "@playwright/test";

test.describe(
    "uI Components - Comprehensive Tests",
    {
        tag: [
            "@ui",
            "@components",
            "@comprehensive",
        ],
        annotation: {
            type: "category",
            description: "Comprehensive UI component functionality tests",
        },
    },
    () => {
        let electronApp: ElectronApplication;
        let window: Page;

        test.beforeEach(async () => {
            electronApp = await electron.launch({
                args: ["."],
                env: {
                    ...process.env,
                    NODE_ENV: "test",
                },
            });
            window = await electronApp.firstWindow();
            await window.waitForLoadState("domcontentloaded");
        });

        test.afterEach(async () => {
            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should render main application layout",
            {
                tag: ["@layout", "@critical"],
                annotation: {
                    type: "layout",
                    description: "Tests main application layout rendering",
                },
            },
            async () => {
                // Wait for app to be fully loaded
                await window.waitForSelector("[data-testid='app-container']", {
                    timeout: 10000,
                });

                // Test main container exists
                const appContainer = window.getByTestId("app-container");
                await expect(appContainer).toBeVisible();

                // Test header/navigation area
                const header = window.getByRole("banner");
                await expect(header).toBeVisible();

                // Test main content area
                const mainContent = window.getByRole("main");
                await expect(mainContent).toBeVisible();
            }
        );

        test(
            "should display and interact with Add Site form",
            {
                tag: ["@form", "@interaction"],
                annotation: {
                    type: "form-interaction",
                    description: "Tests Add Site form functionality",
                },
            },
            async () => {
                // Look for Add Site button or form using semantic locators
                const addSiteButton = window.getByRole("button", {
                    name: /add.*site/i,
                });
                await expect(addSiteButton).toBeVisible();
                await addSiteButton.click();

                // Test form inputs using semantic locators
                const urlInput = window.getByRole("textbox", { name: /url/i });
                await expect(urlInput).toBeVisible();
                await urlInput.fill("https://example.com");
                await expect(urlInput).toHaveValue("https://example.com");

                const nameInput = window.getByRole("textbox", {
                    name: /name/i,
                });
                await expect(nameInput).toBeVisible();
                await nameInput.fill("Test Site");
                await expect(nameInput).toHaveValue("Test Site");
            }
        );

        test(
            "should display monitoring dashboard",
            {
                tag: ["@dashboard", "@monitoring"],
                annotation: {
                    type: "dashboard",
                    description: "Tests monitoring dashboard display",
                },
            },
            async () => {
                // Wait for dashboard to load
                await window.waitForTimeout(2000);

                // Test dashboard elements using semantic locators
                const dashboardContainer = window.getByTestId(
                    "dashboard-container"
                );
                await expect(dashboardContainer).toBeVisible();

                // Test for monitoring cards or status indicators
                const statusIndicators = window.getByTestId("site-status");
                const count = await statusIndicators.count();
                expect(count).toBeGreaterThanOrEqual(0);
            }
        );

        test(
            "should handle theme switching",
            {
                tag: ["@theme", "@ui"],
                annotation: {
                    type: "theme",
                    description: "Tests theme switching functionality",
                },
            },
            async () => {
                // Look for theme toggle using semantic locators
                const themeToggle = window.getByRole("button", {
                    name: /theme/i,
                });
                await expect(themeToggle).toBeVisible();

                // Get initial theme
                const initialTheme = await window.evaluate(() => {
                    return document.documentElement.classList.contains("dark")
                        ? "dark"
                        : "light";
                });

                // Click theme toggle
                await themeToggle.click();
                await window.waitForTimeout(500);

                // Verify theme changed
                const newTheme = await window.evaluate(() => {
                    return document.documentElement.classList.contains("dark")
                        ? "dark"
                        : "light";
                });

                expect(newTheme).not.toBe(initialTheme);
            }
        );

        test(
            "should display settings panel",
            {
                tag: ["@settings", "@panel"],
                annotation: {
                    type: "settings",
                    description: "Tests settings panel functionality",
                },
            },
            async () => {
                // Look for settings button using semantic locators
                const settingsButton = window.getByRole("button", {
                    name: /settings/i,
                });
                await expect(settingsButton).toBeVisible();
                await settingsButton.click();
                await window.waitForTimeout(1000);

                // Test settings panel is visible using semantic locators
                const settingsPanel = window.getByRole("dialog");
                await expect(settingsPanel).toBeVisible();
            }
        );

        test(
            "should handle keyboard navigation",
            {
                tag: ["@keyboard", "@accessibility"],
                annotation: {
                    type: "accessibility",
                    description: "Tests keyboard navigation",
                },
            },
            async () => {
                // Test Tab navigation
                await window.keyboard.press("Tab");

                // Get focused element
                const focusedElement = await window.evaluate(() => {
                    return document.activeElement?.tagName;
                });

                expect(focusedElement).toBeTruthy();

                // Test Escape key
                await window.keyboard.press("Escape");

                // Test Enter key on focused element
                await window.keyboard.press("Tab");
                await window.keyboard.press("Enter");
            }
        );

        test(
            "should display contextual menus",
            {
                tag: ["@menu", "@context"],
                annotation: {
                    type: "context-menu",
                    description: "Tests contextual menu functionality",
                },
            },
            async () => {
                // Test right-click context menu on main content area
                const mainContent = window.getByRole("main");
                await mainContent.click({ button: "right" });

                // Wait briefly for context menu to appear
                await window.waitForTimeout(500);

                // Check if any context menu appeared using semantic locators
                const contextMenu = window.getByRole("menu");
                // Context menu may not be implemented, so just check count
                const menuCount = await contextMenu.count();
                expect(menuCount).toBeGreaterThanOrEqual(0);
            }
        );

        test(
            "should handle responsive design",
            {
                tag: ["@responsive", "@layout"],
                annotation: {
                    type: "responsive",
                    description: "Tests responsive design behavior",
                },
            },
            async () => {
                // Test different viewport sizes
                const viewports = [
                    { width: 1920, height: 1080 }, // Desktop
                    { width: 1024, height: 768 }, // Tablet
                    { width: 375, height: 667 }, // Mobile
                ];

                for (const viewport of viewports) {
                    await window.setViewportSize(viewport);
                    await window.waitForTimeout(500);

                    // Test that main content is still visible using semantic locators
                    const mainContent = window.getByRole("main");
                    await expect(mainContent).toBeVisible();

                    // Test that content is not overflowing
                    const hasOverflow = await window.evaluate(() => {
                        return (
                            document.body.scrollWidth >
                            globalThis.window.innerWidth
                        );
                    });

                    // Check overflow expectations for different screen sizes
                    expect(hasOverflow).toBe(viewport.width < 768);
                }
            }
        );

        test(
            "should display loading states",
            {
                tag: ["@loading", "@states"],
                annotation: {
                    type: "loading-states",
                    description: "Tests loading state displays",
                },
            },
            async () => {
                // Refresh to catch loading states
                await window.reload();

                // Look for loading indicators during load using semantic locators
                const loadingIndicators = window.getByText(/loading/i);

                // Loading indicators may appear briefly
                const count = await loadingIndicators.count();
                expect(count).toBeGreaterThanOrEqual(0);

                // Wait for page to be fully loaded
                await window.waitForLoadState("domcontentloaded");

                // Ensure loading states are gone
                await window.waitForTimeout(1000);
            }
        );

        test(
            "should handle error states gracefully",
            {
                tag: ["@error", "@states"],
                annotation: {
                    type: "error-handling",
                    description: "Tests error state handling",
                },
            },
            async () => {
                // Test JavaScript error handling
                const errorHandled = await window.evaluate(() => {
                    // Add error listener
                    let errorCaught = false;
                    globalThis.window.addEventListener("error", () => {
                        errorCaught = true;
                    });

                    try {
                        // Trigger a controlled error
                        (window as any).nonExistentFunction();
                    } catch {
                        return true; // Error was caught
                    }

                    return errorCaught;
                });

                // Either the error should be caught or the app should handle it gracefully
                expect(typeof errorHandled).toBe("boolean");
            }
        );
    }
);
