/**
 * Complete end-to-end user workflow tests for Uptime Watcher.
 *
 * Tests the entire user journey from app launch to advanced monitoring
 * scenarios. These tests simulate real user interactions and verify the
 * complete application functionality works as intended.
 */

import { test, expect, _electron as electron } from "@playwright/test";
import path from "node:path";

// Test data for comprehensive workflows
const TEST_SITES = {
    primary: {
        name: "Test Website Primary",
        url: "https://httpbin.org/status/200",
        monitorType: "http",
        checkInterval: 300000, // 5 minutes
        timeout: 30000, // 30 seconds
    },
    secondary: {
        name: "Test Website Secondary",
        url: "https://httpbin.org/delay/2",
        monitorType: "http",
        checkInterval: 600000, // 10 minutes
        timeout: 15000, // 15 seconds
    },
    failure: {
        name: "Test Failure Site",
        url: "https://httpbin.org/status/500",
        monitorType: "http",
        checkInterval: 120000, // 2 minutes
        timeout: 10000, // 10 seconds
    },
    custom: {
        name: "Custom Monitor Test",
        url: "https://httpbin.org/json",
        monitorType: "http",
        checkInterval: 180000, // 3 minutes
        timeout: 25000, // 25 seconds
    },
} as const;

test.describe(
    "complete User Workflows - E2E",
    {
        tag: [
            "@e2e",
            "@workflow",
            "@comprehensive",
        ],
        annotation: {
            type: "category",
            description: "End-to-end tests covering complete user workflows",
        },
    },
    () => {
        let electronApp: any;
        let window: any;

        // Helper function to verify multiple elements visibility
        const verifyElementsVisible = async (selectors: string[]) => {
            for (const selector of selectors) {
                await expect(window.getByText(selector)).toBeVisible();
            }
        };

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
            await window.waitForTimeout(2000); // Wait for React initialization
        });

        test.afterEach(async () => {
            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "complete Site Management Workflow",
            {
                tag: ["@critical", "@site-management"],
                annotation: [
                    {
                        type: "workflow",
                        description:
                            "Add, configure, monitor, and delete sites",
                    },
                    {
                        type: "coverage",
                        description: "Tests site CRUD operations",
                    },
                ],
            },
            async () => {
                // Verify initial empty state
                await expect(
                    window.getByText("No sites are being monitored")
                ).toBeVisible();

                // Test adding first site
                await window.getByRole("button", { name: "Add Site" }).click();
                await expect(window.getByText("Add New Site")).toBeVisible();

                // Fill out site form with comprehensive data
                await window
                    .getByLabel("Site Name")
                    .fill(TEST_SITES.primary.name);
                await window.getByLabel("URL").fill(TEST_SITES.primary.url);
                await window
                    .getByLabel("Monitor Type")
                    .selectOption(TEST_SITES.primary.monitorType);
                await window
                    .getByLabel("Check Interval")
                    .selectOption(TEST_SITES.primary.checkInterval.toString());
                await window
                    .getByLabel("Timeout")
                    .fill(TEST_SITES.primary.timeout.toString());

                // Save the site
                await window.getByRole("button", { name: "Add Site" }).click();
                await expect(window.getByText("Add New Site")).toBeHidden();

                // Verify site appears in dashboard
                await expect(
                    window.getByText(TEST_SITES.primary.name)
                ).toBeVisible();
                await expect(
                    window.getByText(TEST_SITES.primary.url)
                ).toBeVisible();

                // Test starting monitoring
                await window
                    .getByRole("button", { name: "Start Monitoring" })
                    .first()
                    .click();
                await expect(window.getByText("Running")).toBeVisible();

                // Add second site for multi-site testing
                await window.getByRole("button", { name: "Add Site" }).click();
                await window
                    .getByLabel("Site Name")
                    .fill(TEST_SITES.secondary.name);
                await window.getByLabel("URL").fill(TEST_SITES.secondary.url);
                await window
                    .getByLabel("Monitor Type")
                    .selectOption(TEST_SITES.secondary.monitorType);
                await window.getByRole("button", { name: "Add Site" }).click();

                // Verify both sites exist
                await verifyElementsVisible([
                    TEST_SITES.primary.name,
                    TEST_SITES.secondary.name,
                ]);

                // Test site details navigation
                await window.getByText(TEST_SITES.primary.name).click();
                await verifyElementsVisible([
                    "Site Overview",
                    "Monitor Overview",
                    "Analytics",
                ]);

                // Test back to dashboard
                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();
                await expect(
                    window.getByText(TEST_SITES.primary.name)
                ).toBeVisible();

                // Test site deletion
                await window.getByText(TEST_SITES.secondary.name).click();
                await window.getByRole("button", { name: "Settings" }).click();
                await window
                    .getByRole("button", { name: "Delete Site" })
                    .click();
                await window.getByRole("button", { name: "Delete" }).click(); // Confirm deletion

                // Verify site is removed
                await expect(
                    window.getByText(TEST_SITES.secondary.name)
                ).toBeHidden();
                await expect(
                    window.getByText(TEST_SITES.primary.name)
                ).toBeVisible();
            }
        );

        test(
            "monitoring State Management Workflow",
            {
                tag: ["@critical", "@monitoring"],
                annotation: [
                    {
                        type: "workflow",
                        description: "Start, stop, pause monitoring operations",
                    },
                    {
                        type: "state",
                        description: "Tests monitoring state transitions",
                    },
                ],
            },
            async () => {
                // Add test site
                await window.getByRole("button", { name: "Add Site" }).click();
                await window
                    .getByLabel("Site Name")
                    .fill(TEST_SITES.primary.name);
                await window.getByLabel("URL").fill(TEST_SITES.primary.url);
                await window.getByRole("button", { name: "Add Site" }).click();

                // Test start monitoring
                await window
                    .getByRole("button", { name: "Start Monitoring" })
                    .first()
                    .click();
                await expect(window.getByText("Running")).toBeVisible();
                await expect(
                    window.getByRole("button", { name: "Stop Monitoring" })
                ).toBeVisible();

                // Test stop monitoring
                await window
                    .getByRole("button", { name: "Stop Monitoring" })
                    .first()
                    .click();
                await expect(window.getByText("Stopped")).toBeVisible();
                await expect(
                    window.getByRole("button", { name: "Start Monitoring" })
                ).toBeVisible();

                // Test immediate check functionality
                await window
                    .getByRole("button", { name: "Check Now" })
                    .first()
                    .click();
                await expect(window.getByText("Checking...")).toBeVisible();

                // Navigate to site details for advanced monitoring tests
                await window.getByText(TEST_SITES.primary.name).click();

                // Test site-level monitoring controls
                await expect(
                    window.getByRole("button", { name: "Start" })
                ).toBeVisible();
                await window.getByRole("button", { name: "Start" }).click();
                await expect(
                    window.getByRole("button", { name: "Stop" })
                ).toBeVisible();

                // Test monitor type switching
                const monitorSelect = window.getByLabel("Monitor:");
                await expect(monitorSelect).toBeVisible({ timeout: 5000 });
                await monitorSelect.selectOption("HTTP");
                await expect(window.getByText("HTTP")).toBeVisible();

                // Test navigation between monitoring tabs
                await window
                    .getByRole("button", { name: "Monitor Overview" })
                    .click();
                await window.getByRole("button", { name: "Analytics" }).click();
                await window.getByRole("button", { name: "History" }).click();
                await window.getByRole("button", { name: "Settings" }).click();
            }
        );

        test(
            "settings and Configuration Workflow",
            {
                tag: ["@settings", "@configuration"],
                annotation: [
                    {
                        type: "workflow",
                        description: "Comprehensive settings management",
                    },
                    {
                        type: "configuration",
                        description: "Tests all configuration options",
                    },
                ],
            },
            async () => {
                // Test global settings access
                await window.getByRole("button", { name: "Settings" }).click();
                await expect(
                    window.getByText("Application Settings")
                ).toBeVisible();

                // Test theme toggle
                const themeButton = window.getByRole("button", {
                    name: "Toggle theme",
                });
                await themeButton.click();
                await themeButton.click(); // Toggle back

                // Test history limit configuration
                await window
                    .getByLabel("Maximum number of history")
                    .selectOption("50");
                await expect(
                    window.getByLabel("Maximum number of history")
                ).toHaveValue("50");
                await window
                    .getByLabel("Maximum number of history")
                    .selectOption("25");

                // Test sync functionality
                await window
                    .getByRole("button", { name: "🔄 Sync Data" })
                    .click();

                // Close settings
                await window
                    .getByRole("button", { name: "Close", exact: true })
                    .click();
                await expect(
                    window.getByText("Application Settings")
                ).toBeHidden();

                // Test site-specific settings
                await window.getByRole("button", { name: "Add Site" }).click();
                await window
                    .getByLabel("Site Name")
                    .fill(TEST_SITES.custom.name);
                await window.getByLabel("URL").fill(TEST_SITES.custom.url);
                await window.getByRole("button", { name: "Add Site" }).click();

                // Navigate to site settings
                await window.getByText(TEST_SITES.custom.name).click();
                await window.getByRole("button", { name: "Settings" }).click();

                // Test site configuration options
                const checkIntervalField = window.getByLabel("Check Interval");
                await expect(checkIntervalField).toBeVisible({ timeout: 5000 });
                await checkIntervalField.selectOption("300000");

                const timeoutField = window.getByLabel("Timeout");
                await expect(timeoutField).toBeVisible({ timeout: 5000 });
                await timeoutField.fill("20000");

                // Test save settings
                const saveButton = window.getByRole("button", {
                    name: "Save Changes",
                });
                await expect(saveButton).toBeVisible({ timeout: 5000 });
                await saveButton.click();
            }
        );

        test(
            "error Handling and Recovery Workflow",
            {
                tag: ["@error-handling", "@recovery"],
                annotation: [
                    {
                        type: "workflow",
                        description: "Error scenarios and recovery mechanisms",
                    },
                    {
                        type: "reliability",
                        description: "Tests application resilience",
                    },
                ],
            },
            async () => {
                // Test invalid URL handling
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.getByLabel("Site Name").fill("Invalid Site");
                await window.getByLabel("URL").fill("not-a-valid-url");
                await window.getByRole("button", { name: "Add Site" }).click();

                // Should show validation error
                await expect(
                    window.getByText("Please enter a valid URL")
                ).toBeVisible();

                // Fix and retry
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await expect(window.getByText("Invalid Site")).toBeVisible();

                // Test monitoring a failing site
                await window.getByRole("button", { name: "Add Site" }).click();
                await window
                    .getByLabel("Site Name")
                    .fill(TEST_SITES.failure.name);
                await window.getByLabel("URL").fill(TEST_SITES.failure.url);
                await window.getByRole("button", { name: "Add Site" }).click();

                // Start monitoring the failing site
                const failingSiteCard = window
                    .getByTestId("site-card")
                    .filter({ hasText: TEST_SITES.failure.name });
                await failingSiteCard
                    .getByRole("button", { name: "Start Monitoring" })
                    .click();

                // Wait for failure detection
                await window.waitForTimeout(5000);

                // Check for error indicators
                await expect(failingSiteCard.getByText("Error")).toBeVisible();

                // Test error recovery by stopping and restarting
                await failingSiteCard
                    .getByRole("button", { name: "Stop Monitoring" })
                    .click();
                await expect(
                    failingSiteCard.getByText("Stopped")
                ).toBeVisible();

                // Test navigation under error conditions
                await window.getByText(TEST_SITES.failure.name).click();
                await expect(window.getByText("Site Overview")).toBeVisible();

                // Navigate back to dashboard
                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();
            }
        );

        test(
            "data Persistence and Sync Workflow",
            {
                tag: ["@persistence", "@sync"],
                annotation: [
                    {
                        type: "workflow",
                        description: "Data persistence and synchronization",
                    },
                    {
                        type: "data",
                        description: "Tests data consistency and storage",
                    },
                ],
            },
            async () => {
                // Add multiple sites to test persistence
                const sitesToAdd = [TEST_SITES.primary, TEST_SITES.secondary];

                for (const site of sitesToAdd) {
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                }

                // Start monitoring one site
                await window
                    .getByRole("button", { name: "Start Monitoring" })
                    .first()
                    .click();
                await window.waitForTimeout(2000);

                // Test data sync functionality
                await window.getByRole("button", { name: "Settings" }).click();
                await window
                    .getByRole("button", { name: "🔄 Sync Data" })
                    .click();
                await window.waitForTimeout(1000);
                await window
                    .getByRole("button", { name: "Close", exact: true })
                    .click();

                // Verify data persistence by checking site count
                const siteCount = window.getByTestId("site-card");
                await expect(siteCount).toHaveCount(2);

                // Test historical data accumulation
                await window.getByText(TEST_SITES.primary.name).click();
                await window.getByRole("button", { name: "History" }).click();

                // Check for history elements (even if empty initially)
                await expect(window.getByText("History")).toBeVisible();

                // Test analytics data
                await window.getByRole("button", { name: "Analytics" }).click();
                await expect(window.getByText("Analytics")).toBeVisible();
            }
        );

        test(
            "multi-Monitor Management Workflow",
            {
                tag: ["@multi-monitor", "@advanced"],
                annotation: [
                    {
                        type: "workflow",
                        description: "Managing multiple monitors per site",
                    },
                    {
                        type: "advanced",
                        description: "Tests complex monitoring scenarios",
                    },
                ],
            },
            async () => {
                // Add a site for multi-monitor testing
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.getByLabel("Site Name").fill("Multi-Monitor Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();

                // Navigate to site details
                await window.getByText("Multi-Monitor Site").click();

                // Test monitor type selection if available
                const monitorSelect = window.getByLabel("Monitor:");
                await expect(monitorSelect).toBeVisible({ timeout: 5000 });
                await monitorSelect.selectOption("HTTP");
                await expect(monitorSelect).toHaveValue("HTTP");

                // Test starting site-level monitoring
                await window.getByRole("button", { name: "Start" }).click();
                await expect(
                    window.getByRole("button", { name: "Stop" })
                ).toBeVisible();

                // Test individual monitor controls
                const startMonitoringButton = window.getByRole("button", {
                    name: "Start Monitoring",
                });
                await expect(startMonitoringButton).toBeVisible({
                    timeout: 5000,
                });
                await startMonitoringButton.click();

                // Test monitor configuration in settings
                await window.getByRole("button", { name: "Settings" }).click();

                // Configure monitor settings if available
                const checkIntervalSelect = window.getByLabel("Check Interval");
                await expect(checkIntervalSelect).toBeVisible({
                    timeout: 5000,
                });
                await checkIntervalSelect.selectOption("300000");

                // Test monitor overview tab
                await window
                    .getByRole("button", { name: "Monitor Overview" })
                    .click();
                await expect(
                    window.getByText("Monitor Overview")
                ).toBeVisible();

                // Verify monitor status display
                await expect(
                    window.getByTestId("status-indicator")
                ).toBeVisible();
            }
        );

        test(
            "responsive UI and Accessibility Workflow",
            {
                tag: ["@responsive", "@accessibility"],
                annotation: [
                    {
                        type: "workflow",
                        description: "UI responsiveness and accessibility",
                    },
                    {
                        type: "a11y",
                        description: "Tests accessibility compliance",
                    },
                ],
            },
            async () => {
                // Test keyboard navigation
                await window.keyboard.press("Tab");
                await window.keyboard.press("Tab");
                await window.keyboard.press("Enter"); // Should activate focused element

                // Test with smaller viewport
                await window.setViewportSize({ width: 800, height: 600 });
                await window.waitForTimeout(500);

                // Verify UI still functional at smaller size
                await expect(
                    window.getByRole("button", { name: "Add Site" })
                ).toBeVisible();

                // Test with larger viewport
                await window.setViewportSize({ width: 1920, height: 1080 });
                await window.waitForTimeout(500);

                // Add a site to test responsive elements
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.getByLabel("Site Name").fill("Responsive Test");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();

                // Test site card responsiveness
                await expect(window.getByText("Responsive Test")).toBeVisible();

                // Test accessibility attributes
                const addButton = window.getByRole("button", {
                    name: "Add Site",
                });
                await expect(addButton).toHaveAttribute("type", "button");

                // Test ARIA labels and roles
                const siteCards = window.getByTestId("site-card");
                await expect(siteCards).toHaveCount(1);
                await expect(siteCards.first()).toHaveAttribute("aria-label");

                // Test focus management
                await addButton.focus();
                await expect(addButton).toBeFocused();

                // Test high contrast mode compatibility
                await window
                    .getByRole("button", { name: "Toggle theme" })
                    .click();
                await window.waitForTimeout(500);
                await expect(window.getByText("Responsive Test")).toBeVisible();
            }
        );
    }
);
