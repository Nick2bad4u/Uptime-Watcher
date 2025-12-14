import type { Monitor, Site } from "@shared/types";
import type { CloudSyncManifest } from "@shared/types/cloudSyncManifest";
import type { CloudSyncSnapshot } from "@shared/types/cloudSyncSnapshot";
import type { CloudSyncState } from "@shared/types/cloudSyncState";

import {
    CLOUD_SYNC_SCHEMA_VERSION,
    type CloudSyncOperation,
    type JsonValue,
    jsonValueSchema,
} from "@shared/types/cloudSync";
import {
    CLOUD_SYNC_BASELINE_VERSION,
    type CloudSyncBaseline,
    parseCloudSyncBaseline,
} from "@shared/types/cloudSyncBaseline";
import {
    type CloudSyncMonitorConfig,
    cloudSyncMonitorConfigSchema,
    type CloudSyncSettingsConfig,
    cloudSyncSettingsConfigSchema,
    type CloudSyncSiteConfig,
    cloudSyncSiteConfigSchema,
} from "@shared/types/cloudSyncDomain";
import { stringifyJsonValueStable } from "@shared/utils/canonicalJson";
import { applyCloudSyncOperationsToState } from "@shared/utils/cloudSyncState";

import type { CloudStorageProvider } from "../cloud/providers/CloudStorageProvider.types";

import { ProviderCloudSyncTransport } from "./ProviderCloudSyncTransport";

/**
 * Orchestrator facade used by {@link SyncEngine} to apply merged domain state.
 */
export interface SyncEngineOrchestrator {
    /** Creates a new site (including monitors). */
    addSite: (site: Site) => Promise<Site>;
    /** Returns the current in-memory site list. */
    getSites: () => Promise<Site[]>;
    /** Removes a site by identifier. */
    removeSite: (identifier: string) => Promise<boolean>;
    /** Updates a site by identifier. */
    updateSite: (identifier: string, updates: Partial<Site>) => Promise<Site>;
}

/**
 * Settings adapter used by {@link SyncEngine}.
 */
export interface SyncEngineSettingsAdapter {
    /** Deletes a settings key. */
    delete: (key: string) => Promise<void>;
    /** Reads a settings key. */
    get: (key: string) => Promise<string | undefined>;
    /** Reads all settings as a key/value map. */
    getAll: () => Promise<Record<string, string>>;
    /** Writes a settings key. */
    set: (key: string, value: string) => Promise<void>;
}

/**
 * Summary of a single sync run.
 */
export interface SyncEngineResult {
    /** Count of remote operations applied (after compaction filtering). */
    appliedRemoteOperations: number;
    /** Count of operations emitted locally during this run. */
    emittedLocalOperations: number;
    /** Count of non-deleted entities in the merged state. */
    mergedEntities: number;
    /** Snapshot key written during this run (if any). */
    snapshotKey: null | string;
}

/**
 * Narrow interface for components that can perform a sync cycle.
 */
export interface CloudSyncEngine {
    syncNow: (provider: CloudStorageProvider) => Promise<SyncEngineResult>;
}

const SETTINGS_KEY_DEVICE_ID = "cloud.sync.deviceId" as const;
const SETTINGS_KEY_NEXT_OP_ID = "cloud.sync.nextOpId" as const;
const SETTINGS_KEY_BASELINE = "cloud.sync.baseline.v1" as const;

const SETTINGS_KEY_PREFIX_CLOUD = "cloud." as const;

const EMPTY_STATE: CloudSyncState = {
    monitor: {},
    settings: {},
    site: {},
};

function shouldSyncSettingKey(key: string): boolean {
    return !key.startsWith(SETTINGS_KEY_PREFIX_CLOUD);
}

function removeUndefinedEntries(
    value: Record<string, unknown>
): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(value)) {
        if (entryValue !== undefined) {
            result[key] = entryValue;
        }
    }

    return result;
}

