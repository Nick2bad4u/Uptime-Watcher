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
        timeout: 20 * 1000, // 20 seconds for assertions
    },

    forbidOnly: Boolean(process.env["CI"]), // Prevent test.only in CI
    // Test execution configuration
    /**
     * Global setup and teardown scripts for Playwright. These scripts run
     * before all tests (setup) and after all tests (teardown). Used for
     * initializing and cleaning up test environments, such as starting/stopping
     * Electron, seeding databases, etc. See:
     * https://playwright.dev/docs/test-global-setup-teardown
     */
    globalSetup: require.resolve("./playwright/fixtures/global-setup.ts"),
    globalTeardown: require.resolve("./playwright/fixtures/global-teardown.ts"),
    // Output and artifacts configuration - organized within playwright directory
    outputDir: "playwright/test-results/",
    // Multiple projects for different test types
    projects: [
        {
            fullyParallel: false, // Electron stability
            name: "electron-main",
            testMatch: "**/main-process.*.playwright.test.ts",
            use: {
                ...devices["Desktop Chrome"],
                // Main process specific configuration
            },
        },
        {
            fullyParallel: false, // Electron stability
            name: "electron-renderer",
            testMatch: "**/renderer-process.*.playwright.test.ts",
            use: {
                ...devices["Desktop Chrome"],
                // Renderer process specific configuration
            },
        },
        {
            fullyParallel: false, // Electron stability
            name: "electron-e2e",
            testMatch: "**/app-launch.*.playwright.test.ts",
            use: {
                ...devices["Desktop Chrome"],
                // E2E specific configuration
            },
        },
        {
            fullyParallel: false, // Disable parallelism for Electron UI stability
            name: "ui-tests",
            testMatch: "**/ui-*.playwright.test.ts",
            use: {
                ...devices["Desktop Chrome"],
                // UI testing specific configuration
                viewport: { height: 1080, width: 1920 }, // Larger viewport for UI tests
            },
        },
        {
            fullyParallel: false, // Electron stability
            name: "comprehensive-e2e",
            testMatch: "**/e2e-*.e2e.playwright.test.ts",
            use: {
                ...devices["Desktop Chrome"],
                // Comprehensive E2E testing configuration
                viewport: { height: 1080, width: 1920 },
            },
        },
        {
            fullyParallel: true, // Enable parallelism for non-Electron comprehensive tests
            name: "comprehensive-tests",
            testMatch: [
                "**/electron-main-process.playwright.test.ts",
                "**/component-ui-comprehensive.playwright.test.ts",
                "**/accessibility-performance.playwright.test.ts",
                "**/edge-cases-error-handling.playwright.test.ts",
                "**/comprehensive-navigation-structure.playwright.test.ts",
                "**/advanced-accessibility-wcag.playwright.test.ts",
                "**/performance-memory-benchmarks.playwright.test.ts",
                "**/cross-browser-compatibility.playwright.test.ts",
                "**/comprehensive-integration.playwright.test.ts",
            ],
            use: {
                ...devices["Desktop Chrome"],
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
                outputFolder: "playwright/test-results/html-report",
            },
        ],
        [
            "json",
            {
                outputFile: "playwright/test-results/results.json",
            },
        ],
        // Add JUnit reporter for CI integration
        [
            "junit",
            {
                outputFile: "playwright/test-results/results.xml",
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
    timeout: 20 * 1000, // 20 seconds per test

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
        /**
         * Allow file downloads in tests. Electron apps may trigger downloads
         * for logs, exports, etc.
         */
        acceptDownloads: true,

        // Action timeouts
        actionTimeout: 20 * 1000, // 20 seconds for actions

        // Disable web security for Electron testing
        bypassCSP: true,

        /**
         * @remarks
         * Electron's automated testing is most reliable with Chromium-based
         * browsers. The "chrome" channel ensures compatibility with Electron's
         * underlying Chromium engine, providing consistent results and access
         * to Electron-specific APIs during testing.
         *
         * IMPORTANT: Electron doesn't support true "headless" mode like
         * browsers. Instead, the headless behavior is controlled at the
         * Electron app level by preventing windows from showing during tests.
         * This setting affects browser tests but NOT Electron tests.
         *
         * For Electron headless testing:
         *
         * - Set HEADLESS=true environment variable
         * - Your Electron app should check this and skip window.show()
         * - On Linux CI: use xvfb-run or xvfb-maybe for virtual display
         *
         * See: https://github.com/microsoft/playwright/issues/13288
         * https://www.electronjs.org/docs/latest/tutorial/testing-on-headless-ci
         */
        channel: "chrome",
        colorScheme: "dark",
        // Browser configuration - NOTE: This doesn't affect Electron apps
        headless: Boolean(process.env["CI"]), // For browser tests only

        ignoreHTTPSErrors: true,

        /**
         * Ensure JavaScript is enabled for all Electron renderer tests.
         * Electron apps rely on JS for UI and logic.
         */
        javaScriptEnabled: true,

        /**
         * Set locale for consistent UI rendering and i18n tests. Electron apps
         * may display locale-dependent content.
         */
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

    workers: 1, // Force single worker for Electron stability
});

export default config;
