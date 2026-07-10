import type { Monitor, Site } from "@shared/types";
import type { CloudSyncState } from "@shared/types/cloudSyncState";

import {
    DEFAULT_CHECK_INTERVAL,
    DEFAULT_REQUEST_TIMEOUT,
} from "@electron/constants";
import { FilesystemCloudStorageProvider } from "@electron/services/cloud/providers/FilesystemCloudStorageProvider";
import { SyncEngine } from "@electron/services/sync/SyncEngine";
import { logger } from "@electron/utils/logger";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { isRecord } from "@shared/utils/typeHelpers";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

/* eslint-disable unicorn/numeric-separators-style -- Test constants like 1_000 / 60_000 don't match the project's strict grouping rule; readability here is preferred. */

class InMemorySettingsAdapter {
    private readonly store = new Map<string, string>();

    public async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    public async get(key: string): Promise<string | undefined> {
        return this.store.get(key);
    }

    public async getAll(): Promise<Record<string, string>> {
        return Object.fromEntries(this.store);
    }

    public async set(key: string, value: string): Promise<void> {
        this.store.set(key, value);
    }
}

class InMemoryOrchestrator {
    private sites: Site[];

    public constructor(initialSites: Site[]) {
        this.sites = initialSites;
    }

    public async addSite(site: Site): Promise<Site> {
        this.sites = [...this.sites, site];
        return site;
    }

    public async getSites(): Promise<Site[]> {
        return this.sites;
    }

    public async removeSite(identifier: string): Promise<boolean> {
        const before = this.sites.length;
        this.sites = this.sites.filter(
            (site) => site.identifier !== identifier
        );
        return this.sites.length !== before;
    }

    public async updateSite(
        identifier: string,
        updates: Partial<Site>
    ): Promise<Site> {
        let updated: Site | undefined;
        this.sites = this.sites.map((site) => {
            if (site.identifier !== identifier) {
                return site;
            }

            updated = { ...site, ...updates };
            return updated;
        });

        if (!updated) {
            throw new Error(`Site not found: ${identifier}`);
        }

        return updated;
    }
}

interface Deferred<T> {
    readonly promise: Promise<T>;
    readonly resolve: (value: T | PromiseLike<T>) => void;
}

function createDeferred<T>(): Deferred<T> {
    let resolve: Deferred<T>["resolve"] = () => undefined;
    const promise = new Promise<T>((resolvePromise) => {
        resolve = resolvePromise;
    });

    return { promise, resolve };
}

interface SyncEnginePrivateAccess {
    applyMergedState: (
        state: CloudSyncState,
        existingSettings: Record<string, string>
    ) => Promise<unknown>;
    applySettings: (
        existing: Record<string, string>,
        desired: Record<string, string>
    ) => Promise<void>;
    buildSanitizedMergedStateForApplication: (args: {
        localSites: Site[];
        state: CloudSyncState;
    }) => CloudSyncState;
    getNextOpId: () => Promise<number>;
}

function createMonitor(args: {
    id: string;
    monitoring: boolean;
    type: Monitor["type"];
    url?: string;
}): Monitor {
    return {
        checkInterval: 60_000,
        history: [],
        id: args.id,
        monitoring: args.monitoring,
        responseTime: 0,
        retryAttempts: 0,
        status: "pending",
        timeout: 5_000,
        type: args.type,
        url: args.url,
    };
}

function canonicalizeSites(sites: Site[]): unknown {
    return sites
        .map((site) => ({
            identifier: site.identifier,
            monitoring: site.monitoring,
            monitors: site.monitors
                .map((monitor) => ({
                    checkInterval: monitor.checkInterval,
                    id: monitor.id,
                    monitoring: monitor.monitoring,
                    retryAttempts: monitor.retryAttempts,
                    timeout: monitor.timeout,
                    type: monitor.type,
                    url: monitor.url,
                }))
                .toSorted((a, b) => a.id.localeCompare(b.id)),
            name: site.name,
        }))
        .toSorted((a, b) => a.identifier.localeCompare(b.identifier));
}

