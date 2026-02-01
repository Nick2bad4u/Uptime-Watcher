/**
 * @file Internal uptime-watcher ESLint plugin entrypoint.
 *
 * @remarks
 * This file is intentionally kept as the single stable import for consumers
 * (e.g. eslint.config.mjs). All rule implementations live in
 * `config/linting/plugins/uptime-watcher/rules/*`.
 */

import { electronNoAdHocErrorCodeSuffixRule } from "./uptime-watcher/rules/electron-no-ad-hoc-error-code-suffix.mjs";
import { electronCloudProvidersDriftGuardsRule } from "./uptime-watcher/rules/electron-cloud-providers-drift-guards.mjs";
import { electronNoConsoleRule } from "./uptime-watcher/rules/electron-no-console.mjs";
import { electronNoDirectIpcHandleRule } from "./uptime-watcher/rules/electron-no-direct-ipc-handle.mjs";
import { electronNoDirectIpcHandlerWrappersRule } from "./uptime-watcher/rules/electron-no-direct-ipc-handler-wrappers.mjs";
import { electronNoDirectIpcMainImportRule } from "./uptime-watcher/rules/electron-no-direct-ipcMain-import.mjs";
import { electronNoInlineIpcChannelLiteralRule } from "./uptime-watcher/rules/electron-no-inline-ipc-channel-literal.mjs";
import { electronNoInlineIpcChannelTypeArgumentRule } from "./uptime-watcher/rules/electron-no-inline-ipc-channel-type-argument.mjs";
import { electronNoLocalStringSafetyHelpersRule } from "./uptime-watcher/rules/electron-no-local-string-safety-helpers.mjs";
import { electronNoRendererImportRule } from "./uptime-watcher/rules/electron-no-renderer-import.mjs";
import { electronIpcHandlerRequireValidatorRule } from "./uptime-watcher/rules/electron-ipc-handler-require-validator.mjs";
import { electronPreferReadProcessEnvRule } from "./uptime-watcher/rules/electron-prefer-readProcessEnv.mjs";
import { electronPreloadNoDirectIpcRendererUsageRule } from "./uptime-watcher/rules/electron-preload-no-direct-ipcRenderer-usage.mjs";
import { electronPreloadNoInlineIpcChannelConstantRule } from "./uptime-watcher/rules/electron-preload-no-inline-ipc-channel-constant.mjs";
import { electronSyncNoLocalAsciiDigitsRule } from "./uptime-watcher/rules/electron-sync-no-local-ascii-digits.mjs";
import { loggerNoErrorInContextRule } from "./uptime-watcher/rules/logger-no-error-in-context.mjs";
import { monitorFallbackConsistencyRule } from "./uptime-watcher/rules/monitor-fallback-consistency.mjs";
import { noCallIdentifiersRule } from "./uptime-watcher/rules/no-call-identifiers.mjs";
import { noDeprecatedExportsRule } from "./uptime-watcher/rules/no-deprecated-exports.mjs";
import { noInlineIpcChannelTypeLiteralsRule } from "./uptime-watcher/rules/no-inline-ipc-channel-type-literals.mjs";
import { noLocalErrorNormalizersRule } from "./uptime-watcher/rules/no-local-error-normalizers.mjs";
import { noLocalIdentifiersRule } from "./uptime-watcher/rules/no-local-identifiers.mjs";
import { noLocalRecordGuardsRule } from "./uptime-watcher/rules/no-local-record-guards.mjs";
import { noOneDriveRule } from "./uptime-watcher/rules/no-onedrive.mjs";
import { noRedeclareSharedContractInterfacesRule } from "./uptime-watcher/rules/no-redeclare-shared-contract-interfaces.mjs";
import { noRegexpVFlagRule } from "./uptime-watcher/rules/no-regexp-v-flag.mjs";
import { preferAppAliasRule } from "./uptime-watcher/rules/prefer-app-alias.mjs";
import { preferSharedAliasRule } from "./uptime-watcher/rules/prefer-shared-alias.mjs";
import { preferTryGetErrorCodeRule } from "./uptime-watcher/rules/prefer-try-get-error-code.mjs";
import { preloadNoLocalIsPlainObjectRule } from "./uptime-watcher/rules/preload-no-local-isPlainObject.mjs";
import { rendererNoBrowserDialogsRule } from "./uptime-watcher/rules/renderer-no-browser-dialogs.mjs";
import { rendererNoDirectBridgeReadinessRule } from "./uptime-watcher/rules/renderer-no-direct-bridge-readiness.mjs";
import { rendererNoDirectElectronLogRule } from "./uptime-watcher/rules/renderer-no-direct-electron-log.mjs";
import { rendererNoDirectNetworkingRule } from "./uptime-watcher/rules/renderer-no-direct-networking.mjs";
import { rendererNoDirectPreloadBridgeRule } from "./uptime-watcher/rules/renderer-no-direct-preload-bridge.mjs";
import { rendererNoElectronImportRule } from "./uptime-watcher/rules/renderer-no-electron-import.mjs";
import { rendererNoImportInternalServiceUtilsRule } from "./uptime-watcher/rules/renderer-no-import-internal-service-utils.mjs";
import { rendererNoIpcRendererUsageRule } from "./uptime-watcher/rules/renderer-no-ipcRenderer-usage.mjs";
import { rendererNoPreloadBridgeWritesRule } from "./uptime-watcher/rules/renderer-no-preload-bridge-writes.mjs";
import { rendererNoWindowOpenRule } from "./uptime-watcher/rules/renderer-no-window-open.mjs";
import { requireEnsureErrorInCatchRule } from "./uptime-watcher/rules/require-ensureError-in-catch.mjs";
import { sharedNoOutsideImportsRule } from "./uptime-watcher/rules/shared-no-outside-imports.mjs";
import { sharedTypesNoLocalIsPlainObjectRule } from "./uptime-watcher/rules/shared-types-no-local-isPlainObject.mjs";
import { storeActionsRequireFinallyResetRule } from "./uptime-watcher/rules/store-actions-require-finally-reset.mjs";
import { testNoMockReturnValueConstructorsRule } from "./uptime-watcher/rules/test-no-mock-return-value-constructors.mjs";
import { tsdocNoConsoleExampleRule } from "./uptime-watcher/rules/tsdoc-no-console-example.mjs";

