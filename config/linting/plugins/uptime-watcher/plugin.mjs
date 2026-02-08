/**
 * @remarks
 * This module is intentionally colocated with the rule implementations so the
 * plugin can be extracted/published later with minimal repo-specific glue.
 *
 * @file Internal uptime-watcher ESLint plugin entrypoint.
 */

import { electronBrowserwindowRequirePreloadRule } from "./rules/electron-browserwindow-require-preload.mjs";
import { electronBrowserwindowRequireSecureWebpreferencesRule } from "./rules/electron-browserwindow-require-secure-webpreferences.mjs";
import { electronCloudProvidersDriftGuardsRule } from "./rules/electron-cloud-providers-drift-guards.mjs";
import { electronDialogRequireAutomationBypassRule } from "./rules/electron-dialog-require-automation-bypass.mjs";
import { electronIpcHandlerRequireValidatorRule } from "./rules/electron-ipc-handler-require-validator.mjs";
import { electronNoAdHocErrorCodeSuffixRule } from "./rules/electron-no-ad-hoc-error-code-suffix.mjs";
import { electronNoAppGetpathAtModuleScopeRule } from "./rules/electron-no-app-getpath-at-module-scope.mjs";
import { electronNoBrowserwindowOutsideWindowserviceRule } from "./rules/electron-no-browserwindow-outside-windowservice.mjs";
import { electronNoConsoleRule } from "./rules/electron-no-console.mjs";
import { electronNoDialogSyncRule } from "./rules/electron-no-dialog-sync.mjs";
import { electronNoDirectIpcHandleRule } from "./rules/electron-no-direct-ipc-handle.mjs";
import { electronNoDirectIpcHandlerWrappersRule } from "./rules/electron-no-direct-ipc-handler-wrappers.mjs";
import { electronNoDirectIpcMainImportRule } from "./rules/electron-no-direct-ipc-main-import.mjs";
import { electronNoImportMetaDirnameRule } from "./rules/electron-no-import-meta-dirname.mjs";
import { electronNoInlineIpcChannelLiteralRule } from "./rules/electron-no-inline-ipc-channel-literal.mjs";
import { electronNoInlineIpcChannelTypeArgumentRule } from "./rules/electron-no-inline-ipc-channel-type-argument.mjs";
import { electronNoLocalStringSafetyHelpersRule } from "./rules/electron-no-local-string-safety-helpers.mjs";
import { electronNoRendererImportRule } from "./rules/electron-no-renderer-import.mjs";
import { electronNoShellOpenExternalRule } from "./rules/electron-no-shell-open-external.mjs";
import { electronNoWebcontentsExecuteJavascriptRule } from "./rules/electron-no-webcontents-execute-javascript.mjs";
import { electronOpenDevtoolsRequireDevOnlyRule } from "./rules/electron-open-devtools-require-dev-only.mjs";
import { electronPreferReadProcessEnvRule as electronPreferReadProcessEnvironmentRule } from "./rules/electron-prefer-read-process-env.mjs";
import { electronPreloadNoDirectIpcRendererUsageRule } from "./rules/electron-preload-no-direct-ipc-renderer-usage.mjs";
import { electronPreloadNoInlineIpcChannelConstantRule } from "./rules/electron-preload-no-inline-ipc-channel-constant.mjs";
import { electronSyncNoLocalAsciiDigitsRule } from "./rules/electron-sync-no-local-ascii-digits.mjs";
import { loggerNoErrorInContextRule } from "./rules/logger-no-error-in-context.mjs";
import { monitorFallbackConsistencyRule } from "./rules/monitor-fallback-consistency.mjs";
import { noCallIdentifiersRule } from "./rules/no-call-identifiers.mjs";
import { noDeprecatedExportsRule } from "./rules/no-deprecated-exports.mjs";
import { noInlineIpcChannelTypeLiteralsRule } from "./rules/no-inline-ipc-channel-type-literals.mjs";
import { noLocalErrorNormalizersRule } from "./rules/no-local-error-normalizers.mjs";
import { noLocalIdentifiersRule } from "./rules/no-local-identifiers.mjs";
import { noLocalRecordGuardsRule } from "./rules/no-local-record-guards.mjs";
import { noOneDriveRule } from "./rules/no-onedrive.mjs";
import { noRedeclareSharedContractInterfacesRule } from "./rules/no-redeclare-shared-contract-interfaces.mjs";
import { noRegexpVFlagRule } from "./rules/no-regexp-v-flag.mjs";
import { preferAppAliasRule } from "./rules/prefer-app-alias.mjs";
import { preferSharedAliasRule } from "./rules/prefer-shared-alias.mjs";
import { preferTryGetErrorCodeRule } from "./rules/prefer-try-get-error-code.mjs";
import { preloadNoLocalIsPlainObjectRule } from "./rules/preload-no-local-is-plain-object.mjs";
import { rendererNoBrowserDialogsRule } from "./rules/renderer-no-browser-dialogs.mjs";
import { rendererNoDirectBridgeReadinessRule } from "./rules/renderer-no-direct-bridge-readiness.mjs";
import { rendererNoDirectElectronLogRule } from "./rules/renderer-no-direct-electron-log.mjs";
import { rendererNoDirectNetworkingRule } from "./rules/renderer-no-direct-networking.mjs";
import { rendererNoDirectPreloadBridgeRule } from "./rules/renderer-no-direct-preload-bridge.mjs";
import { rendererNoElectronImportRule } from "./rules/renderer-no-electron-import.mjs";
import { rendererNoImportInternalServiceUtilsRule as rendererNoImportInternalServiceUtilitiesRule } from "./rules/renderer-no-import-internal-service-utils.mjs";
import { rendererNoIpcRendererUsageRule } from "./rules/renderer-no-ipc-renderer-usage.mjs";
import { rendererNoPreloadBridgeWritesRule } from "./rules/renderer-no-preload-bridge-writes.mjs";
import { rendererNoProcessEnvRule } from "./rules/renderer-no-process-env.mjs";
import { rendererNoWindowOpenRule } from "./rules/renderer-no-window-open.mjs";
import { requireEnsureErrorInCatchRule } from "./rules/require-ensure-error-in-catch.mjs";
import { requireErrorCauseInCatchRule } from "./rules/require-error-cause-in-catch.mjs";
import { sharedNoOutsideImportsRule } from "./rules/shared-no-outside-imports.mjs";
import { sharedTypesNoLocalIsPlainObjectRule } from "./rules/shared-types-no-local-is-plain-object.mjs";
import { storeActionsRequireFinallyResetRule } from "./rules/store-actions-require-finally-reset.mjs";
import { testNoMockReturnValueConstructorsRule } from "./rules/test-no-mock-return-value-constructors.mjs";
import { tsdocNoConsoleExampleRule } from "./rules/tsdoc-no-console-example.mjs";

