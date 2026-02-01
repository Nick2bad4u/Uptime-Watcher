/**
 * @file Internal uptime-watcher ESLint plugin entrypoint.
 *
 * @remarks
 * This module is intentionally colocated with the rule implementations so the
 * plugin can be extracted/published later with minimal repo-specific glue.
 */

import { electronCloudProvidersDriftGuardsRule } from "./rules/electron-cloud-providers-drift-guards.mjs";
import { electronIpcHandlerRequireValidatorRule } from "./rules/electron-ipc-handler-require-validator.mjs";
import { electronNoAdHocErrorCodeSuffixRule } from "./rules/electron-no-ad-hoc-error-code-suffix.mjs";
import { electronNoConsoleRule } from "./rules/electron-no-console.mjs";
import { electronNoDirectIpcHandleRule } from "./rules/electron-no-direct-ipc-handle.mjs";
import { electronNoDirectIpcHandlerWrappersRule } from "./rules/electron-no-direct-ipc-handler-wrappers.mjs";
import { electronNoDirectIpcMainImportRule } from "./rules/electron-no-direct-ipc-main-import.mjs";
import { electronNoInlineIpcChannelLiteralRule } from "./rules/electron-no-inline-ipc-channel-literal.mjs";
import { electronNoInlineIpcChannelTypeArgumentRule } from "./rules/electron-no-inline-ipc-channel-type-argument.mjs";
import { electronNoLocalStringSafetyHelpersRule } from "./rules/electron-no-local-string-safety-helpers.mjs";
import { electronNoRendererImportRule } from "./rules/electron-no-renderer-import.mjs";
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
import { rendererNoWindowOpenRule } from "./rules/renderer-no-window-open.mjs";
import { requireEnsureErrorInCatchRule } from "./rules/require-ensure-error-in-catch.mjs";
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
        "electron-cloud-providers-drift-guards":
            electronCloudProvidersDriftGuardsRule,
        "electron-ipc-handler-require-validator":
            electronIpcHandlerRequireValidatorRule,
        "electron-no-ad-hoc-error-code-suffix":
            electronNoAdHocErrorCodeSuffixRule,
        "electron-no-console": electronNoConsoleRule,
        "electron-no-direct-ipc-handle": electronNoDirectIpcHandleRule,
        "electron-no-direct-ipc-handler-wrappers":
            electronNoDirectIpcHandlerWrappersRule,
        "electron-no-direct-ipc-main-import": electronNoDirectIpcMainImportRule,
        "electron-no-inline-ipc-channel-literal":
            electronNoInlineIpcChannelLiteralRule,
        "electron-no-inline-ipc-channel-type-argument":
            electronNoInlineIpcChannelTypeArgumentRule,
        "electron-no-local-string-safety-helpers":
            electronNoLocalStringSafetyHelpersRule,
        "electron-no-renderer-import": electronNoRendererImportRule,
        "electron-prefer-read-process-env": electronPreferReadProcessEnvironmentRule,
        "electron-preload-no-direct-ipc-renderer-usage":
            electronPreloadNoDirectIpcRendererUsageRule,
        "electron-preload-no-inline-ipc-channel-constant":
            electronPreloadNoInlineIpcChannelConstantRule,
        "electron-sync-no-local-ascii-digits": electronSyncNoLocalAsciiDigitsRule,
        "logger-no-error-in-context": loggerNoErrorInContextRule,
        "monitor-fallback-consistency": monitorFallbackConsistencyRule,
        "no-call-identifiers": noCallIdentifiersRule,
        "no-deprecated-exports": noDeprecatedExportsRule,
        "no-inline-ipc-channel-type-literals": noInlineIpcChannelTypeLiteralsRule,
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
        "renderer-no-direct-bridge-readiness": rendererNoDirectBridgeReadinessRule,
        "renderer-no-direct-electron-log": rendererNoDirectElectronLogRule,
        "renderer-no-direct-networking": rendererNoDirectNetworkingRule,
        "renderer-no-direct-preload-bridge": rendererNoDirectPreloadBridgeRule,
        "renderer-no-electron-import": rendererNoElectronImportRule,
        "renderer-no-import-internal-service-utils":
            rendererNoImportInternalServiceUtilitiesRule,
        "renderer-no-ipc-renderer-usage": rendererNoIpcRendererUsageRule,
        "renderer-no-preload-bridge-writes": rendererNoPreloadBridgeWritesRule,
        "renderer-no-window-open": rendererNoWindowOpenRule,
        "require-ensure-error-in-catch": requireEnsureErrorInCatchRule,
        "shared-no-outside-imports": sharedNoOutsideImportsRule,
        "shared-types-no-local-is-plain-object": sharedTypesNoLocalIsPlainObjectRule,
        "store-actions-require-finally-reset": storeActionsRequireFinallyResetRule,
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
const allRules = Object.fromEntries(
    Object.keys(pluginRules).map((ruleName) => [
        `uptime-watcher/${ruleName}`,
        "error",
    ])
);

/** @type {any} */ (uptimeWatcherPlugin).configs = {
    all: {
        plugins: { "uptime-watcher": uptimeWatcherPlugin },
        rules: allRules,
    },
    recommended: {
        plugins: { "uptime-watcher": uptimeWatcherPlugin },
        rules: allRules,
    },
};

export default uptimeWatcherPlugin;
