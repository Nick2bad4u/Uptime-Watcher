import { describe, expect, it, vi } from "vitest";

import type { CloudStatusSummary } from "@shared/types/cloud";

import { InMemorySecretStore } from "../../utils/InMemorySecretStore";

import {
    SETTINGS_KEY_DROPBOX_TOKENS,
    SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
    SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
    SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
    SETTINGS_KEY_PROVIDER,
} from "../../../services/cloud/internal/cloudServiceSettings";

import type { CloudServiceOperationContext } from "../../../services/cloud/CloudService.operationContext";

import {
    connectDropbox,
    connectGoogleDrive,
} from "../../../services/cloud/CloudService.providerOperations";

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

function createSettingsAdapter(seed?: Record<string, string>): {
    get: (key: string) => Promise<string | undefined>;
    set: (key: string, value: string) => Promise<void>;
    snapshot: () => Record<string, string>;
} {
    const data = new Map<string, string>(Object.entries(seed ?? {}));
    return {
        get: async (key) => data.get(key),
        set: async (key, value) => {
            data.set(key, value);
        },
        snapshot: () => Object.fromEntries(data.entries()),
    };
}

function createOperationContext(args: {
    loadDropboxDeps: CloudServiceOperationContext["loadDropboxDeps"];
    loadGoogleDriveDeps: CloudServiceOperationContext["loadGoogleDriveDeps"];
    secretStore: CloudServiceOperationContext["secretStore"];
    settings: CloudServiceOperationContext["settings"];
}): CloudServiceOperationContext {
    return {
        buildStatusSummary: async () => createBaseStatus(),
        decryptBackupOrThrow: async () => {
            throw new Error("not used");
        },
        getDropboxAppKey: () => "app-key",
        getEncryptionKeyMaybe: async () => ({ encrypted: false, key: undefined }),
        getEncryptionKeyOrThrow: async () => {
            throw new Error("not used");
        },
        loadDropboxDeps: args.loadDropboxDeps,
        loadGoogleDriveDeps: args.loadGoogleDriveDeps,
        orchestrator: {} as never,
        resolveProviderOrThrow: async () => {
            throw new Error("not used");
        },
        runCloudOperation: async (_operationName, operation) => operation(),
        secretStore: args.secretStore,
        settings: args.settings,
        syncEngine: {} as never,
    };
}

describe("CloudService.providerOperations", () => {
    it("restores previous provider settings when Dropbox verification fails", async () => {
        const secretStore = new InMemorySecretStore();
        const settings = createSettingsAdapter({
            [SETTINGS_KEY_PROVIDER]: "filesystem",
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
        });

        await secretStore.setSecret(SETTINGS_KEY_DROPBOX_TOKENS, "old-tokens");

        const loadDropboxDeps = vi.fn<
            CloudServiceOperationContext["loadDropboxDeps"]
        >().mockResolvedValue({
            DropboxAuthFlow: class {
                public async connect(): Promise<unknown> {
                    return {
                        accessToken: "new",
                        expiresAtEpochMs: Date.now() + 60_000,
                        refreshToken: "refresh",
                    };
                }
            },
            DropboxTokenManager: class {
                public async storeTokens(tokens: unknown): Promise<void> {
                    await secretStore.setSecret(
                        SETTINGS_KEY_DROPBOX_TOKENS,
                        JSON.stringify(tokens)
                    );
                }
            },
            DropboxCloudStorageProvider: class {
                public async getAccountLabel(): Promise<string> {
                    throw new Error("boom");
                }
            },
        } as never);

        const ctx = createOperationContext({
            loadDropboxDeps,
            loadGoogleDriveDeps: async () => {
                throw new Error("not used");
            },
            secretStore,
            settings,
        });

        await expect(connectDropbox(ctx)).rejects.toThrowError(
            "Dropbox connection verification failed: boom"
        );

        await expect(secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)).resolves.toBe(
            "old-tokens"
        );

        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe("filesystem");
        await expect(settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)).resolves.toBe(
            "/tmp/uw"
        );
    });

    it("does not clobber existing provider when Google Drive label fetch fails", async () => {
        const secretStore = new InMemorySecretStore();
        const settings = createSettingsAdapter({
            [SETTINGS_KEY_PROVIDER]: "filesystem",
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "existing-label",
        });

        await secretStore.setSecret(SETTINGS_KEY_DROPBOX_TOKENS, "dropbox-tokens");

        const loadGoogleDriveDeps = vi.fn<
            CloudServiceOperationContext["loadGoogleDriveDeps"]
        >().mockResolvedValue({
            fetchGoogleAccountLabel: async () => {
                throw new Error("label failed");
            },
            GoogleDriveAuthFlow: class {
                public async run(): Promise<{
                    accessToken: string;
                    expiresAt: number;
                    refreshToken: string;
                    scope?: string;
                    tokenType?: string;
                }> {
                    return {
                        accessToken: "access",
                        expiresAt: Date.now() + 60_000,
                        refreshToken: "refresh",
                        scope: "scope",
                        tokenType: "Bearer",
                    };
                }
            },
            GoogleDriveTokenManager: class {
                public async setTokens(tokens: unknown): Promise<void> {
                    await secretStore.setSecret(
                        SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
                        JSON.stringify(tokens)
                    );
                }
            },
        } as never);

        const ctx = createOperationContext({
            loadDropboxDeps: async () => {
                throw new Error("not used");
            },
            loadGoogleDriveDeps,
            secretStore,
            settings,
        });

        await expect(connectGoogleDrive(ctx)).rejects.toThrowError("label failed");

        // Provider + filesystem config should remain intact.
        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe("filesystem");
        await expect(settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)).resolves.toBe(
            "/tmp/uw"
        );

        // Google Drive secrets should not be written when connect fails.
        await expect(secretStore.getSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS)).resolves.toBe(
            undefined
        );

        // Dropbox tokens should not be cleared on a failed Google Drive attempt.
        await expect(secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)).resolves.toBe(
            "dropbox-tokens"
        );

        // Existing label should remain unchanged.
        await expect(settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)).resolves.toBe(
            "existing-label"
        );
    });
});
