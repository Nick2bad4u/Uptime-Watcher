/**
 * @remarks
 * Transitional internal plugin for type-fest and ts-extras conventions.
 *
 * This plugin exists to decouple utility-type rules from the core
 * `uptime-watcher` plugin so they can be extracted to a standalone package
 * later with minimal repo churn.
 *
 * @file Internal uptime-watcher type-utils ESLint plugin entrypoint.
 */

import { preferTsExtrasIsDefinedFilterRule } from "./rules/prefer-ts-extras-is-defined-filter.mjs";
import { preferTsExtrasIsPresentFilterRule } from "./rules/prefer-ts-extras-is-present-filter.mjs";
import { preferTsExtrasObjectHasOwnRule } from "./rules/prefer-ts-extras-object-has-own.mjs";
import { preferTypeFestJsonValueRule } from "./rules/prefer-type-fest-json-value.mjs";
import { preferTypeFestPromisableRule } from "./rules/prefer-type-fest-promisable.mjs";
import { preferTypeFestTaggedBrandsRule } from "./rules/prefer-type-fest-tagged-brands.mjs";
import { preferTypeFestUnknownRecordRule } from "./rules/prefer-type-fest-unknown-record.mjs";
import { preferTypeFestValueOfRule } from "./rules/prefer-type-fest-value-of.mjs";

const PLUGIN_NAME = "uptime-watcher-type-utils";

/** @typedef {import("@eslint/core").RulesConfig} RulesConfig */
/** @typedef {import("eslint").Linter.Config} FlatConfig */

const ERROR_SEVERITY = /** @type {const} */ ("error");

/**
 * @type {import("eslint").ESLint.Plugin}
 */
const uptimeWatcherTypeUtilsPlugin = /** @type {any} */ ({
    meta: {
        name: PLUGIN_NAME,
        version: "0.0.0",
    },
    rules: {
        "prefer-type-fest-json-value": preferTypeFestJsonValueRule,
        "prefer-type-fest-promisable": preferTypeFestPromisableRule,
        "prefer-type-fest-tagged-brands": preferTypeFestTaggedBrandsRule,
        "prefer-type-fest-unknown-record": preferTypeFestUnknownRecordRule,
        "prefer-type-fest-value-of": preferTypeFestValueOfRule,
        "prefer-ts-extras-is-defined-filter": preferTsExtrasIsDefinedFilterRule,
        "prefer-ts-extras-is-present-filter": preferTsExtrasIsPresentFilterRule,
        "prefer-ts-extras-object-has-own": preferTsExtrasObjectHasOwnRule,
    },
});

const pluginRules = uptimeWatcherTypeUtilsPlugin.rules ?? {};

/**
 * @param {readonly string[]} ruleNames
 *
 * @returns {RulesConfig}
 */
function errorRulesFor(ruleNames) {
    /** @type {RulesConfig} */
    const rules = {};

    for (const ruleName of ruleNames) {
        rules[`${PLUGIN_NAME}/${ruleName}`] = ERROR_SEVERITY;
    }

    return rules;
}

/**
 * @type {RulesConfig}
 */
const allRules = {};

for (const ruleName of Object.keys(pluginRules)) {
    allRules[`${PLUGIN_NAME}/${ruleName}`] = ERROR_SEVERITY;
}

const recommendedRuleNames = /** @type {const} */ ([
    "prefer-type-fest-promisable",
    "prefer-type-fest-value-of",
]);

/**
 * @param {FlatConfig} config
 *
 * @returns {FlatConfig}
 */
function withTypeUtilsPlugin(config) {
    return {
        ...config,
        plugins: {
            ...config.plugins,
            [PLUGIN_NAME]: uptimeWatcherTypeUtilsPlugin,
        },
    };
}

