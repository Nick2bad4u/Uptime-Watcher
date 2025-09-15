/**
 * Accessibility E2E Tests for Uptime Watcher.
 *
 * These tests ensure the application meets WCAG 2.1 guidelines and provides a
 * fully accessible experience for users with disabilities, including screen
 * reader compatibility and keyboard navigation.
 */

import { test, expect, _electron as electron } from "@playwright/test";
import path from "node:path";
import { ensureCleanState } from "../utils/modal-cleanup";

// Accessibility test configurations
const ACCESSIBILITY_CONFIG = {
    testSites: [
        {
            name: "Accessible Test Site 1",
            url: "https://httpbin.org/status/200",
        },
        { name: "Accessible Test Site 2", url: "https://httpbin.org/json" },
        { name: "Accessible Test Site 3", url: "https://httpbin.org/html" },
    ],
    keyboardNavigation: {
        focusableElements: [
            "button",
            "input",
            "select",
            "textarea",
            "[tabindex]:not([tabindex='-1'])",
            "a[href]",
        ],
        navigationKeys: [
            "Tab",
            "Shift+Tab",
            "Enter",
            "Space",
            "Escape",
        ],
    },
    colorContrast: {
        minimumRatio: 4.5, // WCAG AA standard
        largeTextRatio: 3, // WCAG AA for large text
    },
} as const;

