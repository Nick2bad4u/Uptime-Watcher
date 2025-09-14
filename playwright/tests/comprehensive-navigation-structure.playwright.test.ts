/**
 * Comprehensive navigation and app structure tests.
 *
 * These tests verify complete application navigation flows, keyboard
 * accessibility, component interactions, and deep application structure
 * validation.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import { waitForAppInitialization, UI_SELECTORS } from "../utils/ui-helpers";

test.describe(
    "comprehensive Navigation and Structure Tests",
    {
        tag: [
            "@navigation",
            "@comprehensive",
            "@structure",
            "@a11y",
        ],
        annotation: {
            type: "category",
            description:
                "Complete application navigation and structure validation",
        },
    },
    () => {
        test("should have complete application structure with all key components", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Verify core application structure
            await expect(page.getByTestId("app-root")).toBeVisible();
            await expect(page.getByTestId("app-container")).toBeVisible();

            // Verify header/navigation structure
            const headerButtons = [
                page.getByTestId("button-add-new-site"),
                page.getByTestId("button-toggle-theme"),
                page.getByTestId("button-settings"),
            ];

            for (const button of headerButtons) {
                await expect(button).toBeVisible();
                await expect(button).toBeEnabled();
            }

            // Verify button accessibility attributes
            const addSiteButton = page.getByTestId("button-add-new-site");
            await expect(addSiteButton).toHaveAttribute(
                "aria-label",
                "Add new site"
            );

            const themeButton = page.getByTestId("button-toggle-theme");
            await expect(themeButton).toHaveAttribute(
                "aria-label",
                "Toggle theme"
            );

            const settingsButton = page.getByTestId("button-settings");
            await expect(settingsButton).toHaveAttribute(
                "aria-label",
                "Settings"
            );

            // Verify main content areas exist
            const statusSummary = page.locator(".header-status-summary-box");
            await expect(statusSummary).toBeVisible();

            // Check for monitoring status indicators
            const statusIndicators = page.locator(".themed-status-indicator");
            const indicatorCount = await statusIndicators.count();
            expect(indicatorCount).toBeGreaterThan(0);

            await electronApp.close();
        });

        test("should support complete keyboard navigation flow", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Start with first focusable element
            await page.keyboard.press("Tab");

            // Should focus the Add Site button first
            let focusedElement = await page.evaluate(() =>
                document.activeElement?.getAttribute("data-testid")
            );
            expect(focusedElement).toBe("button-add-new-site");

            // Tab to theme toggle
            await page.keyboard.press("Tab");
            focusedElement = await page.evaluate(() =>
                document.activeElement?.getAttribute("data-testid")
            );
            expect(focusedElement).toBe("button-toggle-theme");

            // Tab to settings
            await page.keyboard.press("Tab");
            focusedElement = await page.evaluate(() =>
                document.activeElement?.getAttribute("data-testid")
            );
            expect(focusedElement).toBe("button-settings");

            // Test reverse navigation with Shift+Tab
            await page.keyboard.press("Shift+Tab");
            focusedElement = await page.evaluate(() =>
                document.activeElement?.getAttribute("data-testid")
            );
            expect(focusedElement).toBe("button-toggle-theme");

            await page.keyboard.press("Shift+Tab");
            focusedElement = await page.evaluate(() =>
                document.activeElement?.getAttribute("data-testid")
            );
            expect(focusedElement).toBe("button-add-new-site");

            await electronApp.close();
        });

        test("should open and navigate between different application views", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test opening Add Site modal
            await page.getByTestId("button-add-new-site").click();

            // Wait for modal to appear
            const modalOverlay = page.locator(UI_SELECTORS.MODAL_OVERLAY);
            await expect(modalOverlay).toBeVisible({ timeout: 5000 });

            // Verify Add Site modal content
            const addSiteTitle = page.getByText("Add New Site");
            await expect(addSiteTitle).toBeVisible();

            // Close modal with Escape
            await page.keyboard.press("Escape");
            await expect(modalOverlay).not.toBeVisible({ timeout: 5000 });

            // Test opening Settings modal
            await page.getByTestId("button-settings").click();

            // Wait for settings modal
            await expect(modalOverlay).toBeVisible({ timeout: 5000 });

            // Verify we're in settings (different from Add Site)
            const settingsContent = page
                .locator("dialog")
                .getByText("Settings");
            await expect(settingsContent).toBeVisible();

            // Close settings modal
            await page.keyboard.press("Escape");
            await expect(modalOverlay).not.toBeVisible({ timeout: 5000 });

            await electronApp.close();
        });

        test("should maintain focus management during navigation", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Focus on Add Site button
            await page.getByTestId("button-add-new-site").focus();
            let focusedElement = await page.evaluate(() =>
                document.activeElement?.getAttribute("data-testid")
            );
            expect(focusedElement).toBe("button-add-new-site");

            // Open modal and verify focus moves into modal
            await page.getByTestId("button-add-new-site").click();

            const modalOverlay = page.locator(UI_SELECTORS.MODAL_OVERLAY);
            await expect(modalOverlay).toBeVisible({ timeout: 5000 });

            // Focus should be trapped within modal
            await page.keyboard.press("Tab");

            // Get currently focused element
            const focusedInModal = await page.evaluate(() => {
                const activeEl = document.activeElement;
                return {
                    tagName: activeEl?.tagName,
                    type: activeEl?.getAttribute("type"),
                    id: activeEl?.getAttribute("id"),
                    ariaLabel: activeEl?.getAttribute("aria-label"),
                };
            });

            // Should focus on the first input in the modal (site name)
            expect(focusedInModal.tagName).toBe("INPUT");

            // Close modal and verify focus returns to trigger
            await page.keyboard.press("Escape");
            await expect(modalOverlay).not.toBeVisible({ timeout: 5000 });

            // Focus should return to the button that opened the modal
            await page.waitForTimeout(100); // Brief wait for focus to settle
            focusedElement = await page.evaluate(() =>
                document.activeElement?.getAttribute("data-testid")
            );
            expect(focusedElement).toBe("button-add-new-site");

            await electronApp.close();
        });

        test("should handle theme switching with proper visual updates", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Get initial theme state
            const initialBodyClass = await page.evaluate(
                () => document.body.className
            );

            // Click theme toggle
            await page.getByTestId("button-toggle-theme").click();

            // Wait for theme change
            await page.waitForTimeout(300);

            // Verify theme changed
            const newBodyClass = await page.evaluate(
                () => document.body.className
            );
            expect(newBodyClass).not.toBe(initialBodyClass);

            // Theme toggle button should still be accessible
            const themeButton = page.getByTestId("button-toggle-theme");
            await expect(themeButton).toBeVisible();
            await expect(themeButton).toBeEnabled();

            // Click again to toggle back
            await themeButton.click();
            await page.waitForTimeout(300);

            // Should return to original theme
            const finalBodyClass = await page.evaluate(
                () => document.body.className
            );
            expect(finalBodyClass).toBe(initialBodyClass);

            await electronApp.close();
        });

        test("should provide complete ARIA landmark structure", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Check for main landmark
            const mainLandmark = page.locator("main, [role='main']");
            const mainExists = (await mainLandmark.count()) > 0;

            if (mainExists) {
                await expect(mainLandmark.first()).toBeVisible();
            }

            // Check button roles and labels
            const buttons = page.locator("button");
            const buttonCount = await buttons.count();
            expect(buttonCount).toBeGreaterThan(0);

            // Verify each button has accessible name
            for (let i = 0; i < buttonCount; i++) {
                const button = buttons.nth(i);
                const ariaLabel = await button.getAttribute("aria-label");
                const buttonText = await button.textContent();

                // Button should have either aria-label or visible text
                expect(ariaLabel || buttonText?.trim()).toBeTruthy();
            }

            await electronApp.close();
        });

        test("should maintain responsive design across different viewport sizes", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test different viewport sizes
            const viewports = [
                { width: 1920, height: 1080 }, // Large desktop
                { width: 1366, height: 768 }, // Standard laptop
                { width: 1024, height: 768 }, // Tablet landscape
                { width: 768, height: 1024 }, // Tablet portrait
            ];

            for (const viewport of viewports) {
                await page.setViewportSize(viewport);
                await page.waitForTimeout(200); // Wait for layout

                // Core elements should remain visible and functional
                await expect(page.getByTestId("app-container")).toBeVisible();
                await expect(
                    page.getByTestId("button-add-new-site")
                ).toBeVisible();
                await expect(
                    page.getByTestId("button-toggle-theme")
                ).toBeVisible();
                await expect(page.getByTestId("button-settings")).toBeVisible();

                // Status summary should adapt to viewport
                const statusSummary = page.locator(
                    ".header-status-summary-box"
                );
                await expect(statusSummary).toBeVisible();
            }

            await electronApp.close();
        });

        test("should handle rapid navigation without breaking application state", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Perform rapid navigation actions
            for (let i = 0; i < 5; i++) {
                // Open Add Site modal
                await page.getByTestId("button-add-new-site").click();
                await expect(
                    page.locator(UI_SELECTORS.MODAL_OVERLAY)
                ).toBeVisible({ timeout: 2000 });

                // Close with Escape
                await page.keyboard.press("Escape");
                await expect(
                    page.locator(UI_SELECTORS.MODAL_OVERLAY)
                ).not.toBeVisible({ timeout: 2000 });

                // Brief pause between iterations
                await page.waitForTimeout(100);
            }

            // Verify app is still functional after rapid navigation
            await expect(page.getByTestId("app-container")).toBeVisible();
            await expect(page.getByTestId("button-add-new-site")).toBeEnabled();
            await expect(page.getByTestId("button-toggle-theme")).toBeEnabled();
            await expect(page.getByTestId("button-settings")).toBeEnabled();

            await electronApp.close();
        });
    }
);