// eslint-disable-next-line sonarjs/function-return-type -- Wrapper around schema.parse; may throw on invalid input.
function toJsonValue(value: unknown): JsonValue {
    return jsonValueSchema.parse(value);
}

function areJsonValuesEqual(a: unknown, b: unknown): boolean {
    try {
        const aJson = a === undefined ? null : toJsonValue(a);
        const bJson = b === undefined ? null : toJsonValue(b);
        return (
            stringifyJsonValueStable(aJson) === stringifyJsonValueStable(bJson)
        );
    } catch {
        return false;
    }
}

function toMonitorConfig(
    siteIdentifier: string,
    monitor: Monitor
): CloudSyncMonitorConfig {
    return cloudSyncMonitorConfigSchema.parse(
        removeUndefinedEntries({
            baselineUrl: monitor.baselineUrl,
            bodyKeyword: monitor.bodyKeyword,
            certificateWarningDays: monitor.certificateWarningDays,
            checkInterval: monitor.checkInterval,
            edgeLocations: monitor.edgeLocations,
            expectedHeaderValue: monitor.expectedHeaderValue,
            expectedJsonValue: monitor.expectedJsonValue,
            expectedStatusCode: monitor.expectedStatusCode,
            expectedValue: monitor.expectedValue,
            headerName: monitor.headerName,
            heartbeatExpectedStatus: monitor.heartbeatExpectedStatus,
            heartbeatMaxDriftSeconds: monitor.heartbeatMaxDriftSeconds,
            heartbeatStatusField: monitor.heartbeatStatusField,
            heartbeatTimestampField: monitor.heartbeatTimestampField,
            host: monitor.host,
            id: monitor.id,
            jsonPath: monitor.jsonPath,
            maxPongDelayMs: monitor.maxPongDelayMs,
            maxReplicationLagSeconds: monitor.maxReplicationLagSeconds,
            maxResponseTime: monitor.maxResponseTime,
            monitoring: monitor.monitoring,
            port: monitor.port,
            primaryStatusUrl: monitor.primaryStatusUrl,
            recordType: monitor.recordType,
            replicaStatusUrl: monitor.replicaStatusUrl,
            replicationTimestampField: monitor.replicationTimestampField,
            retryAttempts: monitor.retryAttempts,
            siteIdentifier,
            timeout: monitor.timeout,
            type: monitor.type,
            url: monitor.url,
        })
    );
}

function toSiteConfig(site: Site): CloudSyncSiteConfig {
    const { identifier, monitoring, name } = site;
    return cloudSyncSiteConfigSchema.parse({
        identifier,
        monitoring,
        name,
    });
}

function toSettingsConfig(
    settings: Record<string, string>
): CloudSyncSettingsConfig {
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(settings)) {
        if (shouldSyncSettingKey(key)) {
            filtered[key] = value;
        }
    }

    return cloudSyncSettingsConfigSchema.parse(filtered);
}

function createEmptyBaseline(): CloudSyncBaseline {
    return {
        baselineVersion: CLOUD_SYNC_BASELINE_VERSION,
        createdAt: 0,
        monitors: {},
        settings: {},
        sites: {},
        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
    };
}

function stringifyBaseline(baseline: CloudSyncBaseline): string {
    return JSON.stringify(baseline, null, 2);
}

function parseBaseline(raw: string): CloudSyncBaseline {
    try {
        return parseCloudSyncBaseline(JSON.parse(raw));
    } catch {
        return createEmptyBaseline();
    }
}

function buildCanonicalLocalState(
    sites: Site[],
    settings: Record<string, string>
): {
    monitors: Record<string, CloudSyncMonitorConfig>;
    settings: CloudSyncSettingsConfig;
    sites: Record<string, CloudSyncSiteConfig>;
} {
    const siteConfigs: Record<string, CloudSyncSiteConfig> = {};
    const monitorConfigs: Record<string, CloudSyncMonitorConfig> = {};

    for (const site of sites) {
        siteConfigs[site.identifier] = toSiteConfig(site);

        for (const monitor of site.monitors) {
            monitorConfigs[monitor.id] = toMonitorConfig(
                site.identifier,
                monitor
            );
        }
    }

    return {
        monitors: monitorConfigs,
        settings: toSettingsConfig(settings),
        sites: siteConfigs,
    };
}

