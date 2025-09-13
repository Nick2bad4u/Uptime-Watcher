/**
 * Playwright TypeScript configuration for Electron app testing.
 *
 * This configuration file sets up Playwright to test the Electron application
 * with proper isolation from other test suites, TypeScript support, and optimal
 * settings for E2E testing.
 *
 * @remarks
 * Watch mode is NOT enabled by default in this configuration. Tests run
 * normally without file watching. Watch mode only activates when:
 *
 * - Running `npx playwright test --ui` to open UI mode
 * - Manually clicking eye icons next to tests in UI mode interface
 *
 * @see https://playwright.dev/docs/test-configuration
 * @see https://playwright.dev/docs/test-typescript
 * @see https://playwright.dev/docs/test-ui-mode#watch-mode
 * @see https://www.electronjs.org/docs/latest/tutorial/automated-testing#using-playwright
 */

import type { PlaywrightTestConfig } from "@playwright/test";

import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration with TypeScript support and comprehensive settings.
 * Includes proper test isolation, recording options, and Electron-specific
 * setup.
 *
 * @remarks
 * This configuration runs tests in normal execution mode by default (no watch
 * mode). Watch mode is only available via UI mode (`--ui` flag) and must be
 * manually enabled.
 */
const config: PlaywrightTestConfig = defineConfig({
    expect: {
        timeout: 5000, // 5 seconds for assertions
    },

    forbidOnly: Boolean(process.env["CI"]), // Prevent test.only in CI
    // Test execution configuration
    fullyParallel: false, // Disable for Electron stability

    // Global setup and teardown with TypeScript
    globalSetup: require.resolve("./playwright/fixtures/global-setup.ts"),
    globalTeardown: require.resolve("./playwright/fixtures/global-teardown.ts"),
    // Output and artifacts configuration
    outputDir: "test-results/",
    // Multiple projects for different test types
    projects: [
        {
            name: "electron-main",
            testMatch: "**/main-process.*.playwright.test.ts",
            use: {
                ...devices["Desktop Chrome"],
                // Main process specific configuration
            },
        },
        {
            name: "electron-renderer",
            testMatch: "**/renderer-process.*.playwright.test.ts",
            use: {
                ...devices["Desktop Chrome"],
                // Renderer process specific configuration
            },
        },
        {
            name: "electron-e2e",
            testMatch: "**/app-launch.*.playwright.test.ts",
            use: {
                ...devices["Desktop Chrome"],
                // E2E specific configuration
            },
        },
        {
            name: "ui-tests",
            testMatch: "**/ui-*.playwright.test.ts",
            use: {
                ...devices["Desktop Chrome"],
                // UI testing specific configuration
                viewport: { height: 1080, width: 1920 }, // Larger viewport for UI tests
            },
        },
        {
            name: "comprehensive-e2e",
            testMatch: "**/e2e-*.e2e.playwright.test.ts",
            use: {
                ...devices["Desktop Chrome"],
                headless: false, // Run in headed mode for better debugging
                // Comprehensive E2E testing configuration
                viewport: { height: 1080, width: 1920 },
            },
        },
        {
            name: "comprehensive-tests",
            testMatch: [
                "**/electron-main-process.playwright.test.ts",
                "**/component-ui-comprehensive.playwright.test.ts",
                "**/accessibility-performance.playwright.test.ts",
                "**/edge-cases-error-handling.playwright.test.ts",
            ],
            use: {
                ...devices["Desktop Chrome"],
                headless: false, // Run in headed mode for better debugging
                // Comprehensive testing configuration
                viewport: { height: 1080, width: 1920 },
            },
        },
    ],

    // Reporter configuration with multiple formats
    reporter: [
        ["list", { FORCE_COLOR: true, printSteps: true }],
        [
            "html",
            {
                open: "never", // Don't auto-open in CI
                outputFolder: "playwright-report",
            },
        ],
        [
            "json",
            {
                outputFile: "playwright-report/results.json",
            },
        ],
        // Add JUnit reporter for CI integration
        [
            "junit",
            {
                outputFile: "playwright-report/results.xml",
            },
        ],
    ],

    retries: process.env["CI"] ? 2 : 0, // Retry on CI only

    // Test directory configuration
    testDir: "./playwright/tests",
    // Explicitly ignore non-playwright test files
    testIgnore: [
        "**/*.vitest.test.ts",
        "**/*.vitest.test.js",
        "**/src/test/**",
        "**/electron/test/**",
        "**/shared/test/**",
        "**/node_modules/**",
        "**/coverage/**",
        "**/dist*/**",
    ],

    // Test file patterns - only run playwright tests
    testMatch: ["**/*.test.ts"],

    // Timeout and retry configuration
    timeout: 30 * 1000, // 30 seconds per test

    // TypeScript configuration
    /**
     * @remarks
     * Playwright tests use a dedicated tsconfig (`./playwright/tsconfig.json`)
     * to isolate test-specific TypeScript settings from the main application.
     * This prevents conflicts with app build settings and ensures Playwright
     * tests compile and run with their own strictness and module resolution.
     */
    tsconfig: "./playwright/tsconfig.json",

    // Global test configuration
    use: {
        acceptDownloads: true,
        // Action timeouts
        actionTimeout: 10 * 1000, // 10 seconds for actions

        // Disable web security for Electron testing
        bypassCSP: true,

        /**
         * @remarks
         * Electron's automated testing is most reliable with Chromium-based
         * browsers. browsers. The "chrome" channel ensures compatibility with
         * Electron's underlying Chromium engine, providing consistent results
         * and access to Electron-specific APIs during testing. See: See:
         * https://www.electronjs.org/docs/latest/tutorial/automated-testing#using-playwright
         */
        channel: "chrome",
        colorScheme: "dark",
        // Browser configuration
        headless: Boolean(process.env["CI"]), // Headless in CI, headed locally

        ignoreHTTPSErrors: true,

        javaScriptEnabled: true,

        locale: "en-US",

        navigationTimeout: 30 * 1000, // 30 seconds for navigation

        // Recording configuration - capture failures
        screenshot: "only-on-failure",

        // Custom test ID attribute for better selector reliability
        testIdAttribute: "data-testid",
        timezoneId: "America/Detroit",
        trace: "on-first-retry",
        video: "retain-on-failure",
        // Viewport configuration for consistent testing
        viewport: { height: 720, width: 1280 },
    },

    workers: process.env["CI"] ? 1 : 2, // Limit workers for Electron
});

export default config;