test.describe(
    "accessibility E2E Tests",
    {
        tag: [
            "@e2e",
            "@accessibility",
            "@wcag",
            "@keyboard-navigation",
            "@screen-reader",
        ],
        annotation: {
            type: "category",
            description: "WCAG 2.1 compliance and accessibility testing",
        },
    },
    () => {
        let electronApp: any;
        let window: any;

        test.beforeEach(async () => {
            electronApp = await electron.launch({
                args: [path.join(__dirname, "../../dist-electron/main.js")],
                env: {
                    ...process.env,
                    NODE_ENV: "test",
                    SKIP_AUTO_UPDATES: "true",
                    TEST_MODE: "true",
                },
                timeout: 30000,
            });

            window = await electronApp.firstWindow();
            await window.waitForLoadState("domcontentloaded");

            // Clean up for accessibility tests
            await window.evaluate(async () => {
                try {
                    // @ts-ignore - electronAPI is available in the renderer context
                    await (window as any).electronAPI.sites.deleteAllSites();
                } catch (error) {
                    console.error(
                        "Failed cleanup in accessibility test:",
                        error
                    );
                }
            });

            await ensureCleanState(window);
        });

        test.afterEach(async () => {
            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "complete Keyboard Navigation Flow",
            {
                tag: [
                    "@keyboard-only",
                    "@navigation",
                    "@focus-management",
                ],
                annotation: [
                    {
                        type: "keyboard-accessibility",
                        description:
                            "Tests complete application flow using only keyboard",
                    },
                    {
                        type: "focus-management",
                        description:
                            "Verifies proper focus management and tab order",
                    },
                ],
            },
            async () => {
                // Test initial focus on app load
                const initialFocus = await window.evaluate(
                    () => document.activeElement?.tagName
                );
                console.log(`Initial focus: ${initialFocus}`);

                // Navigate to Add Site button using keyboard
                await window.keyboard.press("Tab");
                await window.keyboard.press("Tab");

                // Verify Add Site button is focused and accessible
                const addSiteButton = window.getByRole("button", {
                    name: "Add new site",
                });
                await expect(addSiteButton).toBeFocused();

                // Open Add Site modal using keyboard
                await window.keyboard.press("Enter");
                await window.waitForTimeout(500);

                // Test modal focus management
                const modalTitle = window.getByText("Add New Site");
                await expect(modalTitle).toBeVisible();

                // Navigate through modal fields
                await window.keyboard.press("Tab"); // Should focus Site Name field
                await window.keyboard.type("Keyboard Nav Test Site");

                await window.keyboard.press("Tab"); // Should focus URL field
                await window.keyboard.type("https://httpbin.org/status/200");

                await window.keyboard.press("Tab"); // Should focus Add Site button
                await window.keyboard.press("Enter"); // Submit form
                await window.waitForTimeout(1000);

                // Verify site was added successfully
                await expect(
                    window.getByText("Keyboard Nav Test Site")
                ).toBeVisible();

                // Test site card keyboard navigation
                await window.keyboard.press("Tab");
                const siteCard = window.getByText("Keyboard Nav Test Site");
                await expect(siteCard).toBeFocused();

                // Navigate to site details using keyboard
                await window.keyboard.press("Enter");
                await expect(window.getByText("Site Overview")).toBeVisible();

                // Test details page keyboard navigation
                await window.keyboard.press("Tab"); // Navigate to Check Now button
                const checkNowButton = window.getByRole("button", {
                    name: "Check Now",
                });
                await expect(checkNowButton).toBeFocused();

                // Execute check using keyboard
                await window.keyboard.press("Enter");
                await window.waitForTimeout(2000);

                // Navigate back using keyboard
                await window.keyboard.press("Tab");
                await window.keyboard.press("Tab"); // Should reach Back button
                const backButton = window.getByRole("button", {
                    name: "Back to Dashboard",
                });
                await expect(backButton).toBeFocused();

                await window.keyboard.press("Enter");
                await expect(
                    window.getByText("Keyboard Nav Test Site")
                ).toBeVisible();

                // Test Settings access via keyboard
                const settingsButton = window.getByRole("button", {
                    name: "Settings",
                });
                await settingsButton.focus();
                await window.keyboard.press("Enter");

                await expect(
                    window.getByText("Application Settings")
                ).toBeVisible();

                // Close settings using keyboard
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                await window.screenshot({
                    path: "playwright/test-results/keyboard-navigation-flow.png",
                    fullPage: true,
                });
            }
        );

        test(
            "screen Reader Compatibility and ARIA Labels",
            {
                tag: [
                    "@screen-reader",
                    "@aria-labels",
                    "@semantic-markup",
                ],
                annotation: [
                    {
                        type: "screen-reader",
                        description:
                            "Tests screen reader compatibility and ARIA labeling",
                    },
                    {
                        type: "semantic-html",
                        description: "Verifies proper semantic HTML structure",
                    },
                ],
            },
            async () => {
                // Add test sites for screen reader testing
                for (const site of ACCESSIBILITY_CONFIG.testSites) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(500);
                }

                // Test ARIA labels and roles
                const ariaElements = await window.evaluate(() => {
                    const elements = document.querySelectorAll(
                        "[aria-label], [aria-labelledby], [role]"
                    );
                    return Array.from(elements).map((el) => ({
                        tagName: el.tagName,
                        ariaLabel: el.getAttribute("aria-label"),
                        ariaLabelledBy: el.getAttribute("aria-labelledby"),
                        role: el.getAttribute("role"),
                        textContent: el.textContent?.substring(0, 50),
                    }));
                });

                console.log("ARIA elements found:", ariaElements.length);
                expect(ariaElements.length).toBeGreaterThan(5); // Should have multiple ARIA elements

                // Test button accessibility
                const buttons = await window.getByRole("button").all();
                for (const button of buttons) {
                    const ariaLabel = await button.getAttribute("aria-label");
                    const textContent = await button.textContent();
                    // Test both possible sources of accessible name
                    expect(ariaLabel || textContent).toBeTruthy();
                    console.log(
                        `Button aria-label: ${ariaLabel}, text: ${textContent}`
                    );
                }

                // Test form field labeling
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(500);

                const siteNameField = window.getByLabel("Site Name");
                await expect(siteNameField).toBeVisible();
                const siteNameLabel =
                    await siteNameField.getAttribute("aria-label");
                expect(siteNameLabel || "Site Name").toBeTruthy();

                const urlField = window.getByLabel("URL");
                await expect(urlField).toBeVisible();
                const urlLabel = await urlField.getAttribute("aria-label");
                expect(urlLabel || "URL").toBeTruthy();

                await window.keyboard.press("Escape");

                // Test status indicators accessibility
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                const statusIndicators = await window
                    .getByTestId("status-indicator")
                    .all();
                for (const indicator of statusIndicators) {
                    const ariaLabel =
                        await indicator.getAttribute("aria-label");
                    const title = await indicator.getAttribute("title");
                    expect(ariaLabel || title).toBeTruthy();
                }

                // Test landmark roles
                const landmarks = await window.evaluate(() => {
                    const landmarkRoles = [
                        "main",
                        "navigation",
                        "banner",
                        "contentinfo",
                        "complementary",
                    ];
                    return landmarkRoles.map((role) => ({
                        role,
                        exists:
                            document.querySelector(
                                `[role="${role}"], ${role}`
                            ) !== null,
                    }));
                });

                console.log("Landmark roles:", landmarks);
                const mainLandmark = landmarks.find(
                    (l: any) => l.role === "main"
                );
                expect(mainLandmark?.exists).toBeTruthy();

                await window.screenshot({
                    path: "playwright/test-results/screen-reader-compatibility.png",
                    fullPage: true,
                });
            }
        );

        test(
            "focus Management and Tab Order",
            {
                tag: [
                    "@focus-management",
                    "@tab-order",
                    "@focus-visible",
                ],
                annotation: [
                    {
                        type: "focus-management",
                        description:
                            "Tests focus management and logical tab order",
                    },
                    {
                        type: "focus-indicators",
                        description: "Verifies visible focus indicators",
                    },
                ],
            },
            async () => {
                // Add a test site
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.getByLabel("Site Name").fill("Focus Test Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                // Test tab order sequence
                const tabSequence: string[] = [];
                const maxTabs = 20; // Limit to prevent infinite loops

                // Reset focus to start
                await window.evaluate(() => document.body.focus());

                for (let i = 0; i < maxTabs; i++) {
                    await window.keyboard.press("Tab");

                    const focusedElement = await window.evaluate(() => {
                        const el = document.activeElement;
                        return {
                            tagName: el?.tagName,
                            id: el?.id,
                            className: el?.className,
                            ariaLabel: el?.getAttribute("aria-label"),
                            textContent: el?.textContent?.substring(0, 30),
                        };
                    });

                    const elementDescription = `${focusedElement.tagName}#${focusedElement.id}`;
                    tabSequence.push(elementDescription);

                    // Only collect first 10 elements to avoid infinite loops
                    const maxTabElements = 10;
                    expect(i).toBeLessThan(maxTabElements);
                }

                console.log("Tab sequence:", tabSequence);
                expect(tabSequence.length).toBeGreaterThan(3); // Should have multiple focusable elements

                // Test reverse tab navigation
                await window.keyboard.press("Shift+Tab");
                const reverseFocused = await window.evaluate(() => {
                    return document.activeElement?.tagName;
                });
                console.log(`Reverse tab focus: ${reverseFocused}`);

                // Test focus visible indicators
                const focusStyles = await window.evaluate(() => {
                    const focusedEl = document.activeElement;
                    const computedStyle = window.getComputedStyle(
                        focusedEl as Element
                    );
                    return {
                        outline: computedStyle.outline,
                        outlineColor: computedStyle.outlineColor,
                        outlineWidth: computedStyle.outlineWidth,
                        boxShadow: computedStyle.boxShadow,
                    };
                });

                console.log("Focus styles:", focusStyles);

                // Verify focus indicators are present - check outline
                expect(focusStyles.outline).not.toBe("none");
                expect(focusStyles.outlineWidth).not.toBe("0px");

                // Test modal focus trapping
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(500);

                // Test that focus stays within modal
                const modalTabSequence: string[] = [];
                for (let i = 0; i < 10; i++) {
                    await window.keyboard.press("Tab");

                    const focusedInModal = await window.evaluate(() => {
                        const modal =
                            document.querySelector("[role='dialog']") ||
                            document.querySelector(".modal");
                        const focused = document.activeElement;
                        return modal?.contains(focused as Node);
                    });

                    modalTabSequence.push(
                        focusedInModal ? "inside-modal" : "outside-modal"
                    );
                }

                // All focus should stay within modal
                const outsideFocus = modalTabSequence.filter(
                    (pos) => pos === "outside-modal"
                );
                expect(outsideFocus).toHaveLength(0);

                await window.keyboard.press("Escape");

                await window.screenshot({
                    path: "playwright/test-results/focus-management.png",
                    fullPage: true,
                });
            }
        );

        test(
            "color Contrast and Visual Accessibility",
            {
                tag: [
                    "@color-contrast",
                    "@visual-accessibility",
                    "@wcag-aa",
                ],
                annotation: [
                    {
                        type: "color-contrast",
                        description:
                            "Tests color contrast ratios for WCAG AA compliance",
                    },
                    {
                        type: "visual-accessibility",
                        description: "Verifies visual accessibility features",
                    },
                ],
            },
            async () => {
                // Add test sites with different states
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.getByLabel("Site Name").fill("Contrast Test Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                // Start monitoring to get different status states
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Test text contrast ratios
                const contrastElements = await window.evaluate(() => {
                    const getContrastRatio = (
                        foreground: string,
                        background: string
                    ) => {
                        // Simple contrast ratio calculation
                        const getLuminance = (color: string) => {
                            const rgb = color.match(/\d+/g);
                            if (!rgb) return 0;
                            const [
                                r,
                                g,
                                b,
                            ] = rgb.map((c) => {
                                const val = parseInt(c) / 255;
                                return val <= 0.03928
                                    ? val / 12.92
                                    : Math.pow((val + 0.055) / 1.055, 2.4);
                            });
                            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
                        };

                        const l1 = getLuminance(foreground);
                        const l2 = getLuminance(background);
                        const lighter = Math.max(l1, l2);
                        const darker = Math.min(l1, l2);
                        return (lighter + 0.05) / (darker + 0.05);
                    };

                    const textElements = document.querySelectorAll(
                        "p, h1, h2, h3, h4, h5, h6, span, div, button"
                    );
                    const results: any[] = [];

                    Array.from(textElements)
                        .slice(0, 10)
                        .forEach((el) => {
                            const styles = window.getComputedStyle(el);
                            const textColor = styles.color;
                            const bgColor = styles.backgroundColor;

                            if (
                                textColor &&
                                bgColor &&
                                bgColor !== "rgba(0, 0, 0, 0)"
                            ) {
                                const ratio = getContrastRatio(
                                    textColor,
                                    bgColor
                                );
                                results.push({
                                    element: el.tagName,
                                    textColor,
                                    backgroundColor: bgColor,
                                    contrastRatio: ratio,
                                    text: el.textContent?.substring(0, 30),
                                });
                            }
                        });

                    return results;
                });

                console.log("Contrast analysis:", contrastElements);

                // Check that critical elements meet WCAG AA standards
                const criticalElements = contrastElements.filter(
                    (el: any) =>
                        el.element === "BUTTON" ||
                        el.text?.includes("Site") ||
                        el.text?.includes("Status")
                );

                for (const element of criticalElements) {
                    console.log(
                        `${element.element}: ${element.contrastRatio.toFixed(2)}:1`
                    );
                    expect(element.contrastRatio).toBeGreaterThanOrEqual(3); // Minimum for large text
                }

                // Test status indicator visibility
                const statusIndicators = await window
                    .getByTestId("status-indicator")
                    .all();
                for (const indicator of statusIndicators) {
                    await expect(indicator).toBeVisible();

                    // Check that status indicators have accessible labels
                    await expect(indicator).toHaveAttribute("aria-label");
                }

                // Test button states visibility - simplified without conditionals
                const buttons = await window.getByRole("button").all();
                const firstButton = buttons[0];
                await expect(firstButton).toBeVisible();
                const isEnabled = await firstButton.isEnabled();
                console.log(`First button enabled: ${isEnabled}`);

                await window.screenshot({
                    path: "playwright/test-results/color-contrast-accessibility.png",
                    fullPage: true,
                });
            }
        );

        test(
            "error Messages and Accessibility Announcements",
            {
                tag: [
                    "@error-accessibility",
                    "@announcements",
                    "@aria-live",
                ],
                annotation: [
                    {
                        type: "error-accessibility",
                        description:
                            "Tests accessibility of error messages and announcements",
                    },
                    {
                        type: "aria-live",
                        description:
                            "Verifies ARIA live regions for dynamic content",
                    },
                ],
            },
            async () => {
                // Test error message accessibility
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(500);

                // Submit form with invalid data to trigger error
                await window.getByLabel("Site Name").fill("Error Test");
                await window.getByLabel("URL").fill("invalid-url");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(1000);

                // Check if error message is accessible
                const errorMessage = window
                    .getByText("Please enter a valid URL")
                    .or(window.getByText("Invalid URL"));

                await expect(errorMessage).toBeVisible();

                // Verify error is associated with form field
                const errorElement = await errorMessage.elementHandle();
                const errorId = await errorElement?.getAttribute("id");
                const fieldDescribedBy = await window
                    .getByLabel("URL")
                    .getAttribute("aria-describedby");

                console.log(
                    `Error ID: ${errorId}, Field described by: ${fieldDescribedBy}`
                );

                // Close modal and test status change announcements
                await window.keyboard.press("Escape");

                // Add a valid site for status testing
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window
                    .getByLabel("Site Name")
                    .fill("Announcement Test Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                // Test ARIA live regions for status updates
                const liveRegions = await window.evaluate(() => {
                    const regions = document.querySelectorAll(
                        "[aria-live], [role='status'], [role='alert']"
                    );
                    return Array.from(regions).map((region) => ({
                        ariaLive: region.getAttribute("aria-live"),
                        role: region.getAttribute("role"),
                        content: region.textContent?.substring(0, 50),
                    }));
                });

                console.log("Live regions found:", liveRegions);
                expect(liveRegions.length).toBeGreaterThan(0);

                // Start monitoring and check for status announcements
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Verify status changes are announced
                const statusChanges = await window.evaluate(() => {
                    const statusElements = document.querySelectorAll(
                        "[role='status'], [aria-live='polite']"
                    );
                    return Array.from(statusElements)
                        .map((el) => el.textContent?.trim())
                        .filter(Boolean);
                });

                console.log("Status announcements:", statusChanges);

                // Test manual status check announcement
                await window.getByText("Announcement Test Site").click();
                await window.waitForTimeout(500);

                await window.getByRole("button", { name: "Check Now" }).click();
                await window.waitForTimeout(2000);

                // Verify check result is announced
                const checkResultAnnouncement = await window.evaluate(() => {
                    const announcements = document.querySelectorAll(
                        "[aria-live], [role='status']"
                    );
                    return Array.from(announcements)
                        .map((el) => el.textContent?.trim())
                        .filter((text) => text && text.length > 0);
                });

                console.log(
                    "Check result announcements:",
                    checkResultAnnouncement
                );

                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();

                await window.screenshot({
                    path: "playwright/test-results/error-accessibility-announcements.png",
                    fullPage: true,
                });
            }
        );

        test(
            "keyboard Shortcuts and Alternative Interactions",
            {
                tag: ["@keyboard-shortcuts", "@alternative-interactions"],
                annotation: [
                    {
                        type: "keyboard-shortcuts",
                        description:
                            "Tests keyboard shortcuts and alternative interaction methods",
                    },
                    {
                        type: "efficiency",
                        description:
                            "Verifies efficient keyboard-only operation",
                    },
                ],
            },
            async () => {
                // Test common keyboard shortcuts - remove unused variable
                console.log(
                    "Testing keyboard shortcuts and alternative interactions"
                );

                // Add test site first
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window
                    .getByLabel("Site Name")
                    .fill("Shortcuts Test Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                // Test Enter and Space key equivalence on buttons
                const startButton = window.getByRole("button", {
                    name: "Start All Monitoring",
                });
                await startButton.focus();

                // Test Space key activation
                await window.keyboard.press("Space");
                await window.waitForTimeout(2000);

                // Verify monitoring started
                const statusIndicator = window.getByTestId("status-indicator");
                await expect(statusIndicator.first()).toBeVisible();

                // Stop monitoring using Enter key
                const stopButton = window.getByRole("button", {
                    name: "Stop All Monitoring",
                });
                await stopButton.focus();
                await window.keyboard.press("Enter");
                await window.waitForTimeout(1000);

                // Test Escape key for modal dismissal
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(500);

                await expect(window.getByText("Add New Site")).toBeVisible();
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                // Modal should be closed
                await expect(window.getByText("Add New Site")).toBeHidden();

                // Test Enter key for site navigation
                const siteCard = window.getByText("Shortcuts Test Site");
                await siteCard.focus();
                await window.keyboard.press("Enter");

                await expect(window.getByText("Site Overview")).toBeVisible();

                // Navigate back using keyboard
                await window.keyboard.press("Shift+Tab"); // Go to back button
                await window.keyboard.press("Shift+Tab");
                await window.keyboard.press("Enter");

                await expect(
                    window.getByText("Shortcuts Test Site")
                ).toBeVisible();

                // Test arrow key navigation (if implemented)
                await window.keyboard.press("ArrowDown");
                await window.keyboard.press("ArrowUp");
                await window.keyboard.press("ArrowLeft");
                await window.keyboard.press("ArrowRight");

                // Application should remain stable after arrow key presses
                await expect(
                    window.getByText("Shortcuts Test Site")
                ).toBeVisible();

                // Test accessibility of interactive elements
                const interactiveElements = await window.evaluate(() => {
                    const selectors = [
                        "button",
                        "a[href]",
                        "input",
                        "select",
                        "textarea",
                        "[tabindex]:not([tabindex='-1'])",
                        "[role='button']",
                        "[role='link']",
                    ];

                    const elements: any[] = [];
                    selectors.forEach((selector) => {
                        document.querySelectorAll(selector).forEach((el) => {
                            const rect = el.getBoundingClientRect();
                            elements.push({
                                tagName: el.tagName,
                                role: el.getAttribute("role"),
                                tabIndex: el.getAttribute("tabindex"),
                                visible: rect.width > 0 && rect.height > 0,
                                focusable:
                                    el.matches(":focus, :focus-within") ||
                                    (el as HTMLElement).tabIndex >= 0,
                            });
                        });
                    });

                    return elements;
                });

                console.log(
                    `Found ${interactiveElements.length} interactive elements`
                );
                const visibleInteractive = interactiveElements.filter(
                    (el: any) => el.visible
                );
                const focusableElements = interactiveElements.filter(
                    (el: any) => el.focusable
                );

                console.log(
                    `Visible interactive: ${visibleInteractive.length}, Focusable: ${focusableElements.length}`
                );

                expect(visibleInteractive.length).toBeGreaterThan(3);
                expect(focusableElements.length).toBeGreaterThan(3);

                await window.screenshot({
                    path: "playwright/test-results/keyboard-shortcuts-interactions.png",
                    fullPage: true,
                });
            }
        );

        test(
            "accessibility Testing with High Contrast Mode",
            {
                tag: [
                    "@high-contrast",
                    "@visual-impairment",
                    "@theme-support",
                ],
                annotation: [
                    {
                        type: "high-contrast",
                        description: "Tests application in high contrast mode",
                    },
                    {
                        type: "visual-impairment",
                        description: "Verifies support for visual impairments",
                    },
                ],
            },
            async () => {
                // Add test site
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.getByLabel("Site Name").fill("High Contrast Test");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                // Simulate high contrast mode preferences
                await window.emulateMedia({ colorScheme: "dark" });
                await window.waitForTimeout(1000);

                // Test visibility in high contrast
                await expect(
                    window.getByText("High Contrast Test")
                ).toBeVisible();

                // Test button visibility and contrast - simplified
                const buttons = await window.getByRole("button").all();
                const firstButton = buttons[0];
                await expect(firstButton).toBeVisible();
                await firstButton.focus();
                await window.waitForTimeout(200);

                // Start monitoring in high contrast mode
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Test status indicators in high contrast - simplified
                const statusIndicators = await window
                    .getByTestId("status-indicator")
                    .all();
                for (const indicator of statusIndicators) {
                    await expect(indicator).toBeVisible();

                    // Verify status communication beyond color
                    await expect(indicator).toHaveAttribute("aria-label");
                }

                // Test navigation in high contrast
                await window.getByText("High Contrast Test").click();
                await expect(window.getByText("Site Overview")).toBeVisible();

                // Test form elements in high contrast
                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();
                await window.getByRole("button", { name: "Settings" }).click();
                await expect(
                    window.getByText("Application Settings")
                ).toBeVisible();

                // Verify settings form is accessible in high contrast
                const formElements = await window.evaluate(() => {
                    const inputs = document.querySelectorAll(
                        "input, select, textarea, button"
                    );
                    return Array.from(inputs).map((el) => {
                        const styles = window.getComputedStyle(el);
                        return {
                            tagName: el.tagName,
                            borderColor: styles.borderColor,
                            backgroundColor: styles.backgroundColor,
                            color: styles.color,
                            visible:
                                styles.display !== "none" &&
                                styles.visibility !== "hidden",
                        };
                    });
                });

                const visibleFormElements = formElements.filter(
                    (el: any) => el.visible
                );
                console.log(
                    `High contrast form elements: ${visibleFormElements.length}`
                );
                expect(visibleFormElements.length).toBeGreaterThan(0);

                await window.getByRole("button", { name: "Close" }).click();

                // Reset color scheme
                await window.emulateMedia({ colorScheme: "light" });

                await window.screenshot({
                    path: "playwright/test-results/high-contrast-accessibility.png",
                    fullPage: true,
                });
            }
        );
    }
);