function buildDesiredSitesFromSyncState(
    siteState: CloudSyncState["site"]
): Record<string, CloudSyncSiteConfig> {
    const desiredSites: Record<string, CloudSyncSiteConfig> = {};

    for (const [siteId, entity] of Object.entries(siteState)) {
        if (entity.deleted === undefined) {
            const nameValue = entity.fields["name"]?.value;
            const monitoringValue = entity.fields["monitoring"]?.value;

            const parsed = cloudSyncSiteConfigSchema.safeParse({
                identifier: siteId,
                monitoring:
                    typeof monitoringValue === "boolean"
                        ? monitoringValue
                        : true,
                name: typeof nameValue === "string" ? nameValue : siteId,
            });

            if (parsed.success) {
                desiredSites[siteId] = parsed.data;
            }
        }
    }

    return desiredSites;
}

function buildDesiredMonitorsFromSyncState(
    monitorState: CloudSyncState["monitor"]
): Record<string, CloudSyncMonitorConfig> {
    const desiredMonitors: Record<string, CloudSyncMonitorConfig> = {};

    for (const [monitorId, entity] of Object.entries(monitorState)) {
        if (entity.deleted === undefined) {
            const candidate: Record<string, unknown> = { id: monitorId };
            for (const [field, fieldValue] of Object.entries(entity.fields)) {
                if (field !== "id" && fieldValue.value !== null) {
                    candidate[field] = fieldValue.value;
                }
            }

            const parsed = cloudSyncMonitorConfigSchema.safeParse(candidate);
            if (parsed.success) {
                desiredMonitors[monitorId] = parsed.data;
            }
        }
    }

    return desiredMonitors;
}

function buildDesiredSettingsFromSyncState(
    settingsState: CloudSyncState["settings"]
): CloudSyncSettingsConfig {
    const desiredSettings: CloudSyncSettingsConfig = {};

    for (const [key, entity] of Object.entries(settingsState)) {
        if (shouldSyncSettingKey(key) && entity.deleted === undefined) {
            const value = entity.fields["value"]?.value;
            if (typeof value === "string") {
                desiredSettings[key] = value;
            }
        }
    }

    return desiredSettings;
}