const DEFAULT_RULE_DOCS_URL_BASE =
    "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules";

/**
 * Internal plugin object.
 *
 * @remarks
 * The plugin implementation is authored in JavaScript (ESM). In strict CheckJS
 * mode, TypeScript will eagerly validate object-literal shapes against the
 * `ESLint.Plugin` interface and `RuleModule` types (which rely on TS-only
 * literal inference). We intentionally type-assert here to keep the
 * implementation ergonomic while still giving consumers a correct plugin type.
 *
 * @type {import("eslint").ESLint.Plugin}
 */
const uptimeWatcherPlugin = /** @type {any} */ ({
    meta: {
        name: "uptime-watcher",
        version: "0.0.0",
    },
    rules: {
        "electron-browserwindow-require-secure-webpreferences":
            electronBrowserwindowRequireSecureWebpreferencesRule,
        "electron-browserwindow-require-preload":
            electronBrowserwindowRequirePreloadRule,
        "electron-dialog-require-automation-bypass":
            electronDialogRequireAutomationBypassRule,
        "electron-no-app-getpath-at-module-scope":
            electronNoAppGetpathAtModuleScopeRule,
        "electron-cloud-providers-drift-guards":
            electronCloudProvidersDriftGuardsRule,
        "electron-ipc-handler-require-validator":
            electronIpcHandlerRequireValidatorRule,
        "electron-no-ad-hoc-error-code-suffix":
            electronNoAdHocErrorCodeSuffixRule,
        "electron-no-console": electronNoConsoleRule,
        "electron-no-dialog-sync": electronNoDialogSyncRule,
        "electron-no-browserwindow-outside-windowservice":
            electronNoBrowserwindowOutsideWindowserviceRule,
        "electron-no-direct-ipc-handle": electronNoDirectIpcHandleRule,
        "electron-no-direct-ipc-handler-wrappers":
            electronNoDirectIpcHandlerWrappersRule,
        "electron-no-direct-ipc-main-import": electronNoDirectIpcMainImportRule,
        "electron-no-import-meta-dirname": electronNoImportMetaDirnameRule,
        "electron-no-inline-ipc-channel-literal":
            electronNoInlineIpcChannelLiteralRule,
        "electron-no-inline-ipc-channel-type-argument":
            electronNoInlineIpcChannelTypeArgumentRule,
        "electron-no-local-string-safety-helpers":
            electronNoLocalStringSafetyHelpersRule,
        "electron-no-renderer-import": electronNoRendererImportRule,
        "electron-prefer-read-process-env":
            electronPreferReadProcessEnvironmentRule,
        "electron-preload-no-direct-ipc-renderer-usage":
            electronPreloadNoDirectIpcRendererUsageRule,
        "electron-preload-no-inline-ipc-channel-constant":
            electronPreloadNoInlineIpcChannelConstantRule,
        "electron-no-shell-open-external": electronNoShellOpenExternalRule,
        "electron-no-webcontents-execute-javascript":
            electronNoWebcontentsExecuteJavascriptRule,
        "electron-open-devtools-require-dev-only":
            electronOpenDevtoolsRequireDevOnlyRule,
        "electron-sync-no-local-ascii-digits":
            electronSyncNoLocalAsciiDigitsRule,
        "logger-no-error-in-context": loggerNoErrorInContextRule,
        "monitor-fallback-consistency": monitorFallbackConsistencyRule,
        "no-call-identifiers": noCallIdentifiersRule,
        "no-deprecated-exports": noDeprecatedExportsRule,
        "no-inline-ipc-channel-type-literals":
            noInlineIpcChannelTypeLiteralsRule,
        "no-local-error-normalizers": noLocalErrorNormalizersRule,
        "no-local-identifiers": noLocalIdentifiersRule,
        "no-local-record-guards": noLocalRecordGuardsRule,
        "no-onedrive": noOneDriveRule,
        "no-redeclare-shared-contract-interfaces":
            noRedeclareSharedContractInterfacesRule,
        "no-regexp-v-flag": noRegexpVFlagRule,
        "prefer-app-alias": preferAppAliasRule,
        "prefer-shared-alias": preferSharedAliasRule,
        "prefer-try-get-error-code": preferTryGetErrorCodeRule,
        "preload-no-local-is-plain-object": preloadNoLocalIsPlainObjectRule,
        "renderer-no-browser-dialogs": rendererNoBrowserDialogsRule,
        "renderer-no-direct-bridge-readiness":
            rendererNoDirectBridgeReadinessRule,
        "renderer-no-direct-electron-log": rendererNoDirectElectronLogRule,
        "renderer-no-direct-networking": rendererNoDirectNetworkingRule,
        "renderer-no-direct-preload-bridge": rendererNoDirectPreloadBridgeRule,
        "renderer-no-electron-import": rendererNoElectronImportRule,
        "renderer-no-import-internal-service-utils":
            rendererNoImportInternalServiceUtilitiesRule,
        "renderer-no-ipc-renderer-usage": rendererNoIpcRendererUsageRule,
        "renderer-no-process-env": rendererNoProcessEnvRule,
        "renderer-no-preload-bridge-writes": rendererNoPreloadBridgeWritesRule,
        "renderer-no-window-open": rendererNoWindowOpenRule,
        "require-error-cause-in-catch": requireErrorCauseInCatchRule,
        "require-ensure-error-in-catch": requireEnsureErrorInCatchRule,
        "shared-no-outside-imports": sharedNoOutsideImportsRule,
        "shared-types-no-local-is-plain-object":
            sharedTypesNoLocalIsPlainObjectRule,
        "store-actions-require-finally-reset":
            storeActionsRequireFinallyResetRule,
        "test-no-mock-return-value-constructors":
            testNoMockReturnValueConstructorsRule,
        "tsdoc-no-console-example": tsdocNoConsoleExampleRule,
    },
});

