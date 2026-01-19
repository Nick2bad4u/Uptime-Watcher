import type { PlaywrightTestConfig } from "@playwright/test";

import { defineConfig, devices } from "@playwright/test";

const readEnv = (key: string): string | undefined => {
    if (typeof process === "undefined") {
        return undefined;
    }

    // eslint-disable-next-line n/no-process-env -- central env accessor
    return process.env[key];
};

const coerceEnvFlag = (value: string | undefined): boolean => {
    if (!value) {
        return false;
    }

    const normalized = value.toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
};

const isCI = coerceEnvFlag(readEnv("CI"));
const headlessBrowserMode =
    isCI || coerceEnvFlag(readEnv("PLAYWRIGHT_HEADLESS"));

const parseWorkerCount = (value: string | undefined): number | undefined => {
    if (!value) {
        return undefined;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return undefined;
    }

    return parsed;
};

// UI tests launch full Electron instances; running too many in parallel can be
// flaky on developer machines (renderer exits / window closes). Default to a
// single worker locally, allow override for power users.
const uiTestWorkerCount =
    parseWorkerCount(readEnv("PLAYWRIGHT_UI_WORKERS")) ?? (isCI ? 2 : 1);

// Cap total worker processes across all projects. Electron E2E runs can be
// flaky when too many app instances are launched concurrently.
const totalWorkerCount =
    parseWorkerCount(readEnv("PLAYWRIGHT_WORKERS")) ?? (isCI ? 2 : 1);
const slowMoMsValue = readEnv("PLAYWRIGHT_SLOWMO");
const slowMoMs = slowMoMsValue ? Number.parseInt(slowMoMsValue, 10) || 0 : 0;
const chromiumDevice = devices["Desktop Chrome"];
const sharedLaunchArgs = coerceEnvFlag(readEnv("PLAYWRIGHT_DISABLE_GPU"))
    ? []
    : ["--disable-gpu"];

interface ElectronProjectOptions {
    readonly layer: "e2e" | "main" | "renderer";
    readonly name: string;
    readonly pattern: string;
    readonly timeout?: number;
}

type ProjectConfig = NonNullable<PlaywrightTestConfig["projects"]>[number];

const createElectronProject = ({
    layer,
    name,
    pattern,
    timeout = 45_000,
}: ElectronProjectOptions): ProjectConfig => ({
    fullyParallel: false,
    metadata: { layer, scope: "electron" },
    name,
    testMatch: pattern,
    timeout,
    use: {
        ...chromiumDevice,
        headless: headlessBrowserMode,
        launchOptions: {
            args: sharedLaunchArgs,
            ...(slowMoMs > 0 ? { slowMo: slowMoMs } : {}),
        },
    },
    workers: 1,
});

interface UiProjectOptions {
    readonly grep?: RegExp;
    readonly grepInvert?: RegExp;
    readonly metadata?: Record<string, unknown>;
    readonly name: string;
    readonly viewport?: { readonly height: number; readonly width: number };
    readonly workers?: number;
}

const createUiProject = ({
    grep,
    grepInvert,
    metadata,
    name,
    viewport = { height: 720, width: 1280 },
    workers = uiTestWorkerCount,
}: UiProjectOptions): ProjectConfig => ({
    fullyParallel: true,
    ...(grep ? { grep } : {}),
    ...(grepInvert ? { grepInvert } : {}),
    metadata: { scope: "ui", ...metadata },
    name,
    testMatch: "**/ui-*.playwright.test.ts",
    use: {
        ...chromiumDevice,
        headless: true,
        launchOptions: {
            args: sharedLaunchArgs,
            ...(slowMoMs > 0 ? { slowMo: slowMoMs } : {}),
        },
        viewport,
    },
    workers,
});

const electronProjects: ProjectConfig[] = [
    createElectronProject({
        layer: "main",
        name: "electron-main",
        pattern: "**/main-process.*.playwright.test.ts",
    }),
    createElectronProject({
        layer: "renderer",
        name: "electron-renderer",
        pattern: "**/renderer-process.*.playwright.test.ts",
    }),
    createElectronProject({
        layer: "e2e",
        name: "electron-e2e",
        pattern: "**/app-launch.*.playwright.test.ts",
        timeout: 60 * 1000,
    }),
];

const uiProjects: ProjectConfig[] = [
    createUiProject({
        grep: /@smoke/u,
        metadata: { tier: "smoke" },
        name: "ui-smoke",
        workers: Math.min(2, uiTestWorkerCount),
    }),
    createUiProject({
        grepInvert: /@smoke/u,
        metadata: { tier: "regression" },
        name: "ui-regression",
    }),
];

const isPlaywrightAttachmentDiagnosticsEnabled = (): boolean =>
    coerceEnvFlag(readEnv("PLAYWRIGHT_ENABLE_ATTACHMENTS"));

const mergedProjects: ProjectConfig[] = [...electronProjects, ...uiProjects];

/**
 * Complete Playwright configuration shared across Electron and UI projects.
 */
const config: PlaywrightTestConfig = defineConfig({
    expect: {
        timeout: 20 * 1000,
    },

    forbidOnly: isCI,
    globalSetup: "./playwright/fixtures/global-setup.ts",
    globalTeardown: "./playwright/fixtures/global-teardown.ts",
    outputDir: "playwright/test-results/",
    projects: mergedProjects,

    reporter: [
        ["list"],
        [
            "html",
            { open: "never", outputFolder: "playwright/reports/html-report" },
        ],
        ["json", { outputFile: "playwright/test-results/results.json" }],
        ["junit", { outputFile: "playwright/test-results/results.xml" }],
    ],

    retries: isCI ? 2 : 0,

    testDir: "./playwright/tests",

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
    testMatch: ["**/*.playwright.test.ts"],
    timeout: 20 * 1000,

    tsconfig: "./playwright/tsconfig.json",
    use: {
        acceptDownloads: true,
        actionTimeout: 20 * 1000,
        bypassCSP: true,
        channel: "chrome",
        colorScheme: "dark",
        headless: headlessBrowserMode,
        ignoreHTTPSErrors: true,
        javaScriptEnabled: true,
        locale: "en-US",
        navigationTimeout: 30 * 1000,
        screenshot: isPlaywrightAttachmentDiagnosticsEnabled()
            ? "only-on-failure"
            : "off",
        testIdAttribute: "data-testid",
        timezoneId: "America/Detroit",
        trace: isPlaywrightAttachmentDiagnosticsEnabled()
            ? "on-first-retry"
            : "off",
        video: isPlaywrightAttachmentDiagnosticsEnabled()
            ? "retain-on-failure"
            : "off",
        viewport: { height: 720, width: 1280 },
    },

    workers: totalWorkerCount,
});

export default config;
