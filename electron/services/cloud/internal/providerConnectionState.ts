import type { CloudServiceOperationContext } from "../CloudService.operationContext";

import { ensureError } from "@shared/utils/errorHandling";

import {
    SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
    SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
    SETTINGS_KEY_PROVIDER,
} from "./cloudServiceSettings";

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

type ProviderConnectionContext = Pick<
    CloudServiceOperationContext,
    "secretStore" | "settings"
>;

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
    const rollbackErrors: Error[] = [];
    const attempt = async (operation: () => Promise<void>): Promise<void> => {
        try {
            await operation();
        } catch (error: unknown) {
            rollbackErrors.push(ensureError(error));
        }
    };

    await attempt(async () => {
        if (args.snapshot.previousStoredTokens) {
            await args.ctx.secretStore.setSecret(
                args.tokenStorageKey,
                args.snapshot.previousStoredTokens
            );
        } else {
            await args.ctx.secretStore.deleteSecret(args.tokenStorageKey);
        }
    });

    if (args.restoreGoogleDriveAccountLabel) {
        await attempt(async () => {
            await args.ctx.settings.set(
                SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
                args.snapshot.previousGoogleDriveAccountLabel
            );
        });
    }

    await attempt(async () => {
        await args.ctx.settings.set(
            SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
            args.snapshot.previousFilesystemBaseDirectory
        );
    });
    // Restore the provider discriminator last so concurrent status reads cannot
    // observe a provider whose supporting settings are only partly restored.
    await attempt(async () => {
        await args.ctx.settings.set(
            SETTINGS_KEY_PROVIDER,
            args.snapshot.previousProvider
        );
    });

    if (rollbackErrors.length > 0) {
        throw new AggregateError(
            rollbackErrors,
            "Failed to restore one or more previous provider settings",
            { cause: rollbackErrors[0] }
        );
    }
}