function buildLocalOperations(args: {
    baseline: CloudSyncBaseline;
    current: ReturnType<typeof buildCanonicalLocalState>;
    deviceId: string;
    nextOpId: number;
    now: number;
}): { nextOpId: number; operations: CloudSyncOperation[] } {
    const operations: CloudSyncOperation[] = [];
    let opId = args.nextOpId;

    const monitorFields: ReadonlyArray<
        Exclude<keyof CloudSyncMonitorConfig, "id">
    > = [
        "baselineUrl",
        "bodyKeyword",
        "certificateWarningDays",
        "checkInterval",
        "edgeLocations",
        "expectedHeaderValue",
        "expectedJsonValue",
        "expectedStatusCode",
        "expectedValue",
        "headerName",
        "heartbeatExpectedStatus",
        "heartbeatMaxDriftSeconds",
        "heartbeatStatusField",
        "heartbeatTimestampField",
        "host",
        "jsonPath",
        "maxPongDelayMs",
        "maxReplicationLagSeconds",
        "maxResponseTime",
        "monitoring",
        "port",
        "primaryStatusUrl",
        "recordType",
        "replicaStatusUrl",
        "replicationTimestampField",
        "retryAttempts",
        "siteIdentifier",
        "timeout",
        "type",
        "url",
    ];

    const baselineSites = args.baseline.sites;
    const baselineMonitors = args.baseline.monitors;
    const baselineSettings = args.baseline.settings;

    const emitSetField = (
        entityType: CloudSyncOperation["entityType"],
        entityId: string,
        field: string,
        value: unknown
    ): void => {
        const currentOpId = opId;
        opId += 1;
        operations.push({
            deviceId: args.deviceId,
            entityId,
            entityType,
            field,
            kind: "set-field",
            opId: currentOpId,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: args.now,
            value: toJsonValue(value),
        });
    };

    const emitDelete = (
        entityType: CloudSyncOperation["entityType"],
        entityId: string
    ): void => {
        const currentOpId = opId;
        opId += 1;
        operations.push({
            deviceId: args.deviceId,
            entityId,
            entityType,
            kind: "delete-entity",
            opId: currentOpId,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: args.now,
        });
    };

    for (const [siteId, config] of Object.entries(args.current.sites)) {
        const baselineConfig = baselineSites[siteId];

        if (!areJsonValuesEqual(baselineConfig?.name ?? null, config.name)) {
            emitSetField("site", siteId, "name", config.name);
        }

        if (
            !areJsonValuesEqual(
                baselineConfig?.monitoring ?? null,
                config.monitoring
            )
        ) {
            emitSetField("site", siteId, "monitoring", config.monitoring);
        }
    }

    for (const [siteId] of Object.entries(baselineSites)) {
        if (!(siteId in args.current.sites)) {
            emitDelete("site", siteId);
        }
    }

    for (const [monitorId, config] of Object.entries(args.current.monitors)) {
        const baselineConfig = baselineMonitors[monitorId];

        for (const field of monitorFields) {
            const baselineValue = baselineConfig?.[field] ?? null;
            const currentValue = config[field] ?? null;

            if (!areJsonValuesEqual(baselineValue, currentValue)) {
                emitSetField("monitor", monitorId, field, currentValue);
            }
        }
    }

    for (const [monitorId] of Object.entries(baselineMonitors)) {
        if (!(monitorId in args.current.monitors)) {
            emitDelete("monitor", monitorId);
        }
    }

    const settingsKeys = new Set<string>([
        ...Object.keys(args.current.settings),
        ...Object.keys(baselineSettings),
    ]);

    for (const key of settingsKeys) {
        const currentValue = args.current.settings[key];
        const baselineValue = baselineSettings[key];

        if (currentValue === undefined) {
            if (baselineValue !== undefined) {
                emitDelete("settings", key);
            }
        } else if (!areJsonValuesEqual(baselineValue ?? null, currentValue)) {
            emitSetField("settings", key, "value", currentValue);
        }
    }

    return { nextOpId: opId, operations };
}

function getMaxOpIdByDevice(
    operations: readonly CloudSyncOperation[]
): Record<string, number> {
    const result: Record<string, number> = {};

    for (const op of operations) {
        result[op.deviceId] = Math.max(result[op.deviceId] ?? -1, op.opId);
    }

    return result;
}

function buildDefaultSnapshot(state: CloudSyncState): CloudSyncSnapshot {
    const createdAt = Date.now();
    return ProviderCloudSyncTransport.createSnapshot(createdAt, state);
}

/**
 * Sync engine implementing ADR-016 (operation log + snapshots).
 */
export class SyncEngine {
    private readonly orchestrator: SyncEngineOrchestrator;

    private readonly settings: SyncEngineSettingsAdapter;

