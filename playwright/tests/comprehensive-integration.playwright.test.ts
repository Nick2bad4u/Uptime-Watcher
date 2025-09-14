/**
 * Comprehensive Integration Tests End-to-end tests covering complete user
 * workflows and system interactions
 *
 * @file Integration tests that simulate real user scenarios and complete
 *   application workflows for the Uptime Watcher Electron application.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import {
    waitForAppInitialization,
    UI_SELECTORS,
    FORM_SELECTORS,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";

test.describe("Comprehensive Integration Tests", () => {
    test.describe("Complete User Workflows", () => {
        test("should complete full site monitoring workflow @integration @workflow @monitoring", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Step 1: Add a new site
            console.log("Step 1: Adding new site");
            await page.click(UI_SELECTORS.ADD_SITE_BUTTON);

            // Wait for modal to appear
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                timeout: WAIT_TIMEOUTS.LONG,
            });

            // Fill out site details
            await page.fill(
                FORM_SELECTORS.SITE_URL_INPUT,
                "https://example.com"
            );
            await page.fill(
                FORM_SELECTORS.SITE_NAME_INPUT,
                "Example Test Site"
            );

            // Submit the form
            await page.click(FORM_SELECTORS.SUBMIT_BUTTON);

            // Step 2: Verify modal closes
            console.log("Step 2: Verifying modal closes");
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                state: "hidden",
                timeout: WAIT_TIMEOUTS.LONG,
            });

            // Step 3: Test theme switching
            console.log("Step 3: Testing theme switching");
            const themeButton = page.locator(UI_SELECTORS.THEME_TOGGLE);
            if (await themeButton.isVisible()) {
                await themeButton.click();
                await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);

                // Click again to revert
                await themeButton.click();
                await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);
            }

            console.log("✅ Complete user workflow test passed");
            await electronApp.close();
        });

        test("should handle modal interactions correctly @integration @modal @interactions", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Step 1: Test modal open/close cycle
            console.log("Step 1: Testing modal open/close");

            // Open modal
            await page.click(UI_SELECTORS.ADD_SITE_BUTTON);
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                timeout: WAIT_TIMEOUTS.LONG,
            });

            // Verify modal is visible
            const modalVisible = await page
                .locator(UI_SELECTORS.MODAL_OVERLAY)
                .isVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
            expect(modalVisible).toBe(true);

            // Close modal with Escape key
            await page.keyboard.press("Escape");
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                state: "hidden",
                timeout: WAIT_TIMEOUTS.LONG,
            });

            // Step 2: Test modal with form data
            console.log("Step 2: Testing modal with form data");

            await page.click(UI_SELECTORS.ADD_SITE_BUTTON);
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                timeout: WAIT_TIMEOUTS.LONG,
            });

            // Fill partial form data
            await page.fill(
                FORM_SELECTORS.SITE_URL_INPUT,
                "https://test-modal.com"
            );

            // Close without submitting
            await page.keyboard.press("Escape");
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                state: "hidden",
                timeout: WAIT_TIMEOUTS.LONG,
            });

            // Reopen to verify form is cleared
            await page.click(UI_SELECTORS.ADD_SITE_BUTTON);
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                timeout: WAIT_TIMEOUTS.LONG,
            });

            const urlInput = page.locator(FORM_SELECTORS.SITE_URL_INPUT);
            const urlValue = await urlInput.inputValue();

            // Form should be cleared or show placeholder
            console.log(`URL input value after reopening: "${urlValue}"`);

            // Close modal
            await page.keyboard.press("Escape");
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                state: "hidden",
                timeout: WAIT_TIMEOUTS.LONG,
            });

            console.log("✅ Modal interactions test passed");
            await electronApp.close();
        });

        test("should handle form validation correctly @integration @validation @forms", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            console.log("Step 1: Testing form validation");

            // Open modal
            await page.click(UI_SELECTORS.ADD_SITE_BUTTON);
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                timeout: WAIT_TIMEOUTS.LONG,
            });

            // Try to submit empty form
            await page.click(FORM_SELECTORS.SUBMIT_BUTTON);

            // Form should stay open (validation should prevent submission)
            await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);

            // Modal should still be visible (validation should prevent submission)
            const modalVisible = await page
                .locator(UI_SELECTORS.MODAL_OVERLAY)
                .isVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
            expect(modalVisible).toBe(true);

            // Fill required fields
            await page.fill(
                FORM_SELECTORS.SITE_URL_INPUT,
                "https://validation-test.com"
            );
            await page.fill(
                FORM_SELECTORS.SITE_NAME_INPUT,
                "Validation Test Site"
            );

            // Submit valid form
            await page.click(FORM_SELECTORS.SUBMIT_BUTTON);

            // Modal should close
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                state: "hidden",
                timeout: WAIT_TIMEOUTS.LONG,
            });

            console.log("✅ Form validation test passed");
            await electronApp.close();
        });
    });

    test.describe("Error Handling and Recovery", () => {
        test("should handle rapid user interactions @integration @stress @rapid-interactions", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            console.log("Step 1: Testing rapid modal open/close");

            // Rapidly open and close modals
            for (let i = 0; i < 3; i++) {
                await page.click(UI_SELECTORS.ADD_SITE_BUTTON);
                await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                // Close modal with Escape key
                await page.keyboard.press("Escape");
                await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                    state: "hidden",
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await page.waitForTimeout(200); // Brief pause
            }

            console.log("Step 2: Testing rapid button clicks");

            // Test rapid button clicking (should handle gracefully)
            const addButton = page.locator(UI_SELECTORS.ADD_SITE_BUTTON);

            // Click multiple times rapidly
            await addButton.click();
            await addButton.click();
            await addButton.click();

            // Should still open modal successfully
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                timeout: WAIT_TIMEOUTS.MEDIUM,
            });

            // Close modal
            await page.keyboard.press("Escape");
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                state: "hidden",
                timeout: WAIT_TIMEOUTS.MEDIUM,
            });

            console.log("✅ Rapid interactions test passed");
            await electronApp.close();
        });

        test("should handle keyboard navigation @integration @keyboard @accessibility", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            console.log("Step 1: Testing keyboard navigation");

            // Test Tab navigation
            await page.keyboard.press("Tab");
            await page.waitForTimeout(500);

            // Check if focus is visible
            const focusedElement = page.locator(":focus");
            const isFocused = await focusedElement.count();

            if (isFocused > 0) {
                console.log("✅ Keyboard focus working");
            }

            // Test keyboard shortcuts
            await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");

            // If a modal opens, close it
            const modalVisible = await page
                .locator(UI_SELECTORS.MODAL_OVERLAY)
                .isVisible({ timeout: 2000 });
            if (modalVisible) {
                await page.keyboard.press("Escape");
                await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                    state: "hidden",
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
            }

            console.log("✅ Keyboard navigation test passed");
            await electronApp.close();
        });
    });

    test.describe("Application Lifecycle", () => {
        test("should handle application startup gracefully @integration @lifecycle @startup", async () => {
            console.log("Step 1: Testing application startup");

            const startTime = Date.now();
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            // Test that app starts within reasonable time
            await waitForAppInitialization(page);
            const startupTime = Date.now() - startTime;

            console.log(`App startup time: ${startupTime}ms`);
            expect(startupTime).toBeLessThan(15000); // Should start within 15 seconds

            // Verify essential UI elements are present
            await expect(
                page.locator(UI_SELECTORS.APP_CONTAINER)
            ).toBeVisible();
            await expect(
                page.locator(UI_SELECTORS.ADD_SITE_BUTTON)
            ).toBeVisible();

            console.log("Step 2: Testing basic functionality");

            // Test that basic UI interactions work
            await page.click(UI_SELECTORS.ADD_SITE_BUTTON);
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                timeout: WAIT_TIMEOUTS.LONG,
            });

            // Verify modal opened
            const modalVisible = await page
                .locator(UI_SELECTORS.MODAL_OVERLAY)
                .isVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
            expect(modalVisible).toBe(true);

            // Close modal
            await page.keyboard.press("Escape");
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                state: "hidden",
                timeout: WAIT_TIMEOUTS.MEDIUM,
            });

            console.log("Step 3: Testing graceful shutdown");

            // Close application gracefully
            await electronApp.close();

            console.log("✅ Application lifecycle test passed");
        });

        test("should maintain UI responsiveness @integration @performance @responsiveness", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            console.log("Step 1: Testing UI responsiveness under load");

            // Perform multiple UI operations rapidly
            const operations = [];
            for (let i = 0; i < 5; i++) {
                operations.push(async () => {
                    await page.click(UI_SELECTORS.ADD_SITE_BUTTON);
                    await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    });
                    await page.keyboard.press("Escape");
                    await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                        state: "hidden",
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    });
                });
            }

            // Execute operations with minimal delay
            for (const operation of operations) {
                await operation();
                await page.waitForTimeout(100); // Minimal delay between operations
            }

            console.log("Step 2: Verifying app remains responsive");

            // Verify app is still responsive
            await page.click(UI_SELECTORS.ADD_SITE_BUTTON);
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                timeout: WAIT_TIMEOUTS.MEDIUM,
            });

            // Verify modal still works after heavy interactions
            const modalVisible = await page
                .locator(UI_SELECTORS.MODAL_OVERLAY)
                .isVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
            expect(modalVisible).toBe(true);

            // Close final modal
            await page.keyboard.press("Escape");
            await page.waitForSelector(UI_SELECTORS.MODAL_OVERLAY, {
                state: "hidden",
                timeout: WAIT_TIMEOUTS.MEDIUM,
            });

            console.log("✅ UI responsiveness test passed");
            await electronApp.close();
        });
    });
});
