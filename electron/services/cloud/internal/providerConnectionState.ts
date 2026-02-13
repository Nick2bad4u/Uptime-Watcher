import type { CloudServiceOperationContext } from "../CloudService.operationContext";

import {
    SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
    SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
    SETTINGS_KEY_PROVIDER,
} from "./cloudServiceSettings";

type ProviderConnectionContext = Pick<
    CloudServiceOperationContext,
    "secretStore" | "settings"
>;

/**
 * Snapshot of cloud-provider settings and secrets captured before a provider
 * connect attempt mutates persisted state.
 */
export interface ProviderConnectionStateSnapshot {
    readonly previousFilesystemBaseDirectory: string;
    readonly previousGoogleDriveAccountLabel: string;
    readonly previousProvider: string;
    readonly previousStoredTokens: string | undefined;
}

/**
 * Captures provider connection state so failed connect attempts can roll back
 * to a consistent previous configuration.
 */
export async function captureProviderConnectionState(args: {
    readonly ctx: ProviderConnectionContext;
    readonly includeGoogleDriveAccountLabel?: boolean;
    readonly tokenStorageKey: string;
}): Promise<ProviderConnectionStateSnapshot> {
    const previousProvider =
        (await args.ctx.settings.get(SETTINGS_KEY_PROVIDER)) ?? "";
    const previousFilesystemBaseDirectory =
        (await args.ctx.settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)) ??
        "";
    const previousStoredTokens = await args.ctx.secretStore.getSecret(
        args.tokenStorageKey
    );

    const previousGoogleDriveAccountLabel = args.includeGoogleDriveAccountLabel
        ? ((await args.ctx.settings.get(
              SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL
          )) ?? "")
        : "";

    return {
        previousFilesystemBaseDirectory,
        previousGoogleDriveAccountLabel,
        previousProvider,
        previousStoredTokens,
    };
}

/**
 * Restores provider connection state captured before a failed connect attempt.
 *
 * @remarks
 * Settings writes are intentionally sequential because the backing settings
 * layer is transaction-based in production.
 */
export async function restoreProviderConnectionState(args: {
    readonly ctx: ProviderConnectionContext;
    readonly restoreGoogleDriveAccountLabel?: boolean;
    readonly snapshot: ProviderConnectionStateSnapshot;
    readonly tokenStorageKey: string;
}): Promise<void> {
    if (args.snapshot.previousStoredTokens) {
        await args.ctx.secretStore.setSecret(
            args.tokenStorageKey,
            args.snapshot.previousStoredTokens
        );
    } else {
        await args.ctx.secretStore.deleteSecret(args.tokenStorageKey);
    }

    if (args.restoreGoogleDriveAccountLabel) {
        await args.ctx.settings.set(
            SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
            args.snapshot.previousGoogleDriveAccountLabel
        );
    }

    await args.ctx.settings.set(
        SETTINGS_KEY_PROVIDER,
        args.snapshot.previousProvider
    );
    await args.ctx.settings.set(
        SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
        args.snapshot.previousFilesystemBaseDirectory
    );
}