    public async syncNow(
        provider: CloudStorageProvider
    ): Promise<SyncEngineResult> {
        const transport = ProviderCloudSyncTransport.create(provider);

        const deviceId = await this.getOrCreateDeviceId();
        const nextOpId = await this.getNextOpId();

        const [sites, allSettings] = await Promise.all([
            this.orchestrator.getSites(),
            this.settings.getAll(),
        ]);

        const current = buildCanonicalLocalState(sites, allSettings);

        const baseline = await this.getBaseline();
        const now = Date.now();

        const { nextOpId: updatedOpId, operations: localOps } =
            buildLocalOperations({
                baseline,
                current,
                deviceId,
                nextOpId,
                now,
            });

        if (localOps.length > 0) {
            await transport.appendOperations(deviceId, localOps);
            await this.settings.set(
                SETTINGS_KEY_NEXT_OP_ID,
                String(updatedOpId)
            );
        }

        const manifestCandidate = await transport.readManifest();
        const remoteManifest =
            manifestCandidate ??
            ProviderCloudSyncTransport.createEmptyManifest();
        const previousSnapshotKey = remoteManifest.latestSnapshotKey;
        const snapshotState = await this.loadSnapshotState(
            transport,
            remoteManifest
        );

        const resetAt = remoteManifest.resetAt ?? 0;
        const opsKeyPatternWithCreatedAt =
            // eslint-disable-next-line regexp/require-unicode-sets-regexp -- This pattern does not require Unicode sets; /v is optional.
            /^sync\/devices\/[^/]+\/ops\/(?<createdAt>\d+)-\d+-\d+\.ndjson$/u;

        const allOpObjects = await transport.listOperationObjects();
        const opObjects =
            resetAt > 0
                ? allOpObjects.filter((entry) => {
                      const match = opsKeyPatternWithCreatedAt.exec(entry.key);
                      const createdAtString = match?.groups?.["createdAt"];
                      const createdAt = createdAtString
                          ? Number(createdAtString)
                          : Number.NaN;
                      return Number.isFinite(createdAt) && createdAt >= resetAt;
                  })
                : allOpObjects;
        const compacted = remoteManifest.devices;

        const operationsByObject = await Promise.all(
            opObjects.map((entry) => transport.readOperationsObject(entry.key))
        );

        const remoteOps = operationsByObject.flat().filter((op) => {
            const compactedUpTo = compacted[op.deviceId]?.compactedUpToOpId;
            return !(compactedUpTo !== undefined && op.opId <= compactedUpTo);
        });

        const mergedState = applyCloudSyncOperationsToState(
            snapshotState,
            remoteOps
        );

        const snapshot = buildDefaultSnapshot(mergedState);
        const snapshotEntry = await transport.writeSnapshot(snapshot);

        const maxOps = getMaxOpIdByDevice(remoteOps);
        const nextManifest: CloudSyncManifest = {
            ...remoteManifest,
            devices: {
                ...remoteManifest.devices,
            },
            lastCompactionAt: snapshot.createdAt,
            latestSnapshotKey: snapshotEntry.key,
        };

        for (const [device, maxOpId] of Object.entries(maxOps)) {
            const currentDevice = nextManifest.devices[device];
            const previousCompacted = currentDevice?.compactedUpToOpId ?? -1;
            nextManifest.devices[device] = {
                compactedUpToOpId: Math.max(previousCompacted, maxOpId),
                lastSeenAt: now,
            };
        }

        nextManifest.devices[deviceId] = {
            compactedUpToOpId: Math.max(
                nextManifest.devices[deviceId]?.compactedUpToOpId ?? -1,
                maxOps[deviceId] ?? -1
            ),
            lastSeenAt: now,
        };

        await transport.writeManifest(nextManifest);

        // Best-effort cleanup: delete the previous snapshot and any fully
        // compacted operation objects to keep remote storage bounded.
        //
        // @remarks
        // This is especially important when enabling encryption after legacy
        // plaintext sync artifacts exist; the first encrypted compaction should
        // remove the old plaintext snapshot/ops.

        const opsKeyPattern =
            // eslint-disable-next-line regexp/require-unicode-sets-regexp -- This pattern does not require Unicode sets; /v is optional.
            /^sync\/devices\/(?<device>[^/]+)\/ops\/\d+-\d+-(?<lastOpId>\d+)\.ndjson$/u;

        async function safeDelete(key: string): Promise<void> {
            try {
                await transport.deleteObject(key);
            } catch {
                // Best-effort cleanup.
            }
        }

        const deletions: Array<Promise<void>> = [];
        for (const entry of opObjects) {
            const match = opsKeyPattern.exec(entry.key);
            const device = match?.groups?.["device"];
            const lastOpIdString = match?.groups?.["lastOpId"];

            if (device && lastOpIdString) {
                const lastOpId = Number(lastOpIdString);
                const compactedUpTo =
                    nextManifest.devices[device]?.compactedUpToOpId;

                if (
                    Number.isFinite(lastOpId) &&
                    compactedUpTo !== undefined &&
                    lastOpId <= compactedUpTo
                ) {
                    deletions.push(safeDelete(entry.key));
                }
            }
        }

        if (previousSnapshotKey && previousSnapshotKey !== snapshotEntry.key) {
            deletions.push(safeDelete(previousSnapshotKey));
        }

        await Promise.all(deletions);

        const appliedBaseline = await this.applyMergedState(
            mergedState,
            allSettings
        );

        await this.setBaseline(appliedBaseline);

        return {
            appliedRemoteOperations: remoteOps.length,
            emittedLocalOperations: localOps.length,
            mergedEntities:
                Object.keys(mergedState.site).length +
                Object.keys(mergedState.monitor).length,
            snapshotKey: snapshotEntry.key,
        };
    }