const pluginRules = uptimeWatcherPlugin.rules ?? {};

for (const [ruleName, rule] of Object.entries(pluginRules)) {
    if (rule.meta?.docs) {
        rule.meta.docs.url ??= `${DEFAULT_RULE_DOCS_URL_BASE}/${ruleName}.md`;
    }
}

/**
 * Flat-config convenience exports.
 *
 * @remarks
 * This is a pragmatic internal default: the rules are generally self-scoped by
 * filename checks, so enabling them globally is safe for most consumers.
 */
/**
 * ESLint rule severity used by uptime-watcher presets.
 *
 * @remarks
 * Must remain a literal type (not widened to `string`) so it is assignable to
 * `@eslint/core`'s `SeverityName` union.
 */
const ERROR_SEVERITY = /** @type {const} */ ("error");

/** @typedef {import("@eslint/core").RulesConfig} RulesConfig */

/**
 * All uptime-watcher rules enabled at error severity.
 *
 * @type {RulesConfig}
 */
const allRules = {};

for (const ruleName of Object.keys(pluginRules)) {
    allRules[`uptime-watcher/${ruleName}`] = ERROR_SEVERITY;
}

/**
 * Flat config item type.
 *
 * @remarks
 * ESLint deprecated the `Linter.FlatConfig` alias in favor of `Linter.Config`.
 * We use `Config` to avoid editor TS6385 deprecation diagnostics.
 *
 * @typedef {import("eslint").Linter.Config} FlatConfig
 */

