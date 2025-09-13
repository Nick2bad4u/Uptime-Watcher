/**
 * Modal cleanup utilities for Playwright tests.
 *
 * These utilities ensure that modal overlays don't persist between tests and
 * interfere with button clicks and user interactions.
 */

import type { Page } from "@playwright/test";

/**
 * Comprehensive modal cleanup function.
 *
 * This function removes modal overlays that prevent interactions with
 * underlying elements. It combines DOM cleanup, state reset, and keyboard
 * events.
 */
export async function cleanupModals(page: Page): Promise<void> {
    try {
        // Step 1: Close modals via keyboard (most natural way)
        await page.keyboard.press("Escape");

        // Step 2: DOM cleanup - remove modal overlays directly
        await page.evaluate(() => {
            // Remove all elements with modal-overlay class
            const modalOverlays = document.querySelectorAll(".modal-overlay");
            modalOverlays.forEach((overlay) => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            });

            // Remove any fixed positioned overlays that might block interactions
            const fixedElements = document.querySelectorAll(
                '[style*="position: fixed"]'
            );
            fixedElements.forEach((element) => {
                const style = window.getComputedStyle(element);
                if (style.zIndex && parseInt(style.zIndex) >= 50) {
                    // This might be a modal overlay - check if it covers the viewport
                    const rect = element.getBoundingClientRect();
                    if (
                        rect.width >= window.innerWidth * 0.8 &&
                        rect.height >= window.innerHeight * 0.8
                    ) {
                        element.remove();
                    }
                }
            });
        });

        // Step 3: Reset UI store state (if accessible)
        await page.evaluate(() => {
            try {
                // Try to access the UI store and reset modal states
                // This reaches into the React state management to close modals
                const storeResetEvent = new CustomEvent("reset-ui-store");
                document.dispatchEvent(storeResetEvent);
            } catch {
                // Ignore if store is not accessible
            }
        });

        // Step 4: Click backdrop areas that might close modals
        await page.evaluate(() => {
            // Dispatch click events on potential backdrop areas
            const backdrops = document.querySelectorAll(
                '[class*="backdrop"], [class*="overlay"]'
            );
            backdrops.forEach((backdrop) => {
                backdrop.dispatchEvent(
                    new MouseEvent("click", { bubbles: true })
                );
            });
        });

        // Step 5: Try to click close buttons
        const closeButtonSelectors = [
            'button[aria-label*="close"]',
            'button[aria-label*="Close"]',
            'button:has-text("×")',
            'button:has-text("Close")',
            'button:has-text("Cancel")',
            '[data-testid="close-modal"]',
            '[data-testid="modal-close"]',
        ];

        for (const selector of closeButtonSelectors) {
            try {
                const buttons = await page.locator(selector).all();
                for (const button of buttons) {
                    if (await button.isVisible()) {
                        await button.click({ timeout: 500 });
                    }
                }
            } catch {
                // Ignore if selector doesn't match or button isn't clickable
            }
        }

        // Step 6: Final escape key press
        await page.keyboard.press("Escape");

        // Step 7: Verify cleanup worked by checking DOM
        const remainingOverlays = await page.evaluate(() => {
            return document.querySelectorAll(".modal-overlay").length;
        });

        if (remainingOverlays > 0) {
            console.warn(
                `Modal cleanup: ${remainingOverlays} modal overlays still present`
            );
        }
    } catch (error) {
        console.warn("Modal cleanup encountered an error:", error);
    }
}

/**
 * Wait for all modal overlays to be removed from the DOM.
 */
export async function waitForModalsToClose(
    page: Page,
    timeout = 5000
): Promise<void> {
    try {
        await page.waitForFunction(
            () => document.querySelectorAll(".modal-overlay").length === 0,
            { timeout }
        );
    } catch {
        // If modals don't close within timeout, try cleanup again
        await cleanupModals(page);
    }
}

/**
 * Ensure the page is in a clean state for testing interactions.
 *
 * This is the main function that should be called in beforeEach hooks.
 */
export async function ensureCleanState(page: Page): Promise<void> {
    // Clean up any existing modals
    await cleanupModals(page);

    // Wait for animations to complete by checking for app readiness
    await page.waitForFunction(() => {
        // Wait for any CSS transitions/animations to complete
        const appRoot = document.querySelector('[data-testid="app-root"]');
        return appRoot && appRoot.children.length > 0;
    });

    // Verify the page is ready for interactions
    await page.waitForLoadState("domcontentloaded");

    // Ensure app container is visible and ready
    try {
        await page.getByTestId("app-root").waitFor({ timeout: 5000 });
    } catch {
        // If app-root is not available, continue anyway
    }
}
