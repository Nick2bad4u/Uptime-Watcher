import type { CloudEnableSyncConfig, CloudStatusSummary } from "@shared/types/cloud";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";

import type { CloudServiceOperationContext } from "./CloudService.operationContext";

import { logger } from "../../utils/logger";
import { ProviderCloudSyncTransport } from "../sync/ProviderCloudSyncTransport";
import {
    parseBooleanSetting,
    SETTINGS_KEY_LAST_SYNC_AT,
    SETTINGS_KEY_SYNC_ENABLED,
} from "./internal/cloudServiceSettings";
import { resetProviderCloudSyncState } from "./migrations/syncReset";
import { buildCloudSyncResetPreview } from "./migrations/syncResetPreview";

/**
 * Enables or disables multi-device sync (when supported).
 */
export async function enableSync(
    ctx: CloudServiceOperationContext,
    config: CloudEnableSyncConfig
): Promise<CloudStatusSummary> {
    return ctx.runCloudOperation("enableSync", async () => {
        await ctx.settings.set(
            SETTINGS_KEY_SYNC_ENABLED,
            config.enabled ? "true" : "false"
        );

        logger.info("[CloudService] Updated sync enabled flag", {
            enabled: config.enabled,
        });

        return ctx.buildStatusSummary();
    });
}

/**
 * Requests a sync cycle as soon as possible.
 */
export async function requestSyncNow(
    ctx: CloudServiceOperationContext
): Promise<void> {
    await ctx.runCloudOperation("requestSyncNow", async () => {
        const syncEnabled = parseBooleanSetting(
            await ctx.settings.get(SETTINGS_KEY_SYNC_ENABLED)
        );

        if (!syncEnabled) {
            throw new Error("Cloud sync is disabled");
        }

        const provider = await ctx.resolveProviderOrThrow();
        await ctx.syncEngine.syncNow(provider);
        await ctx.settings.set(SETTINGS_KEY_LAST_SYNC_AT, String(Date.now()));

        logger.info("[CloudService] Sync completed");
    });
}

/**
 * Resets the remote sync history and re-seeds it from this device.
 *
 * @remarks
 * This is a destructive maintenance operation intended for advanced users.
 */
export async function resetRemoteSyncState(
    ctx: CloudServiceOperationContext
): Promise<CloudSyncResetResult> {
    return ctx.runCloudOperation("resetRemoteSyncState", async () => {
        const syncEnabled = parseBooleanSetting(
            await ctx.settings.get(SETTINGS_KEY_SYNC_ENABLED)
        );

        if (!syncEnabled) {
            throw new Error("Sync must be enabled to reset remote sync");
        }

        const provider = await ctx.resolveProviderOrThrow({
            requireEncryptionUnlocked: true,
        });

        return resetProviderCloudSyncState({
            provider,
            syncEngine: ctx.syncEngine,
        });
    });
}

/**
 * Previews a remote sync reset by counting remote `sync/` objects and reading
 * the current manifest.
 */
export async function previewResetRemoteSyncState(
    ctx: CloudServiceOperationContext
): Promise<CloudSyncResetPreview> {
    return ctx.runCloudOperation("previewResetRemoteSyncState", async () => {
        const provider = await ctx.resolveProviderOrThrow({
            requireEncryptionUnlocked: false,
        });

        const transport = ProviderCloudSyncTransport.create(provider);
        const manifest =
            (await transport.readManifest()) ??
            ProviderCloudSyncTransport.createEmptyManifest();

        const syncObjects = await provider.listObjects("sync/");
        return buildCloudSyncResetPreview({ manifest, syncObjects });
    });
}