    private async applyMergedState(
        state: CloudSyncState,
        existingSettings: Record<string, string>
    ): Promise<CloudSyncBaseline> {
        const desiredSites = buildDesiredSitesFromSyncState(state.site);
        const desiredMonitors = buildDesiredMonitorsFromSyncState(
            state.monitor
        );
        const desiredSettings = buildDesiredSettingsFromSyncState(
            state.settings
        );

        await this.applySettings(existingSettings, desiredSettings);

        const currentSites = await this.orchestrator.getSites();
        const currentSitesMap = new Map(
            currentSites.map((site) => [site.identifier, site])
        );

        const desiredSitesWithMonitors: Record<string, Site> = {};
        for (const [identifier, siteConfig] of Object.entries(desiredSites)) {
            const monitors = Object.values(desiredMonitors)
                .filter((monitor) => monitor.siteIdentifier === identifier)
                .map((monitorConfig) =>
                    this.mergeMonitorConfig(
                        currentSitesMap.get(identifier)?.monitors ?? [],
                        monitorConfig
                    ));

            desiredSitesWithMonitors[identifier] = {
                identifier,
                monitoring: siteConfig.monitoring,
                monitors,
                name: siteConfig.name,
            };
        }

        // Create any missing sites for orphaned monitors.
        for (const monitorConfig of Object.values(desiredMonitors)) {
            if (!(monitorConfig.siteIdentifier in desiredSitesWithMonitors)) {
                desiredSitesWithMonitors[monitorConfig.siteIdentifier] = {
                    identifier: monitorConfig.siteIdentifier,
                    monitoring: true,
                    monitors: [
                        this.mergeMonitorConfig(
                            currentSitesMap.get(monitorConfig.siteIdentifier)
                                ?.monitors ?? [],
                            monitorConfig
                        ),
                    ],
                    name: monitorConfig.siteIdentifier,
                };
            }
        }

        /* eslint-disable no-await-in-loop -- Site lifecycle changes must be applied sequentially to avoid overlapping monitor start/stop operations */
        for (const [identifier, site] of Object.entries(
            desiredSitesWithMonitors
        )) {
            const existing = currentSitesMap.get(identifier);
            if (existing) {
                await this.orchestrator.updateSite(identifier, {
                    monitoring: site.monitoring,
                    monitors: site.monitors,
                    name: site.name,
                });
            } else {
                await this.orchestrator.addSite(site);
            }
        }

        for (const existing of currentSites) {
            if (!(existing.identifier in desiredSitesWithMonitors)) {
                await this.orchestrator.removeSite(existing.identifier);
            }
        }
        /* eslint-enable no-await-in-loop -- Sequential site lifecycle updates complete */

        return {
            baselineVersion: CLOUD_SYNC_BASELINE_VERSION,
            createdAt: Date.now(),
            monitors: desiredMonitors,
            settings: desiredSettings,
            sites: desiredSites,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        };
    }