describe("SyncEngine (ADR-016)", () => {
    it("applies remote sites whose identifiers match inherited object properties", async () => {
        const orchestrator = new InMemoryOrchestrator([]);
        const engine = new SyncEngine({
            orchestrator,
            settings: new InMemorySettingsAdapter(),
        });

        const state = JSON.parse(`{
            "monitor": {
                "monitor-1": {
                    "entityId": "monitor-1",
                    "entityType": "monitor",
                    "fields": {
                        "checkInterval": { "value": 60000, "write": { "deviceId": "remote", "opId": 3, "timestamp": 1 } },
                        "monitoring": { "value": true, "write": { "deviceId": "remote", "opId": 4, "timestamp": 1 } },
                        "retryAttempts": { "value": 3, "write": { "deviceId": "remote", "opId": 5, "timestamp": 1 } },
                        "siteIdentifier": { "value": "__proto__", "write": { "deviceId": "remote", "opId": 6, "timestamp": 1 } },
                        "timeout": { "value": 10000, "write": { "deviceId": "remote", "opId": 7, "timestamp": 1 } },
                        "type": { "value": "http", "write": { "deviceId": "remote", "opId": 8, "timestamp": 1 } },
                        "url": { "value": "https://example.com", "write": { "deviceId": "remote", "opId": 9, "timestamp": 1 } }
                    }
                }
            },
            "settings": {},
            "site": {
                "__proto__": {
                    "entityId": "__proto__",
                    "entityType": "site",
                    "fields": {
                        "monitoring": { "value": true, "write": { "deviceId": "remote", "opId": 1, "timestamp": 1 } },
                        "name": { "value": "Prototype site", "write": { "deviceId": "remote", "opId": 2, "timestamp": 1 } }
                    }
                }
            }
        }`) as CloudSyncState;

        await (engine as unknown as SyncEnginePrivateAccess).applyMergedState(
            state,
            {}
        );

        const sites = await orchestrator.getSites();

        expect(sites).toHaveLength(1);
        expect(sites[0]?.identifier).toBe("__proto__");
        expect(sites[0]?.name).toBe("Prototype site");
        expect(sites[0]?.monitors).toHaveLength(1);
        expect(sites[0]?.monitors[0]?.id).toBe("monitor-1");
    });

    it("deletes synced settings whose keys match inherited object properties", async () => {
        const settings = new InMemorySettingsAdapter();
        await settings.set("__proto__", "old-prototype-value");
        await settings.set("toString", "old-value");

        const engine = new SyncEngine({
            orchestrator: new InMemoryOrchestrator([]),
            settings,
        });

        const existing = Object.create(null) as Record<string, string>;
        Object.defineProperty(existing, "__proto__", {
            configurable: true,
            enumerable: true,
            value: "old-prototype-value",
            writable: true,
        });
        Object.defineProperty(existing, "toString", {
            configurable: true,
            enumerable: true,
            value: "old-value",
            writable: true,
        });

        await (engine as unknown as SyncEnginePrivateAccess).applySettings(
            existing,
            {}
        );

        expect(await settings.get("__proto__")).toBeUndefined();
        expect(await settings.get("toString")).toBeUndefined();
    });

    it("keeps sanitized sync state maps as null-prototype dictionaries", () => {
        const engine = new SyncEngine({
            orchestrator: new InMemoryOrchestrator([]),
            settings: new InMemorySettingsAdapter(),
        });

        const write = {
            deviceId: "device-1",
            opId: 1,
            timestamp: 1,
        };
        const state = {
            monitor: {
                "monitor-1": {
                    entityId: "monitor-1",
                    entityType: "monitor",
                    fields: {
                        checkInterval: {
                            value: DEFAULT_CHECK_INTERVAL,
                            write,
                        },
                        monitoring: {
                            value: true,
                            write,
                        },
                        retryAttempts: {
                            value: 3,
                            write,
                        },
                        siteIdentifier: {
                            value: "site-1",
                            write,
                        },
                        timeout: {
                            value: DEFAULT_REQUEST_TIMEOUT,
                            write,
                        },
                        type: {
                            value: "http",
                            write,
                        },
                        url: {
                            value: "https://example.com",
                            write,
                        },
                    },
                },
            },
            settings: {},
            site: {
                "site-1": {
                    entityId: "site-1",
                    entityType: "site",
                    fields: {
                        monitoring: {
                            value: true,
                            write,
                        },
                        name: {
                            value: "Valid site",
                            write,
                        },
                    },
                },
            },
        } satisfies CloudSyncState;

        const sanitized = (
            engine as unknown as SyncEnginePrivateAccess
        ).buildSanitizedMergedStateForApplication({
            localSites: [],
            state,
        });

        expect(Object.getPrototypeOf(sanitized.site)).toBeNull();
        expect(Object.getPrototypeOf(sanitized.monitor)).toBeNull();
        expect(Object.hasOwn(sanitized.site, "site-1")).toBeTruthy();
        expect(sanitized.site["site-1"]?.entityId).toBe("site-1");
        expect(Object.hasOwn(sanitized.monitor, "monitor-1")).toBeTruthy();
        expect(sanitized.monitor["monitor-1"]?.entityId).toBe("monitor-1");
    });

    it("converges configuration across two devices", async () => {
        vi.useFakeTimers();

        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });

            const siteA: Site = {
                identifier: "example.com",
                monitoring: true,
                monitors: [
                    createMonitor({
                        id: "monitor-1",
                        monitoring: true,
                        type: "http",
                        url: "https://example.com",
                    }),
                ],
                name: "Example",
            };

            const orchestratorA = new InMemoryOrchestrator([siteA]);
            const settingsA = new InMemorySettingsAdapter();
            const engineA = new SyncEngine({
                orchestrator: orchestratorA,
                settings: settingsA,
            });

            vi.setSystemTime(new Date(1_000));
            await engineA.syncNow(provider);

            const orchestratorB = new InMemoryOrchestrator([]);
            const settingsB = new InMemorySettingsAdapter();
            const engineB = new SyncEngine({
                orchestrator: orchestratorB,
                settings: settingsB,
            });

            vi.setSystemTime(new Date(2_000));
            await engineB.syncNow(provider);

            expect(canonicalizeSites(await orchestratorB.getSites())).toEqual(
                canonicalizeSites(await orchestratorA.getSites())
            );

            await orchestratorB.updateSite("example.com", {
                name: "Example Renamed",
            });

            vi.setSystemTime(new Date(3_000));
            await engineB.syncNow(provider);

            vi.setSystemTime(new Date(4_000));
            await engineA.syncNow(provider);

            expect(canonicalizeSites(await orchestratorA.getSites())).toEqual(
                canonicalizeSites(await orchestratorB.getSites())
            );
            expect((await orchestratorA.getSites())[0]?.name).toBe(
                "Example Renamed"
            );
        } finally {
            vi.useRealTimers();
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("retains operation logs so a losing manifest race can recover", async () => {
        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-manifest-race-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });
            const aListedOperations = createDeferred<undefined>();
            const resumeA = createDeferred<undefined>();
            const providerA = {
                deleteObject: async (key) => provider.deleteObject(key),
                downloadBackup: async (key) => provider.downloadBackup(key),
                downloadObject: async (key) => provider.downloadObject(key),
                isConnected: async () => provider.isConnected(),
                kind: provider.kind,
                listBackups: async () => provider.listBackups(),
                listObjects: async (prefix) => {
                    const entries = await provider.listObjects(prefix);
                    if (prefix.startsWith("sync/devices/")) {
                        aListedOperations.resolve(undefined);
                        await resumeA.promise;
                    }
                    return entries;
                },
                uploadBackup: async (args) => provider.uploadBackup(args),
                uploadObject: async (args) => provider.uploadObject(args),
            } satisfies Parameters<SyncEngine["syncNow"]>[0];

            const siteA: Site = {
                identifier: "a.example.com",
                monitoring: true,
                monitors: [
                    createMonitor({
                        id: "monitor-a",
                        monitoring: true,
                        type: "http",
                        url: "https://a.example.com",
                    }),
                ],
                name: "Site A",
            };
            const siteB: Site = {
                identifier: "b.example.com",
                monitoring: true,
                monitors: [
                    createMonitor({
                        id: "monitor-b",
                        monitoring: true,
                        type: "http",
                        url: "https://b.example.com",
                    }),
                ],
                name: "Site B",
            };
            const settingsA = new InMemorySettingsAdapter();
            const settingsB = new InMemorySettingsAdapter();
            await settingsA.set("cloud.sync.deviceId", "device-a");
            await settingsB.set("cloud.sync.deviceId", "device-b");
            const engineA = new SyncEngine({
                orchestrator: new InMemoryOrchestrator([siteA]),
                settings: settingsA,
            });
            const engineB = new SyncEngine({
                orchestrator: new InMemoryOrchestrator([siteB]),
                settings: settingsB,
            });

            const syncA = engineA.syncNow(providerA);
            await aListedOperations.promise;
            await engineB.syncNow(provider);
            resumeA.resolve(undefined);
            await syncA;

            const operationObjects =
                await provider.listObjects("sync/devices/");
            expect(operationObjects).toHaveLength(2);

            const recoveryOrchestrator = new InMemoryOrchestrator([]);
            const recoverySettings = new InMemorySettingsAdapter();
            await recoverySettings.set("cloud.sync.deviceId", "device-c");
            const recoveryEngine = new SyncEngine({
                orchestrator: recoveryOrchestrator,
                settings: recoverySettings,
            });

            await recoveryEngine.syncNow(provider);

            expect(
                (await recoveryOrchestrator.getSites())
                    .map((site) => site.identifier)
                    .toSorted()
            ).toEqual(["a.example.com", "b.example.com"]);
        } finally {
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("aborts when the referenced snapshot is corrupt", async () => {
        vi.useFakeTimers();

        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });

            const warnSpy = vi.spyOn(logger, "warn");

            const remoteDeviceId = "remote-device";
            const snapshotKey = `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1.json`;

            // The operation log is intentionally complete. Sync still must not
            // guess that it can replace an unreadable authoritative snapshot.
            await provider.uploadObject({
                buffer: Buffer.from("{", "utf8"),
                key: snapshotKey,
                overwrite: true,
            });

            const monitorId = crypto.randomUUID();
            const opObjectKey = "sync/devices/remote-device/ops/2-0-9.ndjson";
            const ops = [
                {
                    deviceId: remoteDeviceId,
                    entityId: "example.com",
                    entityType: "site",
                    field: "name",
                    kind: "set-field",
                    opId: 0,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "Remote Name",
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: "example.com",
                    entityType: "site",
                    field: "monitoring",
                    kind: "set-field",
                    opId: 1,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: true,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: "example.com",
                    entityType: "site",
                    field: "isEnabled",
                    kind: "set-field",
                    opId: 2,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: true,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "siteIdentifier",
                    kind: "set-field",
                    opId: 3,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "example.com",
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "type",
                    kind: "set-field",
                    opId: 4,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "http",
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "url",
                    kind: "set-field",
                    opId: 5,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "https://example.com",
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "monitoring",
                    kind: "set-field",
                    opId: 6,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: true,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "checkInterval",
                    kind: "set-field",
                    opId: 7,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: 60_000,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "retryAttempts",
                    kind: "set-field",
                    opId: 8,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: 1,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "timeout",
                    kind: "set-field",
                    opId: 9,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: 10_000,
                },
            ];

            await provider.uploadObject({
                buffer: Buffer.from(
                    `${ops.map((op) => JSON.stringify(op)).join("\n")}\n`,
                    "utf8"
                ),
                key: opObjectKey,
                overwrite: true,
            });

            await provider.uploadObject({
                buffer: Buffer.from(
                    JSON.stringify({
                        devices: {
                            [remoteDeviceId]: {
                                compactedUpToOpId: 9,
                                lastSeenAt: 1,
                            },
                        },
                        latestSnapshotKey: snapshotKey,
                        manifestVersion: 1,
                        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    }),
                    "utf8"
                ),
                key: "manifest.json",
                overwrite: true,
            });

            const deleteSpy = vi.spyOn(provider, "deleteObject");
            const uploadSpy = vi.spyOn(provider, "uploadObject");

            const orchestrator = new InMemoryOrchestrator([]);
            const settings = new InMemorySettingsAdapter();
            const engine = new SyncEngine({
                orchestrator,
                settings,
            });

            await expect(engine.syncNow(provider)).rejects.toThrow(
                "invalid JSON"
            );

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to load remote snapshot"),
                expect.objectContaining({
                    key: snapshotKey,
                })
            );

            const sites = await orchestrator.getSites();
            expect(sites).toEqual([]);
            expect(deleteSpy).not.toHaveBeenCalled();
            expect(uploadSpy).not.toHaveBeenCalled();
            warnSpy.mockRestore();
        } finally {
            vi.useRealTimers();
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("does not mutate remote or local state when snapshot download fails", async () => {
        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-snapshot-failure-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });
            const snapshotKey = `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1.json`;

            await provider.uploadObject({
                buffer: Buffer.from(
                    JSON.stringify({
                        createdAt: 1,
                        snapshotVersion: 1,
                        state: {
                            monitor: {},
                            settings: {},
                            site: {},
                        },
                        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    }),
                    "utf8"
                ),
                key: snapshotKey,
                overwrite: true,
            });
            await provider.uploadObject({
                buffer: Buffer.from(
                    JSON.stringify({
                        devices: {},
                        latestSnapshotKey: snapshotKey,
                        manifestVersion: 1,
                        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    }),
                    "utf8"
                ),
                key: "manifest.json",
                overwrite: true,
            });

            const originalDownloadObject =
                provider.downloadObject.bind(provider);
            vi.spyOn(provider, "downloadObject").mockImplementation(
                async (key) => {
                    if (key === snapshotKey) {
                        throw new Error("temporary provider failure");
                    }

                    return originalDownloadObject(key);
                }
            );
            const deleteSpy = vi.spyOn(provider, "deleteObject");
            const uploadSpy = vi.spyOn(provider, "uploadObject");
            const warnSpy = vi
                .spyOn(logger, "warn")
                .mockImplementation(() => {});

            const localSite: Site = {
                identifier: "local.example.com",
                monitoring: true,
                monitors: [],
                name: "Local site",
            };
            const orchestrator = new InMemoryOrchestrator([localSite]);
            const settings = new InMemorySettingsAdapter();
            await settings.set("cloud.sync.deviceId", "local-device");
            const engine = new SyncEngine({ orchestrator, settings });

            await expect(engine.syncNow(provider)).rejects.toThrow(
                "Failed to read cloud sync snapshot"
            );

            expect(warnSpy).toHaveBeenCalledWith(
                "[SyncEngine] Failed to load remote snapshot; aborting sync",
                {
                    key: snapshotKey,
                    message: expect.stringContaining(
                        "Failed to read cloud sync snapshot"
                    ),
                }
            );
            expect(deleteSpy).not.toHaveBeenCalled();
            expect(uploadSpy).not.toHaveBeenCalled();
            expect(await orchestrator.getSites()).toEqual([localSite]);
            expect(
                await settings.get("cloud.sync.baseline.v1")
            ).toBeUndefined();
        } finally {
            vi.restoreAllMocks();
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("fills missing monitor defaults when writing snapshots", async () => {
        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-defaults-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });

            const remoteDeviceId = "remote";
            const siteId = "example.com";
            const monitorId = crypto.randomUUID();

            const opsKey = "sync/devices/remote/ops/2-0-4.ndjson";
            const ops = [
                {
                    deviceId: remoteDeviceId,
                    entityId: siteId,
                    entityType: "site",
                    field: "monitoring",
                    kind: "set-field",
                    opId: 0,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: true,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: siteId,
                    entityType: "site",
                    field: "name",
                    kind: "set-field",
                    opId: 1,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "Example",
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "siteIdentifier",
                    kind: "set-field",
                    opId: 2,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: siteId,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "type",
                    kind: "set-field",
                    opId: 3,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "http",
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "url",
                    kind: "set-field",
                    opId: 4,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "https://example.com",
                },
            ];

            await provider.uploadObject({
                buffer: Buffer.from(
                    `${ops.map((op) => JSON.stringify(op)).join("\n")}\n`,
                    "utf8"
                ),
                key: opsKey,
                overwrite: true,
            });

            const orchestrator = new InMemoryOrchestrator([]);
            const settings = new InMemorySettingsAdapter();
            const engine = new SyncEngine({ orchestrator, settings });

            await engine.syncNow(provider);

            const snapshotEntries = await provider.listObjects(
                `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/`
            );
            expect(snapshotEntries.length).toBeGreaterThan(0);

            const snapshotKey = snapshotEntries.find((entry) =>
                entry.key.endsWith(".json")
            )?.key;
            expect(snapshotKey).toBeTruthy();

            const snapshotRaw = Buffer.from(
                await provider.downloadObject(snapshotKey!)
            ).toString("utf8");
            const snapshotJson: unknown = JSON.parse(snapshotRaw);

            // Verify that defaults are present in the snapshot state for the
            // monitor entry.
            if (!isRecord(snapshotJson)) {
                throw new TypeError("Expected snapshot JSON object");
            }

            const state = snapshotJson["state"];
            if (!isRecord(state)) {
                throw new TypeError("Expected snapshot state object");
            }

            const monitor = state["monitor"];
            if (!isRecord(monitor)) {
                throw new TypeError("Expected snapshot monitor object");
            }

            const monitorState = monitor[monitorId];
            if (!isRecord(monitorState)) {
                throw new TypeError("Expected snapshot monitor state object");
            }

            const fields = monitorState["fields"];
            if (!isRecord(fields)) {
                throw new TypeError("Expected snapshot monitor fields object");
            }

            const checkIntervalField = fields["checkInterval"];
            const retryAttemptsField = fields["retryAttempts"];
            const timeoutField = fields["timeout"];
            const monitoringField = fields["monitoring"];

            if (
                !isRecord(checkIntervalField) ||
                !isRecord(retryAttemptsField) ||
                !isRecord(timeoutField) ||
                !isRecord(monitoringField)
            ) {
                throw new TypeError("Expected snapshot monitor field entries");
            }

            expect(checkIntervalField["value"]).toBe(DEFAULT_CHECK_INTERVAL);
            expect(retryAttemptsField["value"]).toBe(3);
            expect(timeoutField["value"]).toBe(DEFAULT_REQUEST_TIMEOUT);
            expect(monitoringField["value"]).toBeTruthy();
        } finally {
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("drops invalid remote monitors/sites from the snapshot state", async () => {
        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-sanitize-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });

            const remoteDeviceId = "remote";
            const siteId = "invalid.example";
            const monitorId = crypto.randomUUID();

            // Build a remote monitor that will pass CloudSyncMonitorConfig
            // parsing but will fail strict monitor validation because it's
            // missing an HTTP URL.
            const opsKey = "sync/devices/remote/ops/2-0-6.ndjson";
            const ops = [
                {
                    deviceId: remoteDeviceId,
                    entityId: siteId,
                    entityType: "site",
                    field: "monitoring",
                    kind: "set-field",
                    opId: 0,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: true,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: siteId,
                    entityType: "site",
                    field: "name",
                    kind: "set-field",
                    opId: 1,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "Invalid Site",
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "siteIdentifier",
                    kind: "set-field",
                    opId: 2,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: siteId,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "type",
                    kind: "set-field",
                    opId: 3,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "http",
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "monitoring",
                    kind: "set-field",
                    opId: 4,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: true,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "checkInterval",
                    kind: "set-field",
                    opId: 5,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: 60_000,
                },
                {
                    deviceId: remoteDeviceId,
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "retryAttempts",
                    kind: "set-field",
                    opId: 6,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: 1,
                },
                // Timeout is omitted on purpose; normalizeCloudSyncState will
                // fill it, but URL will still be missing.
            ];

            await provider.uploadObject({
                buffer: Buffer.from(
                    `${ops.map((op) => JSON.stringify(op)).join("\n")}\n`,
                    "utf8"
                ),
                key: opsKey,
                overwrite: true,
            });

            const orchestrator = new InMemoryOrchestrator([]);
            const settings = new InMemorySettingsAdapter();
            const engine = new SyncEngine({ orchestrator, settings });

            const result = await engine.syncNow(provider);
            expect(result.snapshotKey).toBeTruthy();

            const snapshotRaw = Buffer.from(
                await provider.downloadObject(result.snapshotKey!)
            ).toString("utf8");
            const snapshotJson: unknown = JSON.parse(snapshotRaw);

            if (!isRecord(snapshotJson)) {
                throw new TypeError("Expected snapshot JSON object");
            }

            const state = snapshotJson["state"];
            if (!isRecord(state)) {
                throw new TypeError("Expected snapshot state object");
            }

            const monitorState = state["monitor"];
            const siteState = state["site"];

            if (!isRecord(monitorState) || !isRecord(siteState)) {
                throw new TypeError("Expected snapshot monitor/site objects");
            }

            expect(siteState[siteId]).toBeUndefined();
            expect(monitorState[monitorId]).toBeUndefined();
        } finally {
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("does not crash sync when applying a remote site fails", async () => {
        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-invalid-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });

            const siteId = "example.com";
            const monitorId = crypto.randomUUID();

            // Create remote ops defining a valid HTTP monitor/site. We then force
            // orchestrator.addSite to throw to emulate a validation failure.
            const opsKey = `sync/devices/remote/ops/${Date.now()}-0-9.ndjson`;
            const ops = [
                {
                    deviceId: "remote",
                    entityId: siteId,
                    entityType: "site",
                    field: "name",
                    kind: "set-field",
                    opId: 0,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: siteId,
                },
                {
                    deviceId: "remote",
                    entityId: siteId,
                    entityType: "site",
                    field: "monitoring",
                    kind: "set-field",
                    opId: 1,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: true,
                },
                {
                    deviceId: "remote",
                    entityId: siteId,
                    entityType: "site",
                    field: "isEnabled",
                    kind: "set-field",
                    opId: 2,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: true,
                },
                {
                    deviceId: "remote",
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "siteIdentifier",
                    kind: "set-field",
                    opId: 3,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: siteId,
                },
                {
                    deviceId: "remote",
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "type",
                    kind: "set-field",
                    opId: 4,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "http",
                },
                {
                    deviceId: "remote",
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "url",
                    kind: "set-field",
                    opId: 5,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: "https://example.com",
                },
                {
                    deviceId: "remote",
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "monitoring",
                    kind: "set-field",
                    opId: 6,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: true,
                },
                {
                    deviceId: "remote",
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "checkInterval",
                    kind: "set-field",
                    opId: 7,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: 60_000,
                },
                {
                    deviceId: "remote",
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "retryAttempts",
                    kind: "set-field",
                    opId: 8,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: 1,
                },
                {
                    deviceId: "remote",
                    entityId: monitorId,
                    entityType: "monitor",
                    field: "timeout",
                    kind: "set-field",
                    opId: 9,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    timestamp: 1,
                    value: 10_000,
                },
            ];

            await provider.uploadObject({
                buffer: Buffer.from(
                    `${ops.map((op) => JSON.stringify(op)).join("\n")}\n`,
                    "utf8"
                ),
                key: opsKey,
                overwrite: true,
            });

            const orchestrator = new InMemoryOrchestrator([]);
            vi.spyOn(orchestrator, "addSite").mockRejectedValueOnce(
                new Error("Site validation failed")
            );
            const settings = new InMemorySettingsAdapter();
            const engine = new SyncEngine({ orchestrator, settings });

            await expect(engine.syncNow(provider)).resolves.toBeTruthy();
            expect(orchestrator.addSite).toHaveBeenCalledTimes(1);
        } finally {
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("advances nextOpId from remote manifest compaction metadata", async () => {
        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-nextOpId-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });

            await provider.uploadObject({
                buffer: Buffer.from(
                    JSON.stringify({
                        devices: {
                            "device-a": {
                                compactedUpToOpId: 10,
                                lastSeenAt: 1,
                            },
                        },
                        manifestVersion: 1,
                        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    }),
                    "utf8"
                ),
                key: "manifest.json",
                overwrite: true,
            });

            const orchestrator = new InMemoryOrchestrator([]);
            const settings = new InMemorySettingsAdapter();
            await settings.set("cloud.sync.deviceId", "device-a");
            await settings.set("cloud.sync.nextOpId", "0");

            const engine = new SyncEngine({ orchestrator, settings });
            await engine.syncNow(provider);

            await expect(settings.get("cloud.sync.nextOpId")).resolves.toBe(
                "11"
            );
        } finally {
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("rejects non-decimal persisted nextOpId values", async () => {
        const settings = new InMemorySettingsAdapter();
        const engine = new SyncEngine({
            orchestrator: new InMemoryOrchestrator([]),
            settings,
        }) as unknown as SyncEnginePrivateAccess;

        await settings.set("cloud.sync.nextOpId", "42");
        await expect(engine.getNextOpId()).resolves.toBe(42);

        for (const value of [
            "1e3",
            "0x10",
            "1.5",
            "-1",
        ]) {
            await settings.set("cloud.sync.nextOpId", value);
            await expect(engine.getNextOpId()).resolves.toBe(0);
        }
    });

    it("logs compacted remote sync object delete failures without failing sync", async () => {
        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-cleanup-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });
            const previousSnapshotKey = `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1.json`;

            await provider.uploadObject({
                buffer: Buffer.from(
                    JSON.stringify({
                        createdAt: 1,
                        snapshotVersion: 1,
                        state: {
                            monitor: {},
                            settings: {},
                            site: {},
                        },
                        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    }),
                    "utf8"
                ),
                key: previousSnapshotKey,
                overwrite: true,
            });

            await provider.uploadObject({
                buffer: Buffer.from(
                    JSON.stringify({
                        devices: {},
                        latestSnapshotKey: previousSnapshotKey,
                        manifestVersion: 1,
                        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    }),
                    "utf8"
                ),
                key: "manifest.json",
                overwrite: true,
            });

            const warnSpy = vi
                .spyOn(logger, "warn")
                .mockImplementation(() => {});

            const providerWithFailingDelete = {
                deleteObject: async (key: string) => {
                    if (key === previousSnapshotKey) {
                        throw new Error("delete denied");
                    }

                    await provider.deleteObject(key);
                },
                downloadBackup: async (
                    ...args: Parameters<
                        FilesystemCloudStorageProvider["downloadBackup"]
                    >
                ) => await provider.downloadBackup(...args),
                downloadObject: async (key: string) =>
                    await provider.downloadObject(key),
                isConnected: async () => await provider.isConnected(),
                kind: provider.kind,
                listBackups: async (
                    ...args: Parameters<
                        FilesystemCloudStorageProvider["listBackups"]
                    >
                ) => await provider.listBackups(...args),
                listObjects: async (prefix: string) =>
                    await provider.listObjects(prefix),
                uploadBackup: async (
                    ...args: Parameters<
                        FilesystemCloudStorageProvider["uploadBackup"]
                    >
                ) => await provider.uploadBackup(...args),
                uploadObject: async (
                    args: Parameters<
                        FilesystemCloudStorageProvider["uploadObject"]
                    >[0]
                ) => await provider.uploadObject(args),
            };

            const engine = new SyncEngine({
                orchestrator: new InMemoryOrchestrator([]),
                settings: new InMemorySettingsAdapter(),
            });

            await expect(
                engine.syncNow(providerWithFailingDelete)
            ).resolves.toBeTruthy();

            expect(warnSpy).toHaveBeenCalledWith(
                "[SyncEngine] Failed to delete compacted remote sync object; continuing",
                {
                    key: previousSnapshotKey,
                    message: "delete denied",
                }
            );

            warnSpy.mockRestore();
        } finally {
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("regenerates an invalid stored deviceId instead of crashing sync", async () => {
        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-deviceId-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });

            const orchestrator = new InMemoryOrchestrator([]);
            const settings = new InMemorySettingsAdapter();
            await settings.set("cloud.sync.deviceId", " bad ");

            const engine = new SyncEngine({ orchestrator, settings });
            await expect(engine.syncNow(provider)).resolves.toBeTruthy();

            const stored = await settings.get("cloud.sync.deviceId");
            expect(stored).toBeTypeOf("string");
            expect(stored).not.toBe(" bad ");
            expect(stored?.trim()).toBe(stored);
        } finally {
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });

    it("ensures op object keys use createdAt >= resetAt", async () => {
        vi.useFakeTimers();

        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-resetAt-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });

            const uploadedKeys: string[] = [];
            const recordingProvider: FilesystemCloudStorageProvider & {
                uploadObject: FilesystemCloudStorageProvider["uploadObject"];
            } = provider;

            const providerWithRecording = {
                deleteObject: async (key: string) => {
                    await recordingProvider.deleteObject(key);
                },
                downloadBackup: async (
                    ...args: Parameters<
                        FilesystemCloudStorageProvider["downloadBackup"]
                    >
                ) => await recordingProvider.downloadBackup(...args),
                downloadObject: async (key: string) =>
                    await recordingProvider.downloadObject(key),
                isConnected: async () => await recordingProvider.isConnected(),
                kind: recordingProvider.kind,
                listBackups: async (
                    ...args: Parameters<
                        FilesystemCloudStorageProvider["listBackups"]
                    >
                ) => await recordingProvider.listBackups(...args),
                listObjects: async (prefix: string) =>
                    await recordingProvider.listObjects(prefix),
                uploadBackup: async (
                    ...args: Parameters<
                        FilesystemCloudStorageProvider["uploadBackup"]
                    >
                ) => await recordingProvider.uploadBackup(...args),
                uploadObject: async (
                    args: Parameters<
                        FilesystemCloudStorageProvider["uploadObject"]
                    >[0]
                ) => {
                    uploadedKeys.push(args.key);
                    return await recordingProvider.uploadObject(args);
                },
            };

            // Remote manifest indicates history reset at t=2000.
            await provider.uploadObject({
                buffer: Buffer.from(
                    JSON.stringify({
                        devices: {},
                        manifestVersion: 1,
                        resetAt: 2_000,
                        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    }),
                    "utf8"
                ),
                key: "manifest.json",
                overwrite: true,
            });

            const site: Site = {
                identifier: "example.com",
                monitoring: true,
                monitors: [
                    createMonitor({
                        id: "monitor-1",
                        monitoring: true,
                        type: "http",
                        url: "https://example.com",
                    }),
                ],
                name: "Example",
            };

            const orchestrator = new InMemoryOrchestrator([site]);
            const settings = new InMemorySettingsAdapter();
            await settings.set("cloud.sync.deviceId", "device-a");
            await settings.set("cloud.sync.nextOpId", "0");

            const engine = new SyncEngine({ orchestrator, settings });

            // Simulate local clock behind resetAt.
            vi.setSystemTime(new Date(1_000));
            await engine.syncNow(providerWithRecording);

            const opKey = uploadedKeys.find((key) =>
                key.startsWith("sync/devices/device-a/ops/")
            );
            expect(opKey).toBeTruthy();

            const fileName = opKey!.split("/").at(-1);
            expect(fileName).toBeTruthy();

            const createdAtRaw = fileName!.split("-", 1)[0];
            expect(Number(createdAtRaw)).toBeGreaterThanOrEqual(2_000);
        } finally {
            vi.useRealTimers();
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });
});

/* eslint-enable unicorn/numeric-separators-style */
