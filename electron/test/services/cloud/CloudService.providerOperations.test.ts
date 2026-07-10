import type { CloudStatusSummary } from "@shared/types/cloud";

import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CloudServiceOperationContext } from "../../../services/cloud/CloudService.operationContext";

import {
    connectDropbox,
    connectGoogleDrive,
    configureFilesystemProvider,
    disconnect,
} from "../../../services/cloud/CloudService.providerOperations";
import {
    SETTINGS_KEY_DROPBOX_TOKENS,
    SETTINGS_KEY_ENCRYPTION_MODE,
    SETTINGS_KEY_ENCRYPTION_SALT,
    SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
    SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
    SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
    SETTINGS_KEY_PROVIDER,
} from "../../../services/cloud/internal/cloudServiceSettings";
import { logger } from "../../../utils/logger";
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
        snapshot: () => Object.fromEntries(data),
    };
}

function createOperationContext(args: {
    buildStatusSummary?:
        CloudServiceOperationContext["buildStatusSummary"] | undefined;
    loadDropboxDeps: CloudServiceOperationContext["loadDropboxDeps"];
    loadGoogleDriveDeps: CloudServiceOperationContext["loadGoogleDriveDeps"];
    secretStore: CloudServiceOperationContext["secretStore"];
    settings: CloudServiceOperationContext["settings"];
}): CloudServiceOperationContext {
    return {
        buildStatusSummary:
            args.buildStatusSummary ?? (async () => createBaseStatus()),
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
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("restores previous provider settings when Dropbox verification fails", async () => {
        const secretStore = new InMemorySecretStore();
        const settings = createSettingsAdapter({
            [SETTINGS_KEY_PROVIDER]: "filesystem",
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
        });

        await secretStore.setSecret(SETTINGS_KEY_DROPBOX_TOKENS, "old-tokens");

        const loadDropboxDeps = vi
            .fn<CloudServiceOperationContext["loadDropboxDeps"]>()
            .mockResolvedValue({
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

        await expect(connectDropbox(ctx)).rejects.toThrow(
            "Dropbox connection verification failed: boom"
        );

        await expect(
            secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
        ).resolves.toBe("old-tokens");

        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
            "filesystem"
        );
        await expect(
            settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
        ).resolves.toBe("/tmp/uw");
    });

    it("restores previous provider state when Dropbox settings persistence fails", async () => {
        const secretStore = new InMemorySecretStore();
        const baseSettings = createSettingsAdapter({
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "existing-label",
            [SETTINGS_KEY_PROVIDER]: "filesystem",
        });
        const settings: CloudServiceOperationContext["settings"] = {
            ...baseSettings,
            set: async (key, value) => {
                if (key === SETTINGS_KEY_PROVIDER && value === "dropbox") {
                    throw new Error("provider persistence failed");
                }
                await baseSettings.set(key, value);
            },
        };
        await secretStore.setSecret(SETTINGS_KEY_DROPBOX_TOKENS, "old-tokens");

        const loadDropboxDeps = vi
            .fn<CloudServiceOperationContext["loadDropboxDeps"]>()
            .mockResolvedValue({
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
                        return "account";
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

        await expect(connectDropbox(ctx)).rejects.toThrow(
            "Dropbox connect failed while persisting configuration: provider persistence failed"
        );

        await expect(
            secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
        ).resolves.toBe("old-tokens");
        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
            "filesystem"
        );
        await expect(
            settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
        ).resolves.toBe("/tmp/uw");
        await expect(
            settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)
        ).resolves.toBe("existing-label");
    });

    it("restores an existing Dropbox login when reconnect token storage fails", async () => {
        const secretStore = new InMemorySecretStore();
        const settings = createSettingsAdapter({
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "",
            [SETTINGS_KEY_PROVIDER]: "dropbox",
        });
        await secretStore.setSecret(
            SETTINGS_KEY_DROPBOX_TOKENS,
            "existing-dropbox-tokens"
        );

        const loadDropboxDeps = vi
            .fn<CloudServiceOperationContext["loadDropboxDeps"]>()
            .mockResolvedValue({
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
                        throw new Error("token persistence failed");
                    }
                },
                DropboxCloudStorageProvider: class {
                    public async getAccountLabel(): Promise<string> {
                        return "unreachable";
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

        await expect(connectDropbox(ctx)).rejects.toThrow(
            "Dropbox connect failed while persisting credentials: token persistence failed"
        );

        await expect(
            secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
        ).resolves.toBe("existing-dropbox-tokens");
        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
            "dropbox"
        );
    });

    it("restores provider state before cross-provider cleanup when Dropbox status construction fails", async () => {
        const secretStore = new InMemorySecretStore();
        const settings = createSettingsAdapter({
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "existing-label",
            [SETTINGS_KEY_PROVIDER]: "google-drive",
        });
        await secretStore.setSecret(SETTINGS_KEY_DROPBOX_TOKENS, "old-dropbox");
        await secretStore.setSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS, "google");

        const loadDropboxDeps = vi
            .fn<CloudServiceOperationContext["loadDropboxDeps"]>()
            .mockResolvedValue({
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
                        return "account";
                    }
                },
            } as never);
        const ctx = createOperationContext({
            buildStatusSummary: async () => {
                throw new Error("status failed");
            },
            loadDropboxDeps,
            loadGoogleDriveDeps: async () => {
                throw new Error("not used");
            },
            secretStore,
            settings,
        });

        await expect(connectDropbox(ctx)).rejects.toThrow(
            "Dropbox connect failed while building status: status failed"
        );

        await expect(
            secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
        ).resolves.toBe("old-dropbox");
        await expect(
            secretStore.getSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS)
        ).resolves.toBe("google");
        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
            "google-drive"
        );
        await expect(
            settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
        ).resolves.toBe("/tmp/uw");
        await expect(
            settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)
        ).resolves.toBe("existing-label");
    });

    it("retains the connect error while attempting every Dropbox rollback step", async () => {
        const storedSecrets = new Map<string, string>([
            [SETTINGS_KEY_DROPBOX_TOKENS, "old-tokens"],
        ]);
        let rejectTokenRestore = false;
        const tokenRollbackError = new Error("token rollback failed");
        const secretStore: CloudServiceOperationContext["secretStore"] = {
            deleteSecret: async (key) => {
                storedSecrets.delete(key);
            },
            getSecret: async (key) => storedSecrets.get(key),
            setSecret: async (key, value) => {
                if (rejectTokenRestore && value === "old-tokens") {
                    throw tokenRollbackError;
                }
                storedSecrets.set(key, value);
            },
        };
        const settings = createSettingsAdapter({
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "existing-label",
            [SETTINGS_KEY_PROVIDER]: "filesystem",
        });
        const verificationError = new Error("verification failed");
        const loadDropboxDeps = vi
            .fn<CloudServiceOperationContext["loadDropboxDeps"]>()
            .mockResolvedValue({
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
                        rejectTokenRestore = true;
                        throw verificationError;
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

        try {
            await connectDropbox(ctx);
            throw new Error("Expected connectDropbox to reject");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(AggregateError);
            const aggregate = error as AggregateError;
            expect(aggregate.errors).toHaveLength(2);
            expect(aggregate.errors[0]).toBe(verificationError);
            expect(aggregate.errors[1]).toBeInstanceOf(AggregateError);
            expect((aggregate.errors[1] as AggregateError).errors).toContain(
                tokenRollbackError
            );
        }

        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
            "filesystem"
        );
        await expect(
            settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
        ).resolves.toBe("/tmp/uw");
        await expect(
            settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)
        ).resolves.toBe("existing-label");
    });

    it("does not clobber existing provider when Google Drive label fetch fails", async () => {
        const secretStore = new InMemorySecretStore();
        const settings = createSettingsAdapter({
            [SETTINGS_KEY_PROVIDER]: "filesystem",
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "existing-label",
        });

        await secretStore.setSecret(
            SETTINGS_KEY_DROPBOX_TOKENS,
            "dropbox-tokens"
        );

        const loadGoogleDriveDeps = vi
            .fn<CloudServiceOperationContext["loadGoogleDriveDeps"]>()
            .mockResolvedValue({
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

        await expect(connectGoogleDrive(ctx)).rejects.toThrow("label failed");

        // Provider + filesystem config should remain intact.
        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
            "filesystem"
        );
        await expect(
            settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
        ).resolves.toBe("/tmp/uw");

        // Google Drive secrets should not be written when connect fails.
        await expect(
            secretStore.getSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS)
        ).resolves.toBe(undefined);

        // Dropbox tokens should not be cleared on a failed Google Drive attempt.
        await expect(
            secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
        ).resolves.toBe("dropbox-tokens");

        // Existing label should remain unchanged.
        await expect(
            settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)
        ).resolves.toBe("existing-label");
    });

    it("restores previous provider settings when Google Drive persistence fails after token storage", async () => {
        const secretStore = new InMemorySecretStore();
        const baseSettings = createSettingsAdapter({
            [SETTINGS_KEY_PROVIDER]: "filesystem",
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "existing-label",
        });

        const settings: CloudServiceOperationContext["settings"] & {
            snapshot: () => Record<string, string>;
        } = {
            ...baseSettings,
            set: async (key, value) => {
                if (key === SETTINGS_KEY_PROVIDER && value === "google-drive") {
                    throw new Error("settings failed");
                }
                await baseSettings.set(key, value);
            },
        };

        await secretStore.setSecret(
            SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
            "old-google-tokens"
        );
        await secretStore.setSecret(SETTINGS_KEY_DROPBOX_TOKENS, "dropbox");

        const loadGoogleDriveDeps = vi
            .fn<CloudServiceOperationContext["loadGoogleDriveDeps"]>()
            .mockResolvedValue({
                fetchGoogleAccountLabel: async () => "new-label",
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

        await expect(connectGoogleDrive(ctx)).rejects.toThrow(
            "Google Drive connect failed while persisting configuration: settings failed"
        );

        // Provider + filesystem config should remain intact.
        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
            "filesystem"
        );
        await expect(
            settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
        ).resolves.toBe("/tmp/uw");

        // Account label should be restored.
        await expect(
            settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)
        ).resolves.toBe("existing-label");

        // Google Drive tokens should be restored.
        await expect(
            secretStore.getSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS)
        ).resolves.toBe("old-google-tokens");

        // Dropbox tokens should not be cleared on failed Google Drive attempt.
        await expect(
            secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
        ).resolves.toBe("dropbox");
    });

    it("restores Google Drive state before Dropbox cleanup when status construction fails", async () => {
        const secretStore = new InMemorySecretStore();
        const settings = createSettingsAdapter({
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "existing-label",
            [SETTINGS_KEY_PROVIDER]: "filesystem",
        });
        await secretStore.setSecret(
            SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
            "old-google"
        );
        await secretStore.setSecret(SETTINGS_KEY_DROPBOX_TOKENS, "dropbox");

        const loadGoogleDriveDeps = vi
            .fn<CloudServiceOperationContext["loadGoogleDriveDeps"]>()
            .mockResolvedValue({
                fetchGoogleAccountLabel: async () => "new-label",
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
            buildStatusSummary: async () => {
                throw new Error("status failed");
            },
            loadDropboxDeps: async () => {
                throw new Error("not used");
            },
            loadGoogleDriveDeps,
            secretStore,
            settings,
        });

        await expect(connectGoogleDrive(ctx)).rejects.toThrow(
            "Google Drive connect failed while persisting configuration: status failed"
        );

        await expect(
            secretStore.getSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS)
        ).resolves.toBe("old-google");
        await expect(
            secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
        ).resolves.toBe("dropbox");
        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
            "filesystem"
        );
        await expect(
            settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
        ).resolves.toBe("/tmp/uw");
        await expect(
            settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)
        ).resolves.toBe("existing-label");
    });

    it("does not commit filesystem provider when base directory persistence fails", async () => {
        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uw-cloud-provider-")
        );

        try {
            const secretStore = new InMemorySecretStore();
            const baseSettings = createSettingsAdapter({
                [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/previous",
                [SETTINGS_KEY_PROVIDER]: "dropbox",
            });

            const settings: CloudServiceOperationContext["settings"] = {
                ...baseSettings,
                set: async (key, value) => {
                    if (key === SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY) {
                        throw new Error("base directory persistence failed");
                    }

                    await baseSettings.set(key, value);
                },
            };

            await secretStore.setSecret(
                SETTINGS_KEY_DROPBOX_TOKENS,
                "dropbox-tokens"
            );

            const ctx = createOperationContext({
                loadDropboxDeps: async () => {
                    throw new Error("not used");
                },
                loadGoogleDriveDeps: async () => {
                    throw new Error("not used");
                },
                secretStore,
                settings,
            });

            await expect(
                configureFilesystemProvider(ctx, { baseDirectory })
            ).rejects.toThrow("base directory persistence failed");

            await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
                "dropbox"
            );
            await expect(
                settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
            ).resolves.toBe("/tmp/previous");
            await expect(
                secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
            ).resolves.toBe("dropbox-tokens");
        } finally {
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("rolls back filesystem provider settings when provider persistence fails", async () => {
        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uw-cloud-provider-")
        );

        try {
            const secretStore = new InMemorySecretStore();
            const baseSettings = createSettingsAdapter({
                [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/previous",
                [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "old-label",
                [SETTINGS_KEY_PROVIDER]: "dropbox",
            });

            const settings: CloudServiceOperationContext["settings"] = {
                ...baseSettings,
                set: async (key, value) => {
                    if (
                        key === SETTINGS_KEY_PROVIDER &&
                        value === "filesystem"
                    ) {
                        throw new Error("provider persistence failed");
                    }

                    await baseSettings.set(key, value);
                },
            };

            await secretStore.setSecret(
                SETTINGS_KEY_DROPBOX_TOKENS,
                "dropbox-tokens"
            );

            const ctx = createOperationContext({
                loadDropboxDeps: async () => {
                    throw new Error("not used");
                },
                loadGoogleDriveDeps: async () => {
                    throw new Error("not used");
                },
                secretStore,
                settings,
            });

            await expect(
                configureFilesystemProvider(ctx, { baseDirectory })
            ).rejects.toThrow("provider persistence failed");

            await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
                "dropbox"
            );
            await expect(
                settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
            ).resolves.toBe("/tmp/previous");
            await expect(
                settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)
            ).resolves.toBe("old-label");
            await expect(
                secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
            ).resolves.toBe("dropbox-tokens");
        } finally {
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("logs failed Dropbox token revocation while clearing local disconnect state", async () => {
        const secretStore = new InMemorySecretStore();
        const settings = createSettingsAdapter({
            [SETTINGS_KEY_DROPBOX_TOKENS]: "legacy-settings-token-copy",
            [SETTINGS_KEY_ENCRYPTION_MODE]: "passphrase",
            [SETTINGS_KEY_ENCRYPTION_SALT]: "salt",
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
            [SETTINGS_KEY_PROVIDER]: "dropbox",
        });

        await secretStore.setSecret(SETTINGS_KEY_DROPBOX_TOKENS, "tokens");

        const loggerWarn = vi
            .spyOn(logger, "warn")
            .mockImplementation(() => {});

        const ctx = createOperationContext({
            loadDropboxDeps: async () =>
                ({
                    DropboxTokenManager: class {
                        public async revokeStoredTokens(): Promise<void> {
                            throw new Error(
                                "revoke failed refresh_token=VERY_SECRET_TOKEN Authorization: Bearer VERY_SECRET_TOKEN"
                            );
                        }
                    },
                }) as never,
            loadGoogleDriveDeps: async () => {
                throw new Error("not used");
            },
            secretStore,
            settings,
        });

        await disconnect(ctx);

        expect(loggerWarn).toHaveBeenCalledWith(
            "[CloudService] Failed to revoke provider tokens",
            {
                message: "revoke failed refresh_token=[redacted] [redacted]",
                provider: "dropbox",
            }
        );
        expect(JSON.stringify(loggerWarn.mock.calls)).not.toContain(
            "VERY_SECRET_TOKEN"
        );
        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe("");
        await expect(
            settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
        ).resolves.toBe("");
        await expect(
            secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
        ).resolves.toBe(undefined);
    });

    it("attempts all disconnect cleanup when one settings clear fails", async () => {
        const secretStore = new InMemorySecretStore();
        const baseSettings = createSettingsAdapter({
            [SETTINGS_KEY_ENCRYPTION_MODE]: "passphrase",
            [SETTINGS_KEY_ENCRYPTION_SALT]: "salt",
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/uw",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "stale-label",
            [SETTINGS_KEY_PROVIDER]: "dropbox",
        });
        const providerClearError = new Error("provider clear failed");
        const settings: CloudServiceOperationContext["settings"] = {
            ...baseSettings,
            set: async (key, value) => {
                if (key === SETTINGS_KEY_PROVIDER && value === "") {
                    throw providerClearError;
                }
                await baseSettings.set(key, value);
            },
        };
        await secretStore.setSecret(SETTINGS_KEY_DROPBOX_TOKENS, "dropbox");
        await secretStore.setSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS, "google");

        const ctx = createOperationContext({
            loadDropboxDeps: async () =>
                ({
                    DropboxTokenManager: class {
                        public async revokeStoredTokens(): Promise<void> {}
                    },
                }) as never,
            loadGoogleDriveDeps: async () => {
                throw new Error("not used");
            },
            secretStore,
            settings,
        });

        const result = disconnect(ctx);
        await expect(result).rejects.toThrow(AggregateError);
        await expect(result).rejects.toThrow(
            "Cloud provider disconnect could not clear all persisted settings"
        );

        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
            "dropbox"
        );
        await expect(
            settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
        ).resolves.toBe("");
        await expect(
            settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)
        ).resolves.toBe("");
        await expect(settings.get(SETTINGS_KEY_ENCRYPTION_MODE)).resolves.toBe(
            ""
        );
        await expect(settings.get(SETTINGS_KEY_ENCRYPTION_SALT)).resolves.toBe(
            ""
        );
        await expect(
            secretStore.getSecret(SETTINGS_KEY_DROPBOX_TOKENS)
        ).resolves.toBeUndefined();
        await expect(
            secretStore.getSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS)
        ).resolves.toBeUndefined();
    });
});