const DEFAULT_RULE_DOCS_URL =
    "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs";

/** @type {{meta: {name: string, version: string}, rules: Record<string, any>}} */
const uptimeWatcherPlugin = {
    meta: {
        name: "uptime-watcher",
        version: "0.0.0",
    },
    rules: {
        "electron-no-console": electronNoConsoleRule,
        "monitor-fallback-consistency": monitorFallbackConsistencyRule,
        "renderer-no-window-open": rendererNoWindowOpenRule,
        "renderer-no-browser-dialogs": rendererNoBrowserDialogsRule,
        "renderer-no-electron-import": rendererNoElectronImportRule,
        "renderer-no-direct-preload-bridge": rendererNoDirectPreloadBridgeRule,
        "renderer-no-direct-electron-log": rendererNoDirectElectronLogRule,
        "renderer-no-preload-bridge-writes": rendererNoPreloadBridgeWritesRule,
        "renderer-no-import-internal-service-utils":
            rendererNoImportInternalServiceUtilsRule,
        "renderer-no-ipcRenderer-usage": rendererNoIpcRendererUsageRule,
        "renderer-no-direct-networking": rendererNoDirectNetworkingRule,
        "electron-no-renderer-import": electronNoRendererImportRule,
        "renderer-no-direct-bridge-readiness": rendererNoDirectBridgeReadinessRule,
        "electron-no-direct-ipc-handle": electronNoDirectIpcHandleRule,
        "electron-no-direct-ipcMain-import": electronNoDirectIpcMainImportRule,
        "electron-no-inline-ipc-channel-literal":
            electronNoInlineIpcChannelLiteralRule,
        "electron-preload-no-inline-ipc-channel-constant":
            electronPreloadNoInlineIpcChannelConstantRule,
        "electron-no-inline-ipc-channel-type-argument":
            electronNoInlineIpcChannelTypeArgumentRule,
        "no-inline-ipc-channel-type-literals": noInlineIpcChannelTypeLiteralsRule,
        "electron-preload-no-direct-ipcRenderer-usage":
            electronPreloadNoDirectIpcRendererUsageRule,
        "electron-no-direct-ipc-handler-wrappers":
            electronNoDirectIpcHandlerWrappersRule,
        "tsdoc-no-console-example": tsdocNoConsoleExampleRule,
        "prefer-shared-alias": preferSharedAliasRule,
        "prefer-app-alias": preferAppAliasRule,
        "no-deprecated-exports": noDeprecatedExportsRule,
        "no-local-record-guards": noLocalRecordGuardsRule,
        "no-local-error-normalizers": noLocalErrorNormalizersRule,
        "no-regexp-v-flag": noRegexpVFlagRule,
        "no-local-identifiers": noLocalIdentifiersRule,
        "no-redeclare-shared-contract-interfaces":
            noRedeclareSharedContractInterfacesRule,
        "electron-no-local-string-safety-helpers":
            electronNoLocalStringSafetyHelpersRule,
        "electron-no-ad-hoc-error-code-suffix":
            electronNoAdHocErrorCodeSuffixRule,
        "electron-sync-no-local-ascii-digits": electronSyncNoLocalAsciiDigitsRule,
        "electron-cloud-providers-drift-guards":
            electronCloudProvidersDriftGuardsRule,
        "shared-types-no-local-isPlainObject": sharedTypesNoLocalIsPlainObjectRule,
        "preload-no-local-isPlainObject": preloadNoLocalIsPlainObjectRule,
        "test-no-mock-return-value-constructors":
            testNoMockReturnValueConstructorsRule,
        "no-call-identifiers": noCallIdentifiersRule,
        "prefer-try-get-error-code": preferTryGetErrorCodeRule,
        "logger-no-error-in-context": loggerNoErrorInContextRule,
        "store-actions-require-finally-reset": storeActionsRequireFinallyResetRule,
        "require-ensureError-in-catch": requireEnsureErrorInCatchRule,
        "electron-prefer-readProcessEnv": electronPreferReadProcessEnvRule,
        "electron-ipc-handler-require-validator":
            electronIpcHandlerRequireValidatorRule,
        "no-onedrive": noOneDriveRule,
        "shared-no-outside-imports": sharedNoOutsideImportsRule,
    },
};

for (const [ruleName, rule] of Object.entries(uptimeWatcherPlugin.rules)) {
    if (rule.meta.docs) {
        rule.meta.docs.url ??= `${DEFAULT_RULE_DOCS_URL}#${ruleName}`;
    }
}

export default uptimeWatcherPlugin;
