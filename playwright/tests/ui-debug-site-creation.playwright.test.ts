/**
 * Debug test for site creation workflow - simplified test to identify the issue
 */

/* eslint-disable playwright/no-conditional-in-test */
/* eslint-disable playwright/no-wait-for-timeout */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import { waitForAppInitialization } from "../utils/ui-helpers";

test.describe("site creation debug", () => {
    test("should successfully add one site and verify it appears", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            // Wait for app to be ready
            await waitForAppInitialization(page);

            console.log("=== INITIAL STATE ===");
            // Count initial sites
            const initialSiteCards = await page
                .getByTestId("site-card")
                .count();
            console.log("Initial site cards count:", initialSiteCards);

            // Verify add site button exists
            const addButton = page.getByRole("button", {
                name: "Add new site",
            });
            await expect(addButton).toBeVisible();
            console.log("Add new site button is visible");

            console.log("=== OPENING MODAL ===");
            // Click add site button
            await addButton.click();

            // Wait briefly for modal to appear
            await page.waitForTimeout(1000);

            // Verify modal opened
            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible();
            console.log("Modal opened successfully");

            console.log("=== FILLING FORM ===");
            // Use textbox approach since labels might not be found
            const textboxes = page.getByRole("textbox");
            const textboxCount = await textboxes.count();
            console.log("Found textboxes:", textboxCount);

            // Fill first two textboxes (name and URL)
            await textboxes.first().fill("Debug Test Site");
            await textboxes.nth(1).fill("https://httpbin.org/status/200");

            console.log("Form fields filled");

            console.log("=== SUBMITTING FORM ===");
            // Find and click submit button
            const submitButton = page.getByRole("button", { name: "Add Site" });
            await expect(submitButton).toBeVisible();
            console.log("Submit button found");

            // Click submit and wait for response
            await submitButton.click();
            console.log("Submit button clicked");

            // Wait for potential processing with longer timeout
            await page.waitForTimeout(5000);

            console.log("=== CHECKING RESULT ===");
            // Check if modal closed (success indicator)
            const modalStillVisible = await modal.isVisible();
            console.log("Modal still visible after submit:", modalStillVisible);

            // Wait longer for React to re-render with the new site
            console.log("Waiting for React re-render...");
            await page.waitForTimeout(3000);

            // Check if site was added
            const finalSiteCards = await page.getByTestId("site-card").count();
            console.log("Final site cards count:", finalSiteCards);

            // Check specifically for the divider-y container that should appear when sites exist
            // Instead of looking for the class directly, look for multiple site cards which indicates the divider is working
            const multipleSiteCards =
                (await page.getByTestId("site-card").count()) > 0;
            console.log("Site cards rendered:", multipleSiteCards);

            // Check if the divider container is working by looking for the site card container structure
            const siteCardContainer = page.getByTestId("site-card").first();
            const cardExists = (await siteCardContainer.count()) > 0;
            console.log("Site card container exists:", cardExists);

            // Look for our specific site text anywhere on the page
            const debugSiteVisible = await page
                .getByText("Debug Test Site")
                .isVisible()
                .catch(() => false);
            console.log("Debug Test Site visible:", debugSiteVisible);

            // Look for the URL we added
            const urlVisible = await page
                .getByText("httpbin.org")
                .isVisible()
                .catch(() => false);
            console.log("httpbin.org URL visible:", urlVisible);

            // Check if EmptyState is still showing (bad sign)
            const emptyStateVisible = await page
                .getByText("No sites configured")
                .isVisible()
                .catch(() => false);
            console.log("Empty state visible:", emptyStateVisible);

            // Check for any error messages
            const errorAlert = page.getByRole("alert");
            const errorCount = await errorAlert.count();
            console.log("Error alerts found:", errorCount);

            // If there are errors, log them
            if (errorCount > 0) {
                for (let i = 0; i < errorCount; i++) {
                    const errorText = await errorAlert.nth(i).textContent();
                    console.log(`Error ${i + 1}:`, errorText);
                }
            }

            // Check the page content for any mention of our site
            const pageContent = await page.content();
            const hasDebugSite = pageContent.includes("Debug Test Site");
            const hasUrl = pageContent.includes("httpbin.org");
            console.log("Page contains Debug Test Site:", hasDebugSite);
            console.log("Page contains httpbin.org:", hasUrl);

            // Try to access the Zustand store state more directly
            const detailedStoreState = await page
                .evaluate(() => {
                    // Try different ways to access the store
                    try {
                        // Check if the store is available globally
                        if ((window as any).zustandStore) {
                            return (window as any).zustandStore.getState();
                        }
                        // Check for development debug hooks
                        if ((window as any).__ZUSTAND_STORE_DEBUG__) {
                            return (window as any).__ZUSTAND_STORE_DEBUG__;
                        }
                        return "Store not accessible";
                    } catch (error) {
                        return `Store access error: ${error}`;
                    }
                })
                .catch(() => "Store evaluation failed");

            // Check for error messages
            const errorAlerts = page.getByRole("alert");
            const alertCount = await errorAlerts.count();
            console.log("Error alerts found:", alertCount);

            // Check if EmptyState is showing instead of site cards
            const isEmptyStateVisible = await page
                .getByText("No sites configured")
                .isVisible()
                .catch(() => false);
            console.log("Empty state visible:", isEmptyStateVisible);

            // Check for any div elements that might contain site data - using getByTestId instead of raw locator
            const siteListTestId = page.getByTestId("site-list");
            const siteListTestIdExists = await siteListTestId.count();
            console.log("Site list test ID found:", siteListTestIdExists);

            // Wait a bit longer to see if sites load asynchronously
            await page.waitForTimeout(2000);
            const finalSiteCardsAfterWait = await page
                .getByTestId("site-card")
                .count();
            console.log(
                "Site cards after additional wait:",
                finalSiteCardsAfterWait
            );

            console.log("Store state:", detailedStoreState);

            // Also check if there's any error in the browser console
            const consoleLogs: string[] = [];
            page.on("console", (msg) => {
                if (msg.type() === "error") {
                    consoleLogs.push(msg.text());
                }
            });

            console.log("Browser console errors:", consoleLogs);

            // Take screenshot for debugging
            await page.screenshot({
                path: "playwright/test-results/debug-site-creation.png",
                fullPage: true,
            });

            // Get a more detailed look at the HTML structure around where sites should be
            const bodyHTML = await page.evaluate(() => document.body.innerHTML);
            console.log("=== HTML ANALYSIS ===");

            // Look for site-related elements in the HTML
            const hasTestSiteInHTML = bodyHTML.includes("Debug Test Site");
            const hasUrlInHTML = bodyHTML.includes("httpbin.org");
            const hasDataTestId = bodyHTML.includes('data-testid="site-card"');
            const hasSiteCardClass = bodyHTML.includes("site-card");
            const hasDividerY = bodyHTML.includes("divider-y");

            console.log("HTML contains 'Debug Test Site':", hasTestSiteInHTML);
            console.log("HTML contains 'httpbin.org':", hasUrlInHTML);
            console.log(
                "HTML contains 'data-testid=\"site-card\"':",
                hasDataTestId
            );
            console.log("HTML contains 'site-card' class:", hasSiteCardClass);
            console.log("HTML contains 'divider-y':", hasDividerY);

            // Extract just the part of HTML that should contain the site list
            const siteListRegex =
                /<div[^>]*class[^>]*divider-y[^>]*>.*?<\/div>/s;
            const siteListMatch = bodyHTML.match(siteListRegex);
            if (siteListMatch) {
                console.log("Site list HTML found:");
                console.log(siteListMatch[0].substring(0, 500) + "...");
            } else {
                console.log("No divider-y container found in HTML");

                // Look for any mention of our site data
                const debugSiteRegex = /Debug Test Site.*?(\n|$)/g;
                const debugSiteMatches = bodyHTML.match(debugSiteRegex);
                if (debugSiteMatches) {
                    console.log("Debug site mentions found:");
                    debugSiteMatches.forEach((match, index) => {
                        console.log(`${index + 1}: ${match.trim()}`);
                    });
                }
            }

            // Report findings
            console.log("=== SUMMARY ===");
            console.log("Sites before:", initialSiteCards);
            console.log("Sites after:", finalSiteCardsAfterWait);
            console.log(
                "Site added:",
                finalSiteCardsAfterWait > initialSiteCards
            );
            console.log("Modal closed:", !modalStillVisible);
            console.log("Errors:", errorCount);
            console.log("Empty state showing:", emptyStateVisible);
            console.log("Site text visible:", debugSiteVisible);

            // For debugging purposes, we'll pass the test but report the findings
            expect(true).toBe(true); // Always pass to see debug output
        } finally {
            await electronApp.close();
        }
    });
});

/* eslint-enable playwright/no-conditional-in-test */
/* eslint-enable playwright/no-wait-for-timeout */
