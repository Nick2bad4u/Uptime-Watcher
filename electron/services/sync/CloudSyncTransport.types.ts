import type { CloudSyncOperation } from "@shared/types/cloudSync";
import type { CloudSyncManifest } from "@shared/types/cloudSyncManifest";
import type { CloudSyncSnapshot } from "@shared/types/cloudSyncSnapshot";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "../cloud/providers/CloudStorageProvider.types";

/**
 * Provider-backed transport for ADR-016 sync.
 */
export interface CloudSyncTransport {
    /** Appends operations to the per-device op log. */
    appendOperations: (
        deviceId: string,
        operations: readonly CloudSyncOperation[],
        createdAtEpochMs?: number
    ) => Promise<CloudObjectEntry>;

    /** Deletes an object by key. */
    deleteObject: (key: string) => Promise<void>;

    /** Lists all op log objects for all devices. */
    listOperationObjects: () => Promise<CloudObjectEntry[]>;

    /** Reads the remote manifest (or null if missing). */
    readManifest: () => Promise<CloudSyncManifest | null>;

    /** Downloads and parses operations from a single op log object. */
    readOperationsObject: (key: string) => Promise<CloudSyncOperation[]>;

    /** Reads a snapshot by key. */
    readSnapshot: (key: string) => Promise<CloudSyncSnapshot>;

    /** Writes the remote manifest (atomic overwrite). */
    writeManifest: (manifest: CloudSyncManifest) => Promise<void>;

    /** Writes a snapshot under the standard snapshots prefix. */
    writeSnapshot: (snapshot: CloudSyncSnapshot) => Promise<CloudObjectEntry>;
}

/**
 * Factory for provider-backed sync transports.
 */
export interface CloudSyncTransportFactory {
    /** Creates a transport wrapper for the given provider. */
    create: (provider: CloudStorageProvider) => CloudSyncTransport;
}
