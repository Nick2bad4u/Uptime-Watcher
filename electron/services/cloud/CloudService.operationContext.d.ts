import type { CloudStatusSummary } from "@shared/types/cloud";

import type { UptimeOrchestrator } from "../../UptimeOrchestrator";
import type { CloudSyncEngine } from "../sync/SyncEngine";
import type { CloudSettingsAdapter } from "./CloudService.types";
import type {
    DropboxProviderDeps,
    GoogleDriveProviderDeps,
} from "./internal/cloudProviderDeps";
import type { CloudStorageProvider } from "./providers/CloudStorageProvider.types";
import type { SecretStore } from "./secrets/SecretStore";

/**
 * Internal operation context for CloudService split-out modules.
 *
 * @remarks
 * This interface is intentionally narrow but still groups all callbacks and
 * dependencies required by the extracted operation modules.
 */
export interface CloudServiceOperationContext {
    readonly buildStatusSummary: () => Promise<CloudStatusSummary>;
    readonly decryptBackupOrThrow: (buffer: Buffer) => Promise<Buffer>;
    readonly getDropboxAppKey: () => string;
    readonly getEncryptionKeyMaybe: () => Promise<
        | { encrypted: false; key: undefined }
        | { encrypted: true; key: Buffer | undefined }
    >;
    readonly getEncryptionKeyOrThrow: () => Promise<Buffer>;
    readonly loadDropboxDeps: () => Promise<DropboxProviderDeps>;
    readonly loadGoogleDriveDeps: () => Promise<GoogleDriveProviderDeps>;
    readonly orchestrator: UptimeOrchestrator;
    readonly resolveProviderOrThrow: (args?: {
        requireEncryptionUnlocked?: boolean;
    }) => Promise<CloudStorageProvider>;
    readonly runCloudOperation: <T>(
        operationName: string,
        operation: () => Promise<T>
    ) => Promise<T>;
    readonly secretStore: SecretStore;
    readonly settings: CloudSettingsAdapter;
    readonly syncEngine: CloudSyncEngine;
}
