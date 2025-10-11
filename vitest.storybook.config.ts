/**
 * Vitest configuration for Storybook component tests executed via the
 * `@storybook/addon-vitest` plugin.
 */

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import path from "node:path";
import {
    defineConfig,
    type UserConfigExport,
    type ViteUserConfig,
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
                provider: "playwright",
            },
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
            },
            css: {
                modules: {
                    classNameStrategy: "stable",
                },
            },
            environment: "browser",
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

const storybookVitestConfig: UserConfigExport = defineConfig(
    createStorybookVitestConfig
);

export default storybookVitestConfig;