/**
 * @param {readonly string[]} ruleNames
 *
 * @returns {RulesConfig}
 */
function errorRulesFor(ruleNames) {
    /** @type {RulesConfig} */
    const rules = {};

    for (const ruleName of ruleNames) {
        rules[`uptime-watcher/${ruleName}`] = ERROR_SEVERITY;
    }

    return rules;
}

/**
 * Baseline recommended rules.
 *
 * @remarks
 * This plugin is repo-oriented, but we still expose a conventional
 * `recommended` preset. Keep it conservative and broadly applicable.
 * For the full monorepo guardrails, prefer `configs.repo`.
 */
const recommendedRuleNames = /** @type {const} */ ([
    "no-regexp-v-flag",
    "require-ensure-error-in-catch",
    "require-error-cause-in-catch",
]);

/**
 * Ensures the uptime-watcher plugin is registered on a flat-config item.
 *
 * @param {FlatConfig} config
 *
 * @returns {FlatConfig}
 */
function withUptimeWatcherPlugin(config) {
    return {
        ...config,
        plugins: {
            ...config.plugins,
            "uptime-watcher": uptimeWatcherPlugin,
        },
    };
}

/**
 * Repo-scoped configs (the ones actually used by this monorepo).
 *
 * @remarks
 * These config entries intentionally include `files`/`ignores` so consumers can
 * `...uptimeWatcherPlugin.configs.repo` without re-declaring all the scoping in
 * `eslint.config.mjs`.
 */
