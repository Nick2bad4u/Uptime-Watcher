/**
 * Cloud service settings keys and basic parsing helpers.
 *
 * @remarks
 * Extracted from {@link CloudService} to keep the main service focused on
 * provider coordination and orchestration rather than string-key bookkeeping.
 */

import type { CloudSettingsAdapter } from "../CloudService.types";

/**
 * Default Dropbox OAuth app key (client_id) shipped with the app.
 *
 * @remarks
 * This is **not** a secret. Desktop apps using OAuth + PKCE are public clients
 * and cannot keep an app secret confidential.
 */
export const DEFAULT_DROPBOX_APP_KEY = "c6wroqtgxztzq9t" as const;

export const SETTINGS_KEY_LAST_BACKUP_AT = "cloud.lastBackupAt" as const;
export const SETTINGS_KEY_LAST_SYNC_AT = "cloud.lastSyncAt" as const;
export const SETTINGS_KEY_LAST_ERROR = "cloud.lastError" as const;
export const SETTINGS_KEY_SYNC_ENABLED = "cloud.syncEnabled" as const;

export const SETTINGS_KEY_PROVIDER = "cloud.provider" as const;
export const SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY =
    "cloud.filesystem.baseDirectory" as const;

export const SETTINGS_KEY_DROPBOX_TOKENS = "cloud.dropbox.tokens" as const;
export const SETTINGS_KEY_GOOGLE_DRIVE_TOKENS =
    "cloud.googleDrive.tokens" as const;
export const SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL =
    "cloud.googleDrive.accountLabel" as const;

export const SETTINGS_KEY_ENCRYPTION_MODE = "cloud.encryption.mode" as const;
export const SETTINGS_KEY_ENCRYPTION_SALT = "cloud.encryption.salt" as const;

export const SECRET_KEY_ENCRYPTION_DERIVED_KEY =
    "cloud.encryption.key.v1" as const;

/** Persist a user-facing last error string in settings. */
export async function setLastError(
    settings: CloudSettingsAdapter,
    message: string
): Promise<void> {
    await settings.set(SETTINGS_KEY_LAST_ERROR, message);
}

/** Clear the persisted last error string in settings. */
export async function clearLastError(
    settings: CloudSettingsAdapter
): Promise<void> {
    await settings.set(SETTINGS_KEY_LAST_ERROR, "");
}

/** Parse a boolean stored as a string (currently "true" maps to true). */
export function parseBooleanSetting(value: string | undefined): boolean {
    return value === "true";
}

/** Parse a nullable number stored as a string. */
export function parseNumberSetting(value: string | undefined): null | number {
    if (value === undefined) {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}
