/**
 * Simple Data Management Testing for Uptime Watcher.
 *
 * This test suite covers basic data operations to ensure the application
 * handles site management properly, modeled after working edge-cases tests.
 */

import { test, expect } from "../fixtures/electron-test";

test.describe(
    "data Migration & Import Tests - E2E",
    {
        tag: [
            "@e2e",
            "@data-migration",
            "@import-export",
            "@backup-restore",
        ],
        annotation: {
            type: "category",
            description: "Data import and export functionality validation",
        },
    },
    () => {
        test(
            "single site data management",
            {
                tag: ["@data-management"],
                annotation: {
                    type: "data-management",
                    description: "Test basic site data operations",
                },
            },
            async ({ window }) => {
                // Add a single test site
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                await window.getByLabel("Site Name").fill("Test Site 1");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(2000);

                // Verify site was added
                await expect(window.getByTestId("site-card")).toHaveCount(1);

                await window.screenshot({
                    path: "playwright/test-results/data-migration-01-single-site.png",
                    fullPage: true,
                });
            }
        );

        test(
            "settings access test",
            {
                tag: ["@settings"],
                annotation: {
                    type: "settings",
                    description: "Test settings functionality",
                },
            },
            async ({ window }) => {
                // Test settings access
                await window.getByRole("button", { name: "Settings" }).click();
                await window.waitForTimeout(1000);
                await expect(window.getByText("⚙️ Settings")).toBeVisible();
                await window.getByTestId("button-close-settings").click();
                await window.waitForTimeout(500);

                await window.screenshot({
                    path: "playwright/test-results/data-migration-02-settings.png",
                    fullPage: true,
                });
            }
        );

        test(
            "multiple sites test",
            {
                tag: ["@multiple-sites"],
                annotation: {
                    type: "multiple-sites",
                    description: "Test adding multiple sites",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForStressTesting();

                try {
                    // Add 2 sites with unique names
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);
                    await window.getByLabel("Site Name").fill("Alpha Site");
                    await window
                        .getByLabel("URL")
                        .fill("https://httpbin.org/status/200");
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(2000);

                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);
                    await window.getByLabel("Site Name").fill("Beta Site");
                    await window
                        .getByLabel("URL")
                        .fill("https://httpbin.org/status/201");
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(2000);

                    // Verify both sites were added
                    await expect(window.getByTestId("site-card")).toHaveCount(
                        2
                    );

                    await window.screenshot({
                        path: "playwright/test-results/data-migration-03-multiple-sites.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "error handling test",
            {
                tag: ["@error-handling"],
                annotation: {
                    type: "error-handling",
                    description: "Test error handling with invalid data",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForStressTesting();

                try {
                    // Try invalid URL
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);
                    await window.getByLabel("Site Name").fill("Invalid Site");
                    await window.getByLabel("URL").fill("not-a-url");
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1000);

                    // Form should still be visible (validation failed)
                    await expect(window.getByLabel("Site Name")).toBeVisible();

                    // Close the modal
                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);

                    await window.screenshot({
                        path: "playwright/test-results/data-migration-04-error-handling.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "basic navigation test",
            {
                tag: ["@navigation"],
                annotation: {
                    type: "navigation",
                    description: "Test basic app navigation",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForStressTesting();

                try {
                    // Add a site for navigation test
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);
                    await window
                        .getByLabel("Site Name")
                        .fill("Navigation Test Site");
                    await window
                        .getByLabel("URL")
                        .fill("https://httpbin.org/status/200");
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(2000);

                    // Click on the site to view details
                    await window.getByText("Navigation Test Site").click();
                    await window.waitForTimeout(1000);
                    await expect(
                        window.getByText("Site Overview")
                    ).toBeVisible();

                    // Close site details
                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);

                    await window.screenshot({
                        path: "playwright/test-results/data-migration-05-navigation.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );
    }
);
