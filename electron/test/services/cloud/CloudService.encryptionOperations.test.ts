import type { CloudStatusSummary } from "@shared/types/cloud";

import { describe, expect, it, vi } from "vitest";

import type { CloudServiceOperationContext } from "../../../services/cloud/CloudService.operationContext";
import type { CloudStorageProvider } from "../../../services/cloud/providers/CloudStorageProvider.types";

import { setEncryptionPassphrase } from "../../../services/cloud/CloudService.encryptionOperations";
import { InMemorySecretStore } from "../../utils/InMemorySecretStore";

function createBaseStatus(): CloudStatusSummary {
    return {
        backupsEnabled: false,
        configured: false,
        connected: false,
        encryptionLocked: false,
        encryptionMode: "none",
        lastBackupAt: null,
        lastSyncAt: null,
        provider: null,
        syncEnabled: false,
    };
}

function createSettingsAdapter(): CloudServiceOperationContext["settings"] {
    const data = new Map<string, string>();

    return {
        get: async (key) => data.get(key),
        set: async (key, value) => {
            data.set(key, value);
        },
    };
}

function createMissingManifestError(): Error & { code: string } {
    const error = new Error("manifest not found") as Error & { code: string };
    error.code = "ENOENT";
    return error;
}

function createFailingManifestProvider(): CloudStorageProvider {
    return {
        deleteObject: async () => {
            throw new Error("not used");
        },
        downloadBackup: async () => {
            throw new Error("not used");
        },
        downloadObject: async (key) => {
            if (key === "manifest.json") {
                throw createMissingManifestError();
            }

            throw new Error("not used");
        },
        isConnected: async () => true,
        kind: "filesystem",
        listBackups: async () => [],
        listObjects: async () => [],
        uploadBackup: async () => {
            throw new Error("not used");
        },
        uploadObject: async () => {
            throw new Error("manifest write failed");
        },
    };
}

function createOperationContext(
    provider: CloudStorageProvider
): CloudServiceOperationContext {
    return {
        buildStatusSummary: async () => createBaseStatus(),
        decryptBackupOrThrow: async () => {
            throw new Error("not used");
        },
        getDropboxAppKey: () => "app-key",
        getEncryptionKeyMaybe: async () => ({
            encrypted: false,
            key: undefined,
        }),
        getEncryptionKeyOrThrow: async () => {
            throw new Error("not used");
        },
        loadDropboxDeps: async () => {
            throw new Error("not used");
        },
        loadGoogleDriveDeps: async () => {
            throw new Error("not used");
        },
        orchestrator: {} as never,
        resolveProviderOrThrow: async () => provider,
        runCloudOperation: async (_operationName, operation) => operation(),
        secretStore: new InMemorySecretStore(),
        settings: createSettingsAdapter(),
        syncEngine: {} as never,
    };
}

describe(setEncryptionPassphrase, () => {
    it("zeroizes the derived key when manifest persistence fails", async () => {
        const fillSpy = vi.spyOn(Buffer.prototype, "fill");
        try {
            const ctx = createOperationContext(createFailingManifestProvider());

            await expect(
                setEncryptionPassphrase(ctx, "correct horse battery staple")
            ).rejects.toThrow("manifest write failed");

            expect(fillSpy).toHaveBeenCalledWith(0);
        } finally {
            fillSpy.mockRestore();
        }
    });
});
