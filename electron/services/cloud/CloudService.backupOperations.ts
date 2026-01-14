import type { CloudBackupEntry } from "@shared/types/cloud";
import type {
    CloudBackupMigrationRequest,
    CloudBackupMigrationResult,
} from "@shared/types/cloudBackupMigration";
import type { SerializedDatabaseRestoreResult } from "@shared/types/ipc";

import type { CloudServiceOperationContext } from "./CloudService.operationContext";

import { logger } from "../../utils/logger";
import {
    type DatabaseRestorePayload,
    validateDatabaseBackupPayload,
} from "../database/utils/backup/databaseBackup";
import { encryptBuffer } from "./crypto/cloudCrypto";
import {
    serializeBackupMetadata,
    toDatabaseBackupMetadata,
} from "./internal/cloudServiceBackupMetadata";
import { ignoreENOENT } from "./internal/cloudServiceFsUtils";
import { determineBackupMigrationNeedsEncryptionKey } from "./internal/cloudServiceMigrationUtils";
import {
    assertBackupObjectKey,
    parseEncryptionMode,
} from "./internal/cloudServicePrimitives";
import {
    SETTINGS_KEY_ENCRYPTION_MODE,
    SETTINGS_KEY_LAST_BACKUP_AT,
} from "./internal/cloudServiceSettings";
import { migrateProviderBackups } from "./migrations/backupMigration";
import { backupMetadataKeyForBackupKey } from "./providers/CloudBackupMetadataFile";

/**
 * Lists all backups stored in the configured provider.
 */
export async function listBackups(
    ctx: CloudServiceOperationContext
): Promise<CloudBackupEntry[]> {
    return ctx.runCloudOperation("listBackups", async () => {
        const provider = await ctx.resolveProviderOrThrow();
        return provider.listBackups();
    });
}

/**
 * Migrates remote backups between plaintext and encrypted forms.
 *
 * @remarks
 * This operation only affects `backups/` objects (not `sync/`).
 */
export async function migrateBackups(
    ctx: CloudServiceOperationContext,
    request: CloudBackupMigrationRequest
): Promise<CloudBackupMigrationResult> {
    return ctx.runCloudOperation("migrateBackups", async () => {
        const provider = await ctx.resolveProviderOrThrow({
            requireEncryptionUnlocked: false,
        });

        const backups = await provider.listBackups();
        const needsKey = determineBackupMigrationNeedsEncryptionKey(
            request,
            backups
        );

        const localEncryptionMode = parseEncryptionMode(
            await ctx.settings.get(SETTINGS_KEY_ENCRYPTION_MODE)
        );

        if (needsKey && localEncryptionMode !== "passphrase") {
            throw new Error(
                "Passphrase encryption must be enabled/unlocked on this device to migrate encrypted backups"
            );
        }

        const encryptionKey = needsKey ? await ctx.getEncryptionKeyOrThrow() : undefined;

        const result = await migrateProviderBackups({
            encryptionKey,
            provider,
            request,
        });

        if (result.migrated > 0) {
            await ctx.settings.set(SETTINGS_KEY_LAST_BACKUP_AT, String(Date.now()));
        }

        logger.info("[CloudService] Backup migration finished", {
            failures: result.failures.length,
            migrated: result.migrated,
            processed: result.processed,
            target: result.target,
        });

        return result;
    });
}

/**
 * Creates a fresh SQLite backup and uploads it to the configured provider.
 */
export async function uploadLatestBackup(
    ctx: CloudServiceOperationContext
): Promise<CloudBackupEntry> {
    return ctx.runCloudOperation("uploadLatestBackup", async () => {
        const provider = await ctx.resolveProviderOrThrow();

        const backup = await ctx.orchestrator.downloadBackup();
        validateDatabaseBackupPayload(backup);

        const { encrypted, key } = await ctx.getEncryptionKeyMaybe();
        const shouldEncrypt = encrypted && key !== undefined;
        if (encrypted && !key) {
            throw new Error("Cloud encryption is enabled but locked on this device");
        }

        const fileName = shouldEncrypt
            ? `uptime-watcher-backup-${backup.metadata.createdAt}.sqlite.enc`
            : `uptime-watcher-backup-${backup.metadata.createdAt}.sqlite`;

        const metadata = serializeBackupMetadata({
            fileName,
            metadata: backup.metadata,
        });

        const payloadBuffer = shouldEncrypt
            ? encryptBuffer({ key, plaintext: backup.buffer })
            : backup.buffer;

        const entry = await provider.uploadBackup({
            buffer: payloadBuffer,
            encrypted: shouldEncrypt,
            fileName,
            metadata,
        });

        logger.info("[CloudService] Uploaded backup", {
            createdAt: entry.metadata.createdAt,
            key: entry.key,
        });

        await ctx.settings.set(SETTINGS_KEY_LAST_BACKUP_AT, String(Date.now()));
        return entry;
    });
}

/**
 * Downloads the specified backup from the provider and restores it.
 */
export async function restoreBackup(
    ctx: CloudServiceOperationContext,
    key: string
): Promise<SerializedDatabaseRestoreResult> {
    return ctx.runCloudOperation("restoreBackup", async () => {
        const provider = await ctx.resolveProviderOrThrow();
        const normalizedKey = assertBackupObjectKey(key);
        const downloaded = await provider.downloadBackup(normalizedKey);

        const buffer = downloaded.entry.encrypted
            ? await ctx.decryptBackupOrThrow(downloaded.buffer)
            : downloaded.buffer;

        validateDatabaseBackupPayload({
            buffer,
            metadata: toDatabaseBackupMetadata(downloaded.entry.metadata),
        });

        const payload: DatabaseRestorePayload = {
            buffer,
            fileName: downloaded.entry.fileName,
        };

        const summary = await ctx.orchestrator.restoreBackup(payload);

        return {
            metadata: serializeBackupMetadata({
                fileName: downloaded.entry.fileName,
                metadata: summary.metadata,
            }),
            preRestoreFileName: summary.preRestoreFileName,
            restoredAt: summary.restoredAt,
        };
    });
}

/**
 * Deletes the specified remote backup and its metadata sidecar.
 */
export async function deleteBackup(
    ctx: CloudServiceOperationContext,
    key: string
): Promise<CloudBackupEntry[]> {
    return ctx.runCloudOperation("deleteBackup", async () => {
        const provider = await ctx.resolveProviderOrThrow();
        const normalizedKey = assertBackupObjectKey(key);
        const metadataKey = backupMetadataKeyForBackupKey(normalizedKey);

        await ignoreENOENT(() => provider.deleteObject(normalizedKey));
        await ignoreENOENT(() => provider.deleteObject(metadataKey));

        return provider.listBackups();
    });
}