    private async applySettings(
        existing: Record<string, string>,
        desired: CloudSyncSettingsConfig
    ): Promise<void> {
        const existingFiltered: Record<string, string> = {};
        for (const [key, value] of Object.entries(existing)) {
            if (shouldSyncSettingKey(key)) {
                existingFiltered[key] = value;
            }
        }

        /* eslint-disable no-await-in-loop -- Settings writes should be applied sequentially to avoid concurrent transactions */
        for (const [key, value] of Object.entries(desired)) {
            if (existingFiltered[key] !== value) {
                await this.settings.set(key, value);
            }
        }

        for (const key of Object.keys(existingFiltered)) {
            if (!(key in desired)) {
                await this.settings.delete(key);
            }
        }
        /* eslint-enable no-await-in-loop -- Settings reconciliation complete */
    }

    private async loadSnapshotState(
        transport: ProviderCloudSyncTransport,
        manifest: CloudSyncManifest
    ): Promise<CloudSyncState> {
        if (!manifest.latestSnapshotKey) {
            return EMPTY_STATE;
        }

        try {
            const snapshot = await transport.readSnapshot(
                manifest.latestSnapshotKey
            );
            return snapshot.state;
        } catch {
            return EMPTY_STATE;
        }
    }

    private async getOrCreateDeviceId(): Promise<string> {
        const existing = await this.settings.get(SETTINGS_KEY_DEVICE_ID);
        if (existing && existing.trim().length > 0) {
            return existing;
        }

        if (typeof globalThis.crypto.randomUUID !== "function") {
            throw new TypeError("crypto.randomUUID is unavailable");
        }

        const deviceId = globalThis.crypto.randomUUID();
        await this.settings.set(SETTINGS_KEY_DEVICE_ID, deviceId);
        return deviceId;
    }

    private async getNextOpId(): Promise<number> {
        const raw = await this.settings.get(SETTINGS_KEY_NEXT_OP_ID);
        const value = raw ? Number(raw) : 0;
        return Number.isFinite(value) && value >= 0 ? value : 0;
    }

    private async getBaseline(): Promise<CloudSyncBaseline> {
        const raw = await this.settings.get(SETTINGS_KEY_BASELINE);
        if (!raw) {
            return createEmptyBaseline();
        }

        return parseBaseline(raw);
    }

    private async setBaseline(baseline: CloudSyncBaseline): Promise<void> {
        await this.settings.set(
            SETTINGS_KEY_BASELINE,
            stringifyBaseline(baseline)
        );
    }

    private mergeMonitorConfig(
        existingMonitors: Monitor[],
        config: CloudSyncMonitorConfig
    ): Monitor {
        const existing = existingMonitors.find((m) => m.id === config.id);
        const base: Monitor = existing ?? {
            checkInterval: config.checkInterval,
            history: [],
            id: config.id,
            monitoring: config.monitoring,
            responseTime: 0,
            retryAttempts: config.retryAttempts,
            status: "pending",
            timeout: config.timeout,
            type: config.type,
        };

        return {
            ...base,
            ...config,
            history: base.history,
            lastChecked: base.lastChecked,
            responseTime: base.responseTime,
            status: base.status,
        };
    }

    public constructor(dependencies: {
        orchestrator: SyncEngineOrchestrator;
        settings: SyncEngineSettingsAdapter;
    }) {
        this.orchestrator = dependencies.orchestrator;
        this.settings = dependencies.settings;
    }
}
