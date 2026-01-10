/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- single-file overrides for config typings */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
/**
 * Vitest configuration for Storybook component tests executed via the
 * `@storybook/addon-vitest` plugin.
 */

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import * as path from "node:path";
import {
    defineConfig,
    type ViteUserConfig,
    type ViteUserConfigExport,
} from "vitest/config";

import {
    createStorybookBaseViteConfig,
    createStorybookPlugins,
    createStorybookReactPluginOptions,
    ensureStorybookCoverageDirectory,
    storybookCoverageDirectory,
} from "./storybook/viteSharedConfig";

type StorybookTestOptions = Parameters<typeof storybookTest>[0];

const reactPluginOptions = createStorybookReactPluginOptions();

const storybookPluginOptions: StorybookTestOptions = {
    configDir: ".storybook",
    storybookScript: "npm run storybook",
    storybookUrl: "http://localhost:6006",
};

const sonarReportOutputPath = path.join(
    storybookCoverageDirectory,
    "sonar-report.xml"
);
const vitestJsonOutputPath = path.join(
    storybookCoverageDirectory,
    "test-results.json"
);

const createStorybookVitestConfig = async (): Promise<ViteUserConfig> => {
    await ensureStorybookCoverageDirectory();

    const baseViteConfig = createStorybookBaseViteConfig();

    return {
        ...baseViteConfig,
        cacheDir: "./.cache/vitest/storybook",
        plugins: createStorybookPlugins({
            additionalPlugins: [storybookTest(storybookPluginOptions)],
            reactOptions: reactPluginOptions,
        }),
        publicDir: "public",
        test: {
            browser: {
                enabled: true,
                headless: true,
                instances: [
                    {
                        browser: "chromium",
                    },
                ],
                provider: playwright(),
            },
            // Cast: Coverage V8 typings omit several runtime-supported flags used by Storybook.
            coverage: {
                enabled: false,
                exclude: [
                    "**/*.stories.*",
                    "**/*.test.*",
                    "**/*.spec.*",
                    "**/*.bench.*",
                    "**/*.d.ts",
                    "electron/**",
                    "storybook/**",
                ],
                experimentalAstAwareRemapping: false,
                include: ["src/**/*.{ts,tsx}", "shared/**/*.{ts,tsx}"],
                provider: "v8",
                reporter: [
                    "text",
                    "json-summary",
                    "lcov",
                ],
                reportsDirectory: storybookCoverageDirectory,
            } as any,
            css: {
                modules: {
                    classNameStrategy: "stable",
                },
            },
            globals: true,
            isolate: true,
            name: {
                color: "magenta",
                label: "Storybook",
            },
            outputFile: {
                json: vitestJsonOutputPath,
            },
            reporters: [
                "dot",
                "hanging-process",
                [
                    "vitest-sonar-reporter",
                    {
                        outputFile: sonarReportOutputPath,
                        silent: true,
                    },
                ],
            ],
            setupFiles: ["./storybook/vitest.setup.ts"],
            snapshotSerializers: [],
            typecheck: {
                enabled: false,
            },
        },
    };
};

/**
 * Vitest configuration tailored for running tests against Storybook stories.
 */
const storybookVitestConfig: ViteUserConfigExport = defineConfig(
    createStorybookVitestConfig
);

export default storybookVitestConfig;