const repoCoreConfigs = /** @type {readonly FlatConfig[]} */ ([
    withUptimeWatcherPlugin({
        files: [
            "src/**/*.{ts,tsx}",
            "electron/**/*.{ts,tsx}",
            "docs/**/*.{ts,tsx}",
            "scripts/**/*.{ts,tsx}",
        ],
        ignores: ["shared/types/**/*", "**/*.d.ts"],
        name: "uptime-watcher:shared-contract-interface-guard",
        rules: errorRulesFor(["no-redeclare-shared-contract-interfaces"]),
    }),
    withUptimeWatcherPlugin({
        files: ["src/constants.ts"],
        name: "uptime-watcher:monitor-fallback-consistency",
        rules: errorRulesFor(["monitor-fallback-consistency"]),
    }),
    withUptimeWatcherPlugin({
        files: ["electron/services/ipc/handlers/**/*.{ts,tsx}"],
        ignores: ["electron/test/**/*"],
        name: "uptime-watcher:electron-ipc-handler-validation-guardrails",
        rules: errorRulesFor(["electron-ipc-handler-require-validator"]),
    }),
    withUptimeWatcherPlugin({
        files: ["electron/**/*.{ts,tsx}"],
        ignores: ["electron/test/**/*"],
        name: "uptime-watcher:electron-logger-enforcement",
        rules: errorRulesFor([
            "electron-no-console",
            "electron-dialog-require-automation-bypass",
            "electron-browserwindow-require-secure-webpreferences",
            "electron-browserwindow-require-preload",
            "electron-no-browserwindow-outside-windowservice",
            "electron-no-dialog-sync",
            "electron-no-app-getpath-at-module-scope",
            "electron-no-direct-ipc-handle",
            "electron-no-direct-ipc-handler-wrappers",
            "electron-no-direct-ipc-main-import",
            "electron-no-import-meta-dirname",
            "electron-no-inline-ipc-channel-literal",
            "electron-no-inline-ipc-channel-type-argument",
            "electron-no-renderer-import",
            "electron-no-shell-open-external",
            "electron-no-webcontents-execute-javascript",
            "electron-open-devtools-require-dev-only",
            "electron-prefer-read-process-env",
            "electron-preload-no-direct-ipc-renderer-usage",
            "electron-preload-no-inline-ipc-channel-constant",
            "no-inline-ipc-channel-type-literals",
        ]),
    }),
    withUptimeWatcherPlugin({
        files: ["**/*.{ts,tsx}"],
        name: "uptime-watcher:tsdoc-logger-examples",
        rules: errorRulesFor(["tsdoc-no-console-example"]),
    }),
    withUptimeWatcherPlugin({
        files: [
            "**/*.{spec,test}.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "**/*.{spec,test}.*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "**/__tests__/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "**/test/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "**/tests/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
        ],
        name: "uptime-watcher:vitest-constructible-mock-safety",
        rules: errorRulesFor(["test-no-mock-return-value-constructors"]),
    }),
    withUptimeWatcherPlugin({
        files: [
            "docs/**/*.{ts,tsx}",
            "electron/**/*.{ts,tsx}",
            "src/**/*.{ts,tsx}",
            "storybook/**/*.{ts,tsx}",
        ],
        ignores: ["shared/**/*"],
        name: "uptime-watcher:prefer-shared-alias",
        rules: errorRulesFor(["prefer-shared-alias"]),
    }),
    withUptimeWatcherPlugin({
        files: ["shared/**/*.{ts,tsx,cts,mts}"],
        name: "uptime-watcher:shared-layer-isolation",
        rules: errorRulesFor(["shared-no-outside-imports"]),
    }),
    withUptimeWatcherPlugin({
        files: ["src/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}"],
        ignores: ["src/test/**/*"],
        name: "uptime-watcher:renderer-electron-isolation",
        rules: errorRulesFor([
            "no-inline-ipc-channel-type-literals",
            "renderer-no-browser-dialogs",
            "renderer-no-direct-bridge-readiness",
            "renderer-no-direct-electron-log",
            "renderer-no-direct-networking",
            "renderer-no-direct-preload-bridge",
            "renderer-no-electron-import",
            "renderer-no-import-internal-service-utils",
            "renderer-no-ipc-renderer-usage",
            "renderer-no-process-env",
            "renderer-no-preload-bridge-writes",
            "renderer-no-window-open",
        ]),
    }),
    withUptimeWatcherPlugin({
        files: ["src/stores/**/*.{ts,tsx}"],
        ignores: ["src/test/**/*"],
        name: "uptime-watcher:zustand-stores-busy-flags-reset",
        rules: errorRulesFor(["store-actions-require-finally-reset"]),
    }),
    withUptimeWatcherPlugin({
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
        ],
        name: "uptime-watcher:global-no-deprecated-exports",
        rules: errorRulesFor([
            "logger-no-error-in-context",
            "no-deprecated-exports",
            "no-local-error-normalizers",
            "no-local-record-guards",
            "no-onedrive",
            "prefer-app-alias",
            "require-error-cause-in-catch",
            "require-ensure-error-in-catch",
        ]),
    }),
]);

