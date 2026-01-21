import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InMemorySecretStore } from "../../utils/InMemorySecretStore";

import { createHash } from "node:crypto";
describe("CloudService", () => {
    let baseDirectory: string;
    let fs: (typeof import("node:fs"))["promises"];
    let os: typeof import("node:os");
    let path: typeof import("node:path");
    let CloudService: (typeof import("../../../services/cloud/CloudService"))["CloudService"];

    beforeEach(async () => {
        // Electron tests globally mock fs/path. This suite needs real IO.
        vi.resetModules();
        vi.doMock("fs", async () => vi.importActual("fs"));
        vi.doMock("node:fs", async () => vi.importActual("node:fs"));
        vi.doMock("path", async () => vi.importActual("path"));
        vi.doMock("node:path", async () => vi.importActual("node:path"));

        const nodeFs = await import("node:fs");
        const nodeOs = await import("node:os");
        const nodePath =
            await vi.importActual<typeof import("node:path")>("node:path");
        const cloudServiceModule =
            await import("../../../services/cloud/CloudService");

        fs = nodeFs.promises;
        os = nodeOs;
        path = nodePath;
        CloudService = cloudServiceModule.CloudService;

        baseDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "uw-cloud-"));
    });

    afterEach(async () => {
        await fs.rm(baseDirectory, { force: true, recursive: true });
    });

    it("configures filesystem provider and uploads backup", async () => {
        const backupBuffer = Buffer.from("backup");
        const checksum = createHash("sha256")
            .update(backupBuffer)
            .digest("hex");

        const settings = new Map<string, string>([
            ["cloud.googleDrive.accountLabel", "someone@example.com"],
        ]);
        const syncEngine = {
            syncNow: vi.fn().mockResolvedValue({
                appliedRemoteOperations: 0,
                emittedLocalOperations: 0,
                mergedEntities: 0,
                snapshotKey: null,
            }),
        };
        const orchestrator = {
            downloadBackup: vi.fn().mockResolvedValue({
                buffer: backupBuffer,
                fileName: "uptime-watcher-backup.sqlite",
                metadata: {
                    appVersion: "1.0.0",
                    checksum,
                    createdAt: 1_700_000_000_000,
                    originalPath: "C:/db.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 6,
                },
            }),
            restoreBackup: vi.fn().mockResolvedValue({
                restoredAt: 1_700_000_000_100,
                preRestoreFileName: "pre.sqlite",
                metadata: {
                    appVersion: "1.0.0",
                    checksum,
                    createdAt: 1_700_000_000_000,
                    originalPath: "C:/db.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 6,
                },
            }),
        } as unknown as UptimeOrchestrator;

        const secretStore = new InMemorySecretStore();
        // Seed secrets to ensure switching to filesystem provider clears them.
        await secretStore.setSecret("cloud.dropbox.tokens", "dropbox-token");
        await secretStore.setSecret("cloud.googleDrive.tokens", "google-token");

        const cloudService = new CloudService({
            orchestrator,
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
            syncEngine,
            secretStore,
        });

        const status = await cloudService.configureFilesystemProvider({
            baseDirectory,
        });
        expect(status.provider).toBe("filesystem");

        await expect(secretStore.getSecret("cloud.dropbox.tokens")).resolves.toBeUndefined();
        await expect(secretStore.getSecret("cloud.googleDrive.tokens")).resolves.toBeUndefined();
        expect(settings.get("cloud.googleDrive.accountLabel")).toBe("");

        const syncStatus = await cloudService.enableSync({ enabled: true });
        expect(syncStatus.syncEnabled).toBeTruthy();

        await expect(cloudService.requestSyncNow()).resolves.toBeUndefined();

        const entry = await cloudService.uploadLatestBackup();
        expect(entry.fileName).toContain("uptime-watcher-backup-");

        const backups = await cloudService.listBackups();
        expect(backups).toHaveLength(1);
        expect(backups[0]?.key).toBe(entry.key);

        const restore = await cloudService.restoreBackup(entry.key);
        expect(restore.preRestoreFileName).toBe("pre.sqlite");
        expect(orchestrator.restoreBackup).toHaveBeenCalled();

        const disconnected = await cloudService.disconnect();
        expect(disconnected.provider).toBeNull();

        await expect(cloudService.listBackups()).rejects.toThrowError(
            "Cloud provider is not configured"
        );
    });

    it("rejects sync requests when disabled", async () => {
        const settings = new Map<string, string>();
        const syncEngine = {
            syncNow: vi.fn().mockResolvedValue({
                appliedRemoteOperations: 0,
                emittedLocalOperations: 0,
                mergedEntities: 0,
                snapshotKey: null,
            }),
        };
        const orchestrator = {
            downloadBackup: vi.fn(),
            restoreBackup: vi.fn(),
        } as unknown as UptimeOrchestrator;

        const cloudService = new CloudService({
            orchestrator,
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
            syncEngine,
            secretStore: new InMemorySecretStore(),
        });

        await expect(cloudService.requestSyncNow()).rejects.toThrowError(
            "Cloud sync is disabled"
        );
    });

    it("rejects filesystem provider baseDirectory with leading/trailing whitespace", async () => {
        const settings = new Map<string, string>();
        const syncEngine = {
            syncNow: vi.fn().mockResolvedValue({
                appliedRemoteOperations: 0,
                emittedLocalOperations: 0,
                mergedEntities: 0,
                snapshotKey: null,
            }),
        };

        const orchestrator = {
            downloadBackup: vi.fn(),
            restoreBackup: vi.fn(),
        } as unknown as UptimeOrchestrator;

        const cloudService = new CloudService({
            orchestrator,
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
            syncEngine,
            secretStore: new InMemorySecretStore(),
        });

        await expect(
            cloudService.configureFilesystemProvider({
                baseDirectory: ` ${baseDirectory}`,
            })
        ).rejects.toThrowError(
            "Filesystem base directory must not have leading or trailing whitespace"
        );
    });

    it("treats corrupted stored filesystem baseDirectory as unconfigured", async () => {
        const settings = new Map<string, string>([
            ["cloud.provider", "filesystem"],
            // Invalid due to leading whitespace.
            ["cloud.filesystem.baseDirectory", ` ${baseDirectory}`],
        ]);

        const syncEngine = {
            syncNow: vi.fn().mockResolvedValue({
                appliedRemoteOperations: 0,
                emittedLocalOperations: 0,
                mergedEntities: 0,
                snapshotKey: null,
            }),
        };

        const orchestrator = {
            downloadBackup: vi.fn(),
            restoreBackup: vi.fn(),
        } as unknown as UptimeOrchestrator;

        const cloudService = new CloudService({
            orchestrator,
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
            syncEngine,
            secretStore: new InMemorySecretStore(),
        });

        const status = await cloudService.getStatus();
        expect(status.provider).toBe("filesystem");
        expect(status.configured).toBeFalsy();
        expect(status.connected).toBeFalsy();

        await expect(cloudService.listBackups()).rejects.toThrowError(
            "Cloud provider is not configured"
        );
    });

    it("rejects encryption passphrases with control characters", async () => {
        const settings = new Map<string, string>();
        const syncEngine = {
            syncNow: vi.fn().mockResolvedValue({
                appliedRemoteOperations: 0,
                emittedLocalOperations: 0,
                mergedEntities: 0,
                snapshotKey: null,
            }),
        };

        const orchestrator = {
            downloadBackup: vi.fn(),
            restoreBackup: vi.fn(),
        } as unknown as UptimeOrchestrator;

        const cloudService = new CloudService({
            orchestrator,
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
            syncEngine,
            secretStore: new InMemorySecretStore(),
        });

        await cloudService.configureFilesystemProvider({ baseDirectory });

        await expect(
            cloudService.setEncryptionPassphrase("correct\nhorse")
        ).rejects.toThrowError(
            "Passphrase must not contain control characters"
        );
    });

    it("accepts passphrase with accidental surrounding whitespace when unlocking existing encryption", async () => {
        const settings = new Map<string, string>();
        const syncEngine = {
            syncNow: vi.fn().mockResolvedValue({
                appliedRemoteOperations: 0,
                emittedLocalOperations: 0,
                mergedEntities: 0,
                snapshotKey: null,
            }),
        };

        const orchestrator = {
            downloadBackup: vi.fn(),
            restoreBackup: vi.fn(),
        } as unknown as UptimeOrchestrator;

        const secretStore = new InMemorySecretStore();

        const cloudService = new CloudService({
            orchestrator,
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
            syncEngine,
            secretStore,
        });

        await cloudService.configureFilesystemProvider({ baseDirectory });

        await expect(
            cloudService.setEncryptionPassphrase("correct horse battery staple")
        ).resolves.toBeTruthy();

        await expect(
            cloudService.setEncryptionPassphrase(
                "  correct horse battery staple  "
            )
        ).resolves.toBeTruthy();
    });

    it("treats a corrupted stored derived key as locked and clears it", async () => {
        const settings = new Map<string, string>();
        const syncEngine = {
            syncNow: vi.fn().mockResolvedValue({
                appliedRemoteOperations: 0,
                emittedLocalOperations: 0,
                mergedEntities: 0,
                snapshotKey: null,
            }),
        };

        const orchestrator = {
            downloadBackup: vi.fn(),
            restoreBackup: vi.fn(),
        } as unknown as UptimeOrchestrator;

        const secretStore = new InMemorySecretStore();

        const cloudService = new CloudService({
            orchestrator,
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
            syncEngine,
            secretStore,
        });

        await cloudService.configureFilesystemProvider({ baseDirectory });

        await expect(
            cloudService.setEncryptionPassphrase("correct horse battery staple")
        ).resolves.toBeTruthy();

        // Corrupt the stored derived key so it decodes to the wrong length.
        await secretStore.setSecret("cloud.encryption.key.v1", "not-base64");

        const status = await cloudService.getStatus();
        expect(status.encryptionMode).toBe("passphrase");
        expect(status.encryptionLocked).toBeTruthy();

        await expect(
            secretStore.getSecret("cloud.encryption.key.v1")
        ).resolves.toBeUndefined();
    });
});