const repoCoreConfigs = /** @type {readonly FlatConfig[]} */ ([
    withTypeUtilsPlugin({
        files: [
            "electron/**/*.{ts,tsx}",
            "shared/**/*.{ts,tsx}",
            "src/**/*.{ts,tsx}",
            "storybook/**/*.{ts,tsx}",
            "scripts/**/*.{ts,tsx,js,jsx,mts,mjs,cjs,cts}",
        ],
        ignores: [
            "electron/test/**/*",
            "src/test/**/*",
            "shared/test/**/*",
            "**/*.d.ts",
        ],
        name: "uptime-watcher-type-utils:type-fest-conventions",
        rules: errorRulesFor([
            "prefer-type-fest-json-value",
            "prefer-type-fest-promisable",
            "prefer-type-fest-tagged-brands",
            "prefer-type-fest-unknown-record",
            "prefer-type-fest-value-of",
        ]),
    }),
    withTypeUtilsPlugin({
        files: [
            "electron/services/ipc/validators/utils/recordValidation.ts",
            "electron/services/monitoring/shared/httpMonitorCore.ts",
            "electron/services/monitoring/shared/monitorConfigValueResolvers.ts",
            "electron/services/sync/SyncEngine.ts",
            "electron/services/window/WindowService.ts",
            "shared/utils/jsonSafety.ts",
            "shared/utils/objectSafety.ts",
            "shared/utils/typeGuards.ts",
            "shared/validation/monitorSchemas.ts",
            "src/components/Alerts/AppToastToast.tsx",
            "src/components/Alerts/StatusAlertToast.tsx",
            "src/hooks/site/useSiteMonitor.ts",
            "src/stores/settings/hydration.ts",
            "src/theme/ThemeManager.ts",
            "src/theme/utils/themeMerging.ts",
            "src/utils/chartUtils.ts",
        ],
        name: "uptime-watcher-type-utils:ts-extras-guard-adoption",
        rules: errorRulesFor([
            "prefer-ts-extras-is-defined-filter",
            "prefer-ts-extras-object-has-own",
        ]),
    }),
    withTypeUtilsPlugin({
        files: [
            "electron/services/cloud/providers/FilesystemCloudStorageProvider.ts",
            "electron/services/cloud/providers/cloudBackupListing.ts",
            "shared/utils/siteStatus.ts",
        ],
        name: "uptime-watcher-type-utils:ts-extras-nullish-filter-adoption",
        rules: errorRulesFor(["prefer-ts-extras-is-present-filter"]),
    }),
]);

const repoConfigs = /** @type {readonly FlatConfig[]} */ ([...repoCoreConfigs]);

const unscopedAllConfig = withTypeUtilsPlugin({
    name: "uptime-watcher-type-utils:all",
    rules: allRules,
});

const unscopedRecommendedConfig = withTypeUtilsPlugin({
    name: "uptime-watcher-type-utils:recommended",
    rules: errorRulesFor(recommendedRuleNames),
});

const unscopedDefaultConfig = withTypeUtilsPlugin({
    name: "uptime-watcher-type-utils:default",
    rules: allRules,
});

const flatAllConfig = withTypeUtilsPlugin({
    name: "uptime-watcher-type-utils:flat/all",
    rules: allRules,
});

const flatRecommendedConfig = withTypeUtilsPlugin({
    name: "uptime-watcher-type-utils:flat/recommended",
    rules: errorRulesFor(recommendedRuleNames),
});

const flatDefaultConfig = withTypeUtilsPlugin({
    name: "uptime-watcher-type-utils:flat/default",
    rules: allRules,
});

/** @type {any} */ (uptimeWatcherTypeUtilsPlugin).configs = {
    all: unscopedAllConfig,
    default: unscopedDefaultConfig,
    "flat/all": flatAllConfig,
    "flat/default": flatDefaultConfig,
    "flat/recommended": flatRecommendedConfig,
    recommended: unscopedRecommendedConfig,
    repo: repoConfigs,
    "repo/core": repoCoreConfigs,
};

export default uptimeWatcherTypeUtilsPlugin;