const repoDriftGuardConfigs = /** @type {readonly FlatConfig[]} */ ([
    withUptimeWatcherPlugin({
        files: ["electron/services/sync/**/*.{ts,tsx}"],
        ignores: ["electron/services/sync/syncEngineUtils.ts"],
        name: "uptime-watcher:electron-cloud-sync-drift-guards",
        rules: errorRulesFor(["electron-sync-no-local-ascii-digits"]),
    }),
    withUptimeWatcherPlugin({
        files: ["electron/services/cloud/providers/**/*.{ts,tsx}"],
        name: "uptime-watcher:electron-cloud-providers-drift-guards",
        rules: errorRulesFor(["electron-cloud-providers-drift-guards"]),
    }),
    withUptimeWatcherPlugin({
        files: ["shared/types/**/*.{ts,tsx}"],
        name: "uptime-watcher:shared-types-drift-guards",
        rules: errorRulesFor(["shared-types-no-local-is-plain-object"]),
    }),
    withUptimeWatcherPlugin({
        files: ["electron/preload/**/*.{ts,tsx}"],
        name: "uptime-watcher:preload-drift-guards",
        rules: errorRulesFor(["preload-no-local-is-plain-object"]),
    }),
    withUptimeWatcherPlugin({
        files: ["electron/services/**/*.{ts,tsx}"],
        ignores: ["electron/services/sync/syncEngineUtils.ts"],
        name: "uptime-watcher:electron-string-safety-drift-guards",
        rules: errorRulesFor(["electron-no-local-string-safety-helpers"]),
    }),
    withUptimeWatcherPlugin({
        files: ["electron/services/**/*.{ts,tsx}"],
        ignores: ["electron/services/shell/openExternalUtils.ts"],
        name: "uptime-watcher:electron-error-formatting-drift-guards",
        rules: errorRulesFor([
            "electron-no-ad-hoc-error-code-suffix",
            "prefer-try-get-error-code",
        ]),
    }),
    withUptimeWatcherPlugin({
        files: ["**/*.{ts,tsx}"],
        name: "uptime-watcher:global-regex-drift-guards",
        rules: errorRulesFor(["no-regexp-v-flag"]),
    }),
]);

const repoConfigs = /** @type {readonly FlatConfig[]} */ ([
    ...repoCoreConfigs,
    ...repoDriftGuardConfigs,
]);

const unscopedAllConfig = withUptimeWatcherPlugin({
    name: "uptime-watcher:all",
    rules: allRules,
});

const unscopedRecommendedConfig = withUptimeWatcherPlugin({
    name: "uptime-watcher:recommended",
    rules: errorRulesFor(recommendedRuleNames),
});

const unscopedDefaultConfig = withUptimeWatcherPlugin({
    name: "uptime-watcher:default",
    rules: allRules,
});

const flatAllConfig = withUptimeWatcherPlugin({
    name: "uptime-watcher:flat/all",
    rules: allRules,
});

const flatRecommendedConfig = withUptimeWatcherPlugin({
    name: "uptime-watcher:flat/recommended",
    rules: errorRulesFor(recommendedRuleNames),
});

const flatDefaultConfig = withUptimeWatcherPlugin({
    name: "uptime-watcher:flat/default",
    rules: allRules,
});

/** @type {any} */ (uptimeWatcherPlugin).configs = {
    // Generic (unscoped) configs. These intentionally rely on rules being
    // Internally defensive (path checks, etc.).
    all: unscopedAllConfig,
    recommended: unscopedRecommendedConfig,
    default: unscopedDefaultConfig,

    // Common convention used by other plugins (helps muscle memory).
    "flat/all": flatAllConfig,
    "flat/recommended": flatRecommendedConfig,
    "flat/default": flatDefaultConfig,

    // Repo-scoped convenience configs.
    // NOTE: arrays must be spread into the top-level config list.
    repo: repoConfigs,
    "repo/core": repoCoreConfigs,
    "repo/drift-guards": repoDriftGuardConfigs,
};

export default uptimeWatcherPlugin;
