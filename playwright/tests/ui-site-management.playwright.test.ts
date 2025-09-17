/**
 * Comprehensive E2E tests for site management functionality.
 *
 * Tests cover:
 *
 * - Adding new sites with different monitor types
 * - Form validation and error handling
 * - Site listing and display
 * - Site card interactions
 * - Monitor management
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";

test.describe("site management", () => {
    test("should display app title and basic UI elements", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Verify app title
            const title = await page.title();
            expect(title).toContain("Uptime Watcher");

            // Verify add new site button is present
            const addSiteButton = page.getByRole("button", {
                name: "Add new site",
            });
            await expect(addSiteButton).toBeVisible({ timeout: 10000 });

            // Verify theme toggle button
            const themeButton = page.getByRole("button", {
                name: "Toggle theme",
            });
            await expect(themeButton).toBeVisible();

            // Verify settings button
            const settingsButton = page.getByRole("button", {
                name: "Settings",
            });
            await expect(settingsButton).toBeVisible();
        } finally {
            await electronApp.close();
        }
    });

    test("should open add site modal when clicking add new site button", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Click add new site button
            const addSiteButton = page.getByRole("button", {
                name: "Add new site",
            });
            await expect(addSiteButton).toBeVisible({ timeout: 10000 });
            await addSiteButton.click();

            // Verify modal opens
            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Verify modal title
            const modalTitle = page.getByText("Add New Site");
            await expect(modalTitle).toBeVisible();

            // Verify close button exists
            const closeButton = page.getByRole("button", {
                name: "Close modal",
            });
            await expect(closeButton).toBeVisible();
        } finally {
            await electronApp.close();
        }
    });

    test("should close add site modal when clicking close button", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Open modal
            const addSiteButton = page.getByRole("button", {
                name: "Add new site",
            });
            await expect(addSiteButton).toBeVisible({ timeout: 10000 });
            await addSiteButton.click();

            // Verify modal is open
            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Close modal
            const closeButton = page.getByRole("button", {
                name: "Close modal",
            });
            await closeButton.click();

            // Verify modal is closed
            await expect(modal).not.toBeVisible({ timeout: 5000 });
        } finally {
            await electronApp.close();
        }
    });

    test("should close add site modal when clicking backdrop", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Open modal
            const addSiteButton = page.getByRole("button", {
                name: "Add new site",
            });
            await expect(addSiteButton).toBeVisible({ timeout: 10000 });
            await addSiteButton.click();

            // Verify modal is open
            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Click backdrop by clicking outside the dialog content
            await page.mouse.click(10, 10);

            // Verify modal is closed
            await expect(modal).not.toBeVisible({ timeout: 5000 });
        } finally {
            await electronApp.close();
        }
    });

    test("should validate required fields in add site form", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Open modal
            const addSiteButton = page.getByRole("button", {
                name: "Add new site",
            });
            await expect(addSiteButton).toBeVisible({ timeout: 10000 });
            await addSiteButton.click();

            // Wait for modal to be fully loaded
            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Try to submit empty form
            const submitButton = page.getByRole("button", { name: "Add Site" });
            await expect(submitButton).toBeVisible();
            await submitButton.click();

            // Check for validation errors or that form remains open
            // Look for common form validation patterns
            const validationError = page
                .getByText("required")
                .or(page.getByText("Please").or(page.getByText("error")));

            // Verify either validation error appears or modal stays open
            const modalStillOpen = await modal.isVisible();
            const hasValidationError = await validationError
                .isVisible()
                .catch(() => false);

            expect(modalStillOpen || hasValidationError).toBe(true);
        } finally {
            await electronApp.close();
        }
    });

    test("should successfully add a new HTTP site", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Count existing sites before adding
            const existingSiteCards = await page.getByTestId("site-card").all();
            const initialCount = existingSiteCards.length;

            // Open modal
            const addSiteButton = page.getByRole("button", {
                name: "Add new site",
            });
            await expect(addSiteButton).toBeVisible({ timeout: 10000 });
            await addSiteButton.click();

            // Wait for modal to be fully loaded
            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Fill in the form using multiple selector approaches
            const nameField = page
                .getByLabel("Site Name")
                .or(page.getByPlaceholder("Enter site name"));
            const urlField = page
                .getByLabel("URL")
                .or(page.getByPlaceholder("Enter URL"));

            // Use a unique timestamp-based name to avoid conflicts
            const uniqueSiteName = `E2E Test Site ${Date.now()}`;
            await nameField.fill(uniqueSiteName);
            await urlField.fill("https://httpbin.org/status/200");

            // Submit form
            const submitButton = page.getByRole("button", { name: "Add Site" });
            await submitButton.click();

            // Verify modal closes
            await expect(modal).not.toBeVisible({ timeout: 10000 });

            // Verify new site appears in the list
            const newSiteCards = await page.getByTestId("site-card").all();
            expect(newSiteCards.length).toBeGreaterThan(initialCount);

            // Verify the new site name appears somewhere on the page with first() to avoid strict mode violation
            const siteName = page.getByText(uniqueSiteName).first();
            await expect(siteName).toBeVisible({ timeout: 10000 });
        } finally {
            await electronApp.close();
        }
    });

    test("should display existing site cards with monitoring controls", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Verify site cards exist
            const siteCards = page.getByTestId("site-card");
            await expect(siteCards.first()).toBeVisible({ timeout: 10000 });

            // Get all site cards
            const allSiteCards = await siteCards.all();
            expect(allSiteCards.length).toBeGreaterThan(0);

            // Check the first site card for expected controls
            const firstCard = allSiteCards[0];
            expect(firstCard).toBeDefined();

            // Check for monitoring control buttons
            const checkNowButton = firstCard!.getByRole("button", {
                name: "Check Now",
            });
            await expect(checkNowButton).toBeVisible();

            const startMonitoringButton = firstCard!.getByRole("button", {
                name: "Start Monitoring",
            });
            await expect(startMonitoringButton).toBeVisible();
        } finally {
            await electronApp.close();
        }
    });
});
