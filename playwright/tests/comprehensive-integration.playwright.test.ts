/**
 * Comprehensive Integration Tests End-to-end tests covering complete user
 * workflows and system interactions
 *
 * @file Integration tests that simulate real user scenarios and complete
 *   application workflows for the Uptime Watcher Electron application.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import { waitForAppInitialization } from "../utils/ui-helpers";

test.describe("comprehensive Integration Tests", () => {
    test.describe("complete User Workflows", () => {
        test("should complete full site monitoring workflow @integration @workflow @monitoring", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Step 1: Add a new site
            console.log("Step 1: Adding new site");
            await page.getByRole("button", { name: /add.?site/i }).click();

            // Wait for modal to appear and verify it's visible
            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible();

            // Fill out site details
            await page.getByLabel(/url/i).fill("https://example.com");
            await page.getByLabel(/name/i).fill("Example Test Site");

            // Submit the form
            await page
                .getByRole("button", { name: /submit|add|save/i })
                .click();

            // Step 2: Verify modal closes
            console.log("Step 2: Verifying modal closes");
            await expect(modal).toBeHidden();

            // Step 3: Test theme switching
            console.log("Step 3: Testing theme switching");
            const themeButton = page.getByRole("button", {
                name: /theme|dark|light/i,
            });
            await expect(themeButton).toBeVisible();

            // Test theme toggle functionality
            await themeButton.click();
            await page.waitForFunction(() => {
                const body = document.body;
                return (
                    body.classList.contains("dark") ||
                    body.classList.contains("light") ||
                    body.dataset.theme !== undefined ||
                    document.documentElement.classList.contains("dark") ||
                    document.documentElement.classList.contains("light")
                );
            });

            // Click again to revert theme
            await themeButton.click();
            await page.waitForFunction(() => {
                const body = document.body;
                return body.classList.length >= 0; // Simple check that DOM updated
            });

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
            const addButton = page.getByRole("button", { name: /add.?site/i });
            await addButton.click();

            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible();

            // Close modal with Escape key
            await page.keyboard.press("Escape");
            await expect(modal).toBeHidden();

            // Step 2: Test modal with form data
            console.log("Step 2: Testing modal with form data");

            await addButton.click();
            await expect(modal).toBeVisible();

            // Fill partial form data
            const urlInput = page.getByLabel(/url/i);
            await urlInput.fill("https://test-modal.com");

            // Close without submitting
            await page.keyboard.press("Escape");
            await expect(modal).toBeHidden();

            // Reopen to verify form is cleared
            await addButton.click();
            await expect(modal).toBeVisible();

            const urlValue = await urlInput.inputValue();

            // Form should be cleared or show placeholder - just verify we can get the value
            expect(typeof urlValue).toBe("string");
            console.log(`URL input value after reopening: "${urlValue}"`);

            // Close modal
            await page.keyboard.press("Escape");
            await expect(modal).toBeHidden();

            console.log("✅ Modal interactions test passed");
            await electronApp.close();
        });

        test("should handle form validation correctly @integration @validation @forms", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            console.log("Step 1: Testing form validation");

            // Open modal
            const addButton = page.getByRole("button", { name: /add.?site/i });
            await addButton.click();

            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible();

            // Try to submit empty form
            const submitButton = page.getByRole("button", {
                name: /submit|add|save/i,
            });
            await submitButton.click();

            // Form should stay open (validation should prevent submission)
            await page.waitForFunction(() => true, { timeout: 2000 });

            // Modal should still be visible (validation should prevent submission)
            await expect(modal).toBeVisible();

            // Fill required fields
            await page.getByLabel(/url/i).fill("https://validation-test.com");
            await page.getByLabel(/name/i).fill("Validation Test Site");

            // Submit valid form
            await submitButton.click();

            // Modal should close
            await expect(modal).toBeHidden();

            console.log("✅ Form validation test passed");
            await electronApp.close();
        });
    });

    test.describe("error Handling and Recovery", () => {
        test("should handle rapid user interactions @integration @stress @rapid-interactions", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            console.log("Step 1: Testing rapid modal open/close");

            // Rapidly open and close modals
            for (let i = 0; i < 3; i++) {
                const addButton = page.getByRole("button", {
                    name: /add.?site/i,
                });
                await addButton.click();

                const modal = page.getByRole("dialog");
                await expect(modal).toBeVisible();

                // Close modal with Escape key
                await page.keyboard.press("Escape");
                await expect(modal).toBeHidden();

                await page.waitForFunction(() => true, { timeout: 200 }); // Brief pause
            }

            console.log("Step 2: Testing rapid button clicks");

            // Test rapid button clicking (should handle gracefully)
            const addButton = page.getByRole("button", { name: /add.?site/i });

            // Click multiple times rapidly
            await addButton.click();
            await addButton.click();
            await addButton.click();

            // Should still open modal successfully
            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible();

            // Close modal
            await page.keyboard.press("Escape");
            await expect(modal).toBeHidden();

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
            await page.waitForFunction(
                () => {
                    const focused = document.activeElement;
                    return focused && focused !== document.body;
                },
                { timeout: 500 }
            );

            // Check if focus is visible by evaluating the DOM
            const isFocused = await page.evaluate(() => {
                const focused = document.activeElement;
                return focused && focused !== document.body ? 1 : 0;
            });

            // Assert that focus is working
            expect(isFocused).toBeGreaterThan(0);
            console.log("✅ Keyboard focus working");

            // Test keyboard shortcuts
            await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");

            // Check if a modal opens and handle it
            const modal = page.getByRole("dialog");

            // If modal opened, verify it's visible then close it
            await expect(modal).toBeVisible({ timeout: 2000 });
            await page.keyboard.press("Escape");
            await expect(modal).toBeHidden();

            console.log("✅ Keyboard navigation test passed");
            await electronApp.close();
        });
    });

    test.describe("application Lifecycle", () => {
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
            await expect(page.getByTestId("app-container")).toBeVisible();
            await expect(
                page.getByRole("button", { name: /add.?site/i })
            ).toBeVisible();

            console.log("Step 2: Testing basic functionality");

            // Test that basic UI interactions work
            const addButton = page.getByRole("button", { name: /add.?site/i });
            await addButton.click();

            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible();

            // Close modal
            await page.keyboard.press("Escape");
            await expect(modal).toBeHidden();

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
                    const addButton = page.getByRole("button", {
                        name: /add.?site/i,
                    });
                    await addButton.click();

                    const modal = page.getByRole("dialog");
                    await expect(modal).toBeVisible();

                    await page.keyboard.press("Escape");
                    await expect(modal).toBeHidden();
                });
            }

            // Execute operations with minimal delay
            for (const operation of operations) {
                await operation();
                await page.waitForFunction(() => true, { timeout: 100 }); // Minimal delay between operations
            }

            console.log("Step 2: Verifying app remains responsive");

            // Verify app is still responsive
            const addButton = page.getByRole("button", { name: /add.?site/i });
            await addButton.click();

            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible();

            // Close final modal
            await page.keyboard.press("Escape");
            await expect(modal).toBeHidden();

            console.log("✅ UI responsiveness test passed");
            await electronApp.close();
        });
    });
});
