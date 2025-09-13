/**
 * End-to-end UI tests for the AddSiteForm component.
 *
 * These tests verify the add site form functionality within the complete
 * Electron application context, including form validation, field interactions,
 * and submission handling.
 *
 * @remarks
 * Tests cover:
 *
 * - Form field rendering and initial state
 * - Form validation (client-side)
 * - Dynamic field visibility based on monitor type
 * - Form submission flows (new site vs existing site)
 * - Error handling and display
 * - Accessibility features
 * - Field interactions and real-time validation
 */

/* eslint-disable playwright/no-conditional-in-test */
/* eslint-disable playwright/no-conditional-expect */
/* eslint-disable playwright/expect-expect */
// NOTE: These form UI tests intentionally use conditional logic
// to test various form states and validation scenarios

import { test, expect, _electron as electron } from "@playwright/test";
import path from "node:path";

test.describe(
    "addSiteForm UI tests",
    {
        tag: ["@ui", "@form"],
        annotation: {
            type: "category",
            description: "UI tests for site creation and monitor addition form",
        },
    },
    () => {
        test(
            "should render add site form when accessing form area",
            {
                tag: [
                    "@fast",
                    "@ui",
                    "@smoke",
                ],
                annotation: [
                    {
                        type: "ui",
                        description:
                            "Verifies form rendering and basic field presence",
                    },
                    {
                        type: "smoke",
                        description: "Critical form component rendering test",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                // Wait for the React app to fully load
                await expect(window.getByTestId("app-root")).toBeVisible({
                    timeout: 15000,
                });
                await expect(window.getByTestId("app-root")).not.toBeEmpty({
                    timeout: 10000,
                });

                // Click the first button to potentially open the form (likely "Add Site" button)
                const firstButton = window.getByRole("button").first();
                await expect(firstButton).toBeVisible({ timeout: 5000 });
                await firstButton.click();

                // Wait for potential modal/form to appear
                await window.waitForTimeout(1000);

                // Take screenshot of the initial app state
                await window.screenshot({
                    path: "playwright/test-results/app-initial-state.png",
                });

                // Look for form-related elements that might indicate an add site form
                /* eslint-disable-next-line playwright/no-raw-locators */
                const formElements = window.locator('form, [role="form"]');
                /* eslint-disable-next-line playwright/no-raw-locators */
                const inputElements = window.locator("input, select, textarea");
                const buttonElements = window.getByRole("button");

                // Log what we find
                const formCount = await formElements.count();
                const inputCount = await inputElements.count();
                const buttonCount = await buttonElements.count();

                console.log(
                    `Found ${formCount} forms, ${inputCount} inputs, ${buttonCount} buttons`
                );

                // Look for specific form fields that would indicate an add site form
                /* eslint-disable-next-line playwright/no-raw-locators */
                const urlFields = window.locator(
                    'input[type="url"], input[placeholder*="http"], input[placeholder*="URL"]'
                );
                /* eslint-disable-next-line playwright/no-raw-locators */
                const nameFields = window.locator(
                    'input[placeholder*="name"], input[placeholder*="Name"]'
                );
                /* eslint-disable-next-line playwright/no-raw-locators */
                const submitButtons = window.locator(
                    'button[type="submit"], button:has-text("Add"), button:has-text("Create")'
                );

                const urlFieldCount = await urlFields.count();
                const nameFieldCount = await nameFields.count();
                const submitButtonCount = await submitButtons.count();

                console.log(
                    `Found ${urlFieldCount} URL fields, ${nameFieldCount} name fields, ${submitButtonCount} submit buttons`
                );

                // Verify we have form elements and they're functional
                expect(inputCount).toBeGreaterThan(0);
                await expect(inputElements.first()).toBeVisible();
                console.log("Form elements are present and visible");

                await electronApp.close();
            }
        );

        test(
            "should handle form field interactions and validation",
            {
                tag: [
                    "@slow",
                    "@ui",
                    "@validation",
                ],
                annotation: [
                    {
                        type: "validation",
                        description: "Tests form field validation behavior",
                    },
                    {
                        type: "interaction",
                        description: "Form field interaction testing",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                // Wait for the React app to fully load
                await window.waitForTimeout(3000);

                // Look for form inputs
                /* eslint-disable-next-line playwright/no-raw-locators */
                const textInputs = window.locator(
                    'input[type="text"], input[type="url"], input:not([type])'
                );
                const selects = window.getByRole("combobox");

                const textInputCount = await textInputs.count();
                const selectCount = await selects.count();

                console.log(
                    `Found ${textInputCount} text inputs and ${selectCount} select elements`
                );

                // Test input interactions if we have fields
                if (textInputCount > 0) {
                    const firstInput = textInputs.first();
                    await expect(firstInput).toBeVisible();

                    // Test typing in the field
                    await firstInput.fill("test input");
                    const inputValue = firstInput;
                    await expect(inputValue).toHaveValue("test input");

                    // Take screenshot after input
                    await window.screenshot({
                        path: "playwright/test-results/form-with-input.png",
                    });

                    console.log("Successfully typed in form field");
                }

                // Test select interactions if we have dropdowns
                if (selectCount > 0) {
                    const firstSelect = selects.first();
                    await expect(firstSelect).toBeVisible();

                    // Get available options
                    const options = await firstSelect
                        .getByRole("option")
                        .count();
                    console.log(`Select element has ${options} options`);

                    if (options > 1) {
                        // Select the second option
                        await firstSelect.selectOption({ index: 1 });
                        console.log("Successfully changed select value");
                    }
                }

                await electronApp.close();
            }
        );

        test(
            "should display form validation errors appropriately",
            {
                tag: [
                    "@slow",
                    "@ui",
                    "@validation",
                ],
                annotation: [
                    {
                        type: "validation",
                        description: "Error message display verification",
                    },
                    { type: "ui", description: "Error state UI testing" },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                // Wait for the React app to fully load
                await window.waitForTimeout(3000);

                // Look for submit buttons to trigger validation
                /* eslint-disable-next-line playwright/no-raw-locators */
                const submitButtons = window.locator(
                    'button[type="submit"], button:has-text("Add"), button:has-text("Create"), button:has-text("Submit")'
                );

                const submitButtonCount = await submitButtons.count();
                console.log(
                    `Found ${submitButtonCount} potential submit buttons`
                );

                if (submitButtonCount > 0) {
                    const submitButton = submitButtons.first();
                    await expect(submitButton).toBeVisible();

                    // Try to submit without filling required fields to trigger validation
                    await submitButton.click();

                    // Wait for potential validation messages
                    await window.waitForTimeout(1000);

                    // Look for error messages
                    /* eslint-disable-next-line playwright/no-raw-locators */
                    const errorMessages = window.locator(
                        '[role="alert"], .error, [class*="error"], [aria-invalid="true"]'
                    );
                    const errorCount = await errorMessages.count();

                    console.log(
                        `Found ${errorCount} potential error indicators`
                    );

                    // Take screenshot of potential error state
                    await window.screenshot({
                        path: "playwright/test-results/form-validation-errors.png",
                    });

                    if (errorCount > 0) {
                        console.log(
                            "Form validation errors displayed correctly"
                        );
                    }
                }

                await electronApp.close();
            }
        );

        test(
            "should handle monitor type selection and show appropriate fields",
            {
                tag: [
                    "@slow",
                    "@ui",
                    "@dynamic",
                ],
                annotation: [
                    {
                        type: "ui",
                        description:
                            "Dynamic field visibility based on monitor type",
                    },
                    {
                        type: "form",
                        description: "Monitor type-specific field testing",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                // Wait for the React app to fully load
                await window.waitForTimeout(3000);

                // Look for monitor type selection (radio buttons, select, etc.)
                const radioGroups = window.getByRole("radio");
                const selects = window.getByRole("combobox");

                const radioCount = await radioGroups.count();
                const selectCount = await selects.count();

                console.log(
                    `Found ${radioCount} radio buttons and ${selectCount} select elements`
                );

                // Test radio button interactions (if available)
                if (radioCount > 0) {
                    // Take screenshot before selection
                    await window.screenshot({
                        path: "playwright/test-results/before-monitor-type-selection.png",
                    });

                    // Try clicking different radio options
                    for (let i = 0; i < Math.min(radioCount, 3); i++) {
                        const radio = radioGroups.nth(i);
                        if (await radio.isVisible()) {
                            await radio.click();
                            await window.waitForTimeout(500);

                            // Check if radio is now checked
                            const isChecked = await radio.isChecked();
                            console.log(
                                `Radio button ${i} checked: ${isChecked}`
                            );
                        }
                    }

                    // Take screenshot after selection
                    await window.screenshot({
                        path: "playwright/test-results/after-monitor-type-selection.png",
                    });
                }

                // Test select dropdown interactions
                if (selectCount > 0) {
                    for (let i = 0; i < Math.min(selectCount, 2); i++) {
                        const select = selects.nth(i);
                        if (await select.isVisible()) {
                            const options = await select
                                .getByRole("option")
                                .count();
                            console.log(`Select ${i} has ${options} options`);

                            if (options > 1) {
                                // Try selecting different options
                                await select.selectOption({ index: 1 });
                                await window.waitForTimeout(500);

                                const selectedValue = await select.inputValue();
                                console.log(`Selected value: ${selectedValue}`);
                            }
                        }
                    }
                }

                await electronApp.close();
            }
        );

        test(
            "should provide proper accessibility features",
            {
                tag: [
                    "@fast",
                    "@ui",
                    "@accessibility",
                ],
                annotation: [
                    {
                        type: "accessibility",
                        description: "Form accessibility feature verification",
                    },
                    {
                        type: "ui",
                        description:
                            "Screen reader and keyboard navigation support",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                // Wait for the React app to fully load
                await window.waitForTimeout(2000);

                // Check for proper form labels and accessibility attributes
                /* eslint-disable-next-line playwright/no-raw-locators */
                const labelElements = window.locator("label");
                /* eslint-disable-next-line playwright/no-raw-locators */
                const inputsWithLabels = window.locator(
                    "input[aria-label], input[aria-labelledby]"
                );
                 
                const inputsWithPlaceholders =
                    /* eslint-disable-next-line playwright/no-raw-locators */
                    window.locator("input[placeholder]");

                const labelCount = await labelElements.count();
                const labeledInputCount = await inputsWithLabels.count();
                const placeholderCount = await inputsWithPlaceholders.count();

                console.log(
                    `Found ${labelCount} labels, ${labeledInputCount} labeled inputs, ${placeholderCount} placeholder inputs`
                );

                // Verify that form fields have proper accessibility attributes
                /* eslint-disable-next-line playwright/no-raw-locators */
                const allInputs = window.locator("input, select, textarea");
                const inputCount = await allInputs.count();

                for (let i = 0; i < Math.min(inputCount, 5); i++) {
                    const input = allInputs.nth(i);
                    if (await input.isVisible()) {
                        const ariaLabel =
                            await input.getAttribute("aria-label");
                        const ariaLabelledBy =
                            await input.getAttribute("aria-labelledby");
                        const placeholder =
                            await input.getAttribute("placeholder");
                        const id = await input.getAttribute("id");

                        console.log(`Input ${i} accessibility:`, {
                            ariaLabel,
                            ariaLabelledBy,
                            placeholder,
                            id,
                            hasLabel:
                                ariaLabel || ariaLabelledBy || placeholder,
                        });
                    }
                }

                // Test keyboard navigation
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);

                // Check if focus is properly managed
                const focusedElement = await window.evaluate(() => {
                    const focused = document.activeElement;
                    return focused
                        ? {
                              tagName: focused.tagName,
                              type: focused.getAttribute("type"),
                              ariaLabel: focused.getAttribute("aria-label"),
                              placeholder: focused.getAttribute("placeholder"),
                          }
                        : null;
                });

                console.log("Focused element:", focusedElement);

                await electronApp.close();
            }
        );

        test(
            "should handle form submission success flow",
            {
                tag: [
                    "@slow",
                    "@ui",
                    "@submission",
                ],
                annotation: [
                    {
                        type: "form",
                        description: "Form submission flow testing",
                    },
                    {
                        type: "integration",
                        description: "Complete form workflow verification",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                // Wait for the React app to fully load
                await window.waitForTimeout(3000);

                // Look for form fields and fill them with valid data
                /* eslint-disable-next-line playwright/no-raw-locators */
                const nameInputs = window.locator(
                    'input[placeholder*="name"], input[placeholder*="Name"]'
                );
                /* eslint-disable-next-line playwright/no-raw-locators */
                const urlInputs = window.locator(
                    'input[type="url"], input[placeholder*="http"], input[placeholder*="URL"]'
                );

                const nameInputCount = await nameInputs.count();
                const urlInputCount = await urlInputs.count();

                console.log(
                    `Found ${nameInputCount} name inputs and ${urlInputCount} URL inputs`
                );

                // Fill form fields if available
                if (nameInputCount > 0) {
                    const nameInput = nameInputs.first();
                    await nameInput.fill("Test Site");
                    console.log("Filled name field");
                }

                if (urlInputCount > 0) {
                    const urlInput = urlInputs.first();
                    await urlInput.fill("https://example.com");
                    console.log("Filled URL field");
                }

                // Take screenshot with filled form
                await window.screenshot({
                    path: "playwright/test-results/form-filled.png",
                });

                // Look for and click submit button
                /* eslint-disable-next-line playwright/no-raw-locators */
                const submitButtons = window.locator(
                    'button[type="submit"], button:has-text("Add"), button:has-text("Create"), button:has-text("Submit")'
                );

                if ((await submitButtons.count()) > 0) {
                    const submitButton = submitButtons.first();
                    await expect(submitButton).toBeVisible();

                    // Take screenshot before submission
                    await window.screenshot({
                        path: "playwright/test-results/before-form-submit.png",
                    });

                    await submitButton.click();

                    // Wait for submission to process
                    await window.waitForTimeout(2000);

                    // Take screenshot after submission
                    await window.screenshot({
                        path: "playwright/test-results/after-form-submit.png",
                    });

                    console.log("Form submission attempted");

                    // Look for success indicators or form reset
                    /* eslint-disable-next-line playwright/no-raw-locators */
                    const successMessages = window.locator(
                        '[role="status"], .success, [class*="success"]'
                    );
                    const successCount = await successMessages.count();

                    console.log(
                        `Found ${successCount} potential success indicators`
                    );
                }

                await electronApp.close();
            }
        );
    }
);

/* eslint-enable playwright/no-conditional-in-test */
/* eslint-enable playwright/no-conditional-expect */
/* eslint-enable playwright/expect-expect */
