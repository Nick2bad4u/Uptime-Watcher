import type { Monitor, Site } from "@shared/types";
import type { CloudProviderKind } from "@shared/types/cloud";
import type {
    CloudSyncMonitorConfig,
    CloudSyncSettingsConfig,
} from "@shared/types/cloudSyncDomain";
import type { CloudSyncManifest } from "@shared/types/cloudSyncManifest";
import type {
    CloudSyncEntityState,
    CloudSyncState,
} from "@shared/types/cloudSyncState";

import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import {
    CLOUD_SYNC_BASELINE_VERSION,
    type CloudSyncBaseline,
} from "@shared/types/cloudSyncBaseline";
import { applyCloudSyncOperationsToState } from "@shared/utils/cloudSyncState";
import { safeObjectOmit } from "@shared/utils/objectSafety";
import { createSingleFlight } from "@shared/utils/singleFlight";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { validateMonitorData } from "@shared/validation/monitorSchemas";
import { validateSiteData } from "@shared/validation/siteSchemas";

import type { CloudStorageProvider } from "../cloud/providers/CloudStorageProvider.types";

import { logger } from "../../utils/logger";
import { ProviderCloudSyncTransport } from "./ProviderCloudSyncTransport";
import { parseOpsObjectKeyMetadata } from "./syncEngineKeyUtils";
import {
    buildCanonicalLocalState,
    buildDesiredMonitorsFromSyncState,
    buildDesiredSettingsFromSyncState,
    buildDesiredSitesFromSyncState,
    buildLocalOperations,
    createEmptyBaseline,
    EMPTY_STATE,
    getMaxOpIdByDevice,
    normalizeCloudSyncState,
    parseBaseline,
    shouldSyncSettingKey,
    stringifyBaseline,
} from "./syncEngineState";
import {
    isValidPersistedDeviceId,
    mapWithConcurrency,
} from "./syncEngineUtils";

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

/** Concurrency used when downloading remote operation log objects. */
const DEFAULT_OPS_OBJECT_READ_CONCURRENCY = 4;

/** Concurrency cap used when deleting compacted remote sync objects. */
const DEFAULT_SYNC_CLEANUP_DELETE_CONCURRENCY = 4;

/**
 * Narrow interface for components that can perform a sync cycle.
 */
export interface CloudSyncEngine {
    syncNow: (provider: CloudStorageProvider) => Promise<SyncEngineResult>;
}

const SETTINGS_KEY_DEVICE_ID = "cloud.sync.deviceId" as const;
const SETTINGS_KEY_NEXT_OP_ID = "cloud.sync.nextOpId" as const;
const SETTINGS_KEY_BASELINE = "cloud.sync.baseline.v1" as const;

const noop = (): void => {};

/**
 * Sync engine implementing ADR-016 (operation log + snapshots).
 */
export class SyncEngine {
    private readonly orchestrator: SyncEngineOrchestrator;

    private readonly settings: SyncEngineSettingsAdapter;

    /**
     * Serializes sync runs across provider kinds.
     *
     * @remarks
     * This is intentionally a queue (not a single-flight): if provider kind
     * changes, we still want the new request to run after the prior one.
     */
    private syncQueue: Promise<void> = Promise.resolve();

    /**
     * Single-flight wrappers per provider kind.
     *
     * @remarks
     * Coalesces concurrent calls for the same provider kind **including** when
     * they are queued behind another provider's sync run.
     */
    private readonly syncNowByProviderKind = new Map<
        CloudProviderKind,
        (provider: CloudStorageProvider) => Promise<SyncEngineResult>
    >();

    public async syncNow(
        provider: CloudStorageProvider
    ): Promise<SyncEngineResult> {
        const runner = this.getOrCreateSyncNowRunner(provider.kind);
        return runner(provider);
    }

    private async syncNowInternal(
        provider: CloudStorageProvider
    ): Promise<SyncEngineResult> {
        const transport = ProviderCloudSyncTransport.create(provider);

        const deviceId = await this.getOrCreateDeviceId();

        // Read the remote manifest first so we can advance nextOpId if the
        // local settings have been reset but the deviceId is still present.
        //
        // Without this, we can accidentally reuse old opIds which may be
        // treated as already-compacted and dropped by other devices.
        const manifestCandidate = await transport.readManifest();
        const remoteManifest =
            manifestCandidate ??
            ProviderCloudSyncTransport.createEmptyManifest();

        const resetAt = remoteManifest.resetAt ?? 0;
        // Ensure any locally-emitted sync objects use a createdAt >= resetAt.
        // This prevents a device with a skewed clock from writing op objects
        // that other devices ignore due to `manifest.resetAt` filtering.
        const now = Math.max(Date.now(), resetAt);

        let nextOpId = await this.getNextOpId();
        const compactedUpToLocal =
            remoteManifest.devices[deviceId]?.compactedUpToOpId;
        if (
            typeof compactedUpToLocal === "number" &&
            Number.isSafeInteger(compactedUpToLocal) &&
            compactedUpToLocal >= -1
        ) {
            const minimumNext = compactedUpToLocal + 1;
            if (minimumNext > nextOpId) {
                nextOpId = minimumNext;
                await this.settings.set(
                    SETTINGS_KEY_NEXT_OP_ID,
                    String(nextOpId)
                );
            }
        }

        const [sites, allSettings] = await Promise.all([
            this.orchestrator.getSites(),
            this.settings.getAll(),
        ]);

        const current = buildCanonicalLocalState(sites, allSettings);

        const baseline = await this.getBaseline();

        const { nextOpId: updatedOpId, operations: localOps } =
            buildLocalOperations({
                baseline,
                current,
                deviceId,
                nextOpId,
                now,
            });

        if (localOps.length > 0) {
            await transport.appendOperations(deviceId, localOps, now);
            await this.settings.set(
                SETTINGS_KEY_NEXT_OP_ID,
                String(updatedOpId)
            );
        }

        const previousSnapshotKey = remoteManifest.latestSnapshotKey;
        const { snapshotState, snapshotTrusted } = await this.loadSnapshotState(
            transport,
            remoteManifest
        );

        const allOpObjects = await transport.listOperationObjects();
        const opObjects =
            resetAt > 0
                ? allOpObjects.filter((entry) => {
                      const metadata = parseOpsObjectKeyMetadata(entry.key);
                      return metadata !== null && metadata.createdAt >= resetAt;
                  })
                : allOpObjects;
        // If we fail to load the snapshot, we must not apply remote compaction
        // filtering. Otherwise we would drop compacted operations and lose
        // state.
        const compacted = snapshotTrusted ? remoteManifest.devices : {};

        const opObjectsToRead = snapshotTrusted
            ? opObjects.filter((entry) => {
                  const metadata = parseOpsObjectKeyMetadata(entry.key);
                  if (!metadata) {
                      return true;
                  }

                  const compactedUpTo =
                      compacted[metadata.deviceId]?.compactedUpToOpId;
                  return !(
                      compactedUpTo !== undefined &&
                      metadata.lastOpId <= compactedUpTo
                  );
              })
            : opObjects;

        const operationsByObject = await mapWithConcurrency({
            concurrency: DEFAULT_OPS_OBJECT_READ_CONCURRENCY,
            items: opObjectsToRead,
            task: async (entry) => {
                try {
                    return await transport.readOperationsObject(entry.key);
                } catch (error) {
                    logger.warn(
                        "[SyncEngine] Failed to read remote operations object; skipping",
                        {
                            key: entry.key,
                            message: getUserFacingErrorDetail(error),
                        }
                    );
                    return [];
                }
            },
        });

        const remoteOps = operationsByObject.flat().filter((op) => {
            const compactedUpTo = compacted[op.deviceId]?.compactedUpToOpId;
            return !(compactedUpTo !== undefined && op.opId <= compactedUpTo);
        });

        const mergedState = applyCloudSyncOperationsToState(
            snapshotState,
            remoteOps
        );

        const normalizedMergedState = normalizeCloudSyncState(mergedState);

        const sanitizedMergedState =
            this.buildSanitizedMergedStateForApplication({
                localSites: sites,
                state: normalizedMergedState,
            });

        const snapshot = ProviderCloudSyncTransport.createSnapshot(
            now,
            sanitizedMergedState
        );
        const snapshotEntry = await transport.writeSnapshot(snapshot);

        const maxOps = getMaxOpIdByDevice(remoteOps);
        const nextManifest: CloudSyncManifest = {
            ...remoteManifest,
            devices: snapshotTrusted
                ? {
                      ...remoteManifest.devices,
                  }
                : {},
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
        // This is especially important when enabling encryption after older
        // plaintext sync artifacts exist; the first encrypted compaction should
        // remove the previous plaintext snapshot/ops.

        const keysToDelete: string[] = [];
        for (const entry of opObjects) {
            const metadata = parseOpsObjectKeyMetadata(entry.key);
            if (metadata) {
                const compactedUpTo =
                    nextManifest.devices[metadata.deviceId]?.compactedUpToOpId;

                if (
                    compactedUpTo !== undefined &&
                    metadata.lastOpId <= compactedUpTo
                ) {
                    keysToDelete.push(entry.key);
                }
            }
        }

        if (previousSnapshotKey && previousSnapshotKey !== snapshotEntry.key) {
            keysToDelete.push(previousSnapshotKey);
        }

        await mapWithConcurrency({
            concurrency: DEFAULT_SYNC_CLEANUP_DELETE_CONCURRENCY,
            items: keysToDelete,
            task: async (keyToDelete) => {
                try {
                    await transport.deleteObject(keyToDelete);
                    return true;
                } catch {
                    // Best-effort cleanup.
                    return false;
                }
            },
        });

        const appliedBaseline = await this.applyMergedState(
            sanitizedMergedState,
            allSettings
        );

        await this.setBaseline(appliedBaseline);

        return {
            appliedRemoteOperations: remoteOps.length,
            emittedLocalOperations: localOps.length,
            mergedEntities:
                Object.keys(sanitizedMergedState.site).length +
                Object.keys(sanitizedMergedState.monitor).length,
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

        const desiredSiteIdentifiers = new Set(Object.keys(desiredSites));

        await this.applySettings(existingSettings, desiredSettings);

        const currentSites = await this.orchestrator.getSites();
        const currentSitesMap = new Map(
            currentSites.map((site) => [site.identifier, site])
        );

        const desiredSitesWithMonitors: Record<string, Site> = {};

        for (const [identifier, siteConfig] of Object.entries(desiredSites)) {
            const existingMonitors =
                currentSitesMap.get(identifier)?.monitors ?? [];

            const mergedMonitors: Monitor[] = [];
            for (const monitorConfig of Object.values(desiredMonitors)) {
                if (monitorConfig.siteIdentifier === identifier) {
                    const merged = this.mergeMonitorConfig(
                        existingMonitors,
                        monitorConfig
                    );
                    mergedMonitors.push(merged);
                }
            }

            desiredSitesWithMonitors[identifier] = {
                identifier,
                monitoring: siteConfig.monitoring,
                monitors: mergedMonitors,
                name: siteConfig.name,
            };
        }

        /* eslint-disable no-await-in-loop -- Site lifecycle changes must be applied sequentially to avoid overlapping monitor start/stop operations */
        for (const [identifier, site] of Object.entries(
            desiredSitesWithMonitors
        )) {
            const existing = currentSitesMap.get(identifier);

            try {
                if (existing) {
                    await this.orchestrator.updateSite(identifier, {
                        monitoring: site.monitoring,
                        monitors: site.monitors,
                        name: site.name,
                    });
                } else {
                    await this.orchestrator.addSite(site);
                }
            } catch (error) {
                logger.warn(
                    "[SyncEngine] Failed to apply remote site during sync",
                    {
                        message: getUserFacingErrorDetail(error),
                        monitorCount: site.monitors.length,
                        siteIdentifier: identifier,
                    }
                );
            }
        }

        for (const existing of currentSites) {
            if (!desiredSiteIdentifiers.has(existing.identifier)) {
                try {
                    await this.orchestrator.removeSite(existing.identifier);
                } catch (error) {
                    logger.warn(
                        "[SyncEngine] Failed to remove local site during sync",
                        {
                            message: getUserFacingErrorDetail(error),
                            siteIdentifier: existing.identifier,
                        }
                    );
                }
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
    ): Promise<
        Readonly<{ snapshotState: CloudSyncState; snapshotTrusted: boolean }>
    > {
        if (!manifest.latestSnapshotKey) {
            return {
                snapshotState: EMPTY_STATE,
                snapshotTrusted: false,
            };
        }

        try {
            const snapshot = await transport.readSnapshot(
                manifest.latestSnapshotKey
            );
            return {
                snapshotState: snapshot.state,
                snapshotTrusted: true,
            };
        } catch (error) {
            logger.warn(
                "[SyncEngine] Failed to load remote snapshot; rebuilding from operation log",
                {
                    key: manifest.latestSnapshotKey,
                    message: getUserFacingErrorDetail(error),
                }
            );
            return {
                snapshotState: EMPTY_STATE,
                snapshotTrusted: false,
            };
        }
    }

    private async getOrCreateDeviceId(): Promise<string> {
        const existing = await this.settings.get(SETTINGS_KEY_DEVICE_ID);
        if (existing && isValidPersistedDeviceId(existing)) {
            return existing;
        }

        if (existing && existing.trim().length > 0) {
            logger.warn(
                "[SyncEngine] Stored deviceId is invalid; generating a new one",
                {
                    storedLength: existing.length,
                }
            );
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

        const parsed = parseBaseline(raw);
        if (parsed.recovered) {
            logger.warn(
                "[SyncEngine] Stored baseline is invalid; falling back to empty baseline",
                {
                    message: parsed.error,
                    storedLength: raw.length,
                }
            );
        }

        return parsed.baseline;
    }

    private async setBaseline(baseline: CloudSyncBaseline): Promise<void> {
        await this.settings.set(
            SETTINGS_KEY_BASELINE,
            stringifyBaseline(baseline)
        );
    }

    private async enqueueSyncRun<Result>(
        fn: () => Promise<Result>
    ): Promise<Result> {
        const previous = this.syncQueue;
        let release: () => void = noop;
        const next = new Promise<void>((resolve) => {
            release = resolve;
        });

        this.syncQueue = next;

        return (async (): Promise<Result> => {
            try {
                await previous;
            } catch {
                // Ignore failures from previous runs; callers observe their own.
            }

            try {
                return await fn();
            } finally {
                release();
            }
        })();
    }

    private getOrCreateSyncNowRunner(
        providerKind: CloudProviderKind
    ): (provider: CloudStorageProvider) => Promise<SyncEngineResult> {
        const existing = this.syncNowByProviderKind.get(providerKind);
        if (existing) {
            return existing;
        }

        const runner = createSingleFlight(
            async (provider: CloudStorageProvider): Promise<SyncEngineResult> =>
                this.enqueueSyncRun(async () => this.syncNowInternal(provider))
        );

        this.syncNowByProviderKind.set(providerKind, runner);
        return runner;
    }

    /**
     * Removes invalid sites/monitors from a merged sync state before we compact
     * (write a snapshot) and apply the configuration to the local
     * orchestrator.
     *
     * @remarks
     * Remote operation streams may materialize into partial or outdated
     * configurations (e.g. an HTTP monitor without a URL). The orchestrator
     * performs strict validation and will reject these payloads.
     *
     * We proactively validate the merged state using the shared schemas and
     * drop invalid entities so that:
     *
     * - The first sync attempt doesn't fail intermittently.
     * - The written snapshot becomes a "healed" baseline for future devices.
     *
     * This method is intentionally conservative: it never fabricates new
     * field-level writes (which could violate LWW semantics); it only drops
     * entities that cannot be applied safely.
     */
    private buildSanitizedMergedStateForApplication(args: {
        localSites: Site[];
        state: CloudSyncState;
    }): CloudSyncState {
        const { localSites, state } = args;

        const desiredSites = buildDesiredSitesFromSyncState(state.site);
        const desiredMonitors = buildDesiredMonitorsFromSyncState(
            state.monitor
        );

        const localMonitorsBySite = new Map<string, Monitor[]>();
        for (const site of localSites) {
            localMonitorsBySite.set(site.identifier, site.monitors);
        }

        const mergedValidMonitorsById = new Map<string, Monitor>();

        for (const [monitorId, monitorConfig] of Object.entries(
            desiredMonitors
        )) {
            const { siteIdentifier } = monitorConfig;

            if (siteIdentifier in desiredSites) {
                const existingMonitors =
                    localMonitorsBySite.get(siteIdentifier) ?? [];

                const merged = this.mergeMonitorConfig(
                    existingMonitors,
                    monitorConfig
                );

                const validation = validateMonitorData(merged.type, merged);
                if (validation.success) {
                    mergedValidMonitorsById.set(monitorId, merged);
                } else {
                    logger.warn(
                        "[SyncEngine] Dropping invalid monitor from merged state",
                        {
                            errorCount: validation.errors.length,
                            errors: validation.errors.slice(0, 3),
                            monitorId,
                            monitorType: monitorConfig.type,
                            siteIdentifier,
                            warningCount: validation.warnings?.length ?? 0,
                            warnings: validation.warnings?.slice(0, 3) ?? [],
                        }
                    );
                }
            } else {
                logger.warn(
                    "[SyncEngine] Dropping orphan monitor from merged state",
                    {
                        monitorId,
                        monitorType: monitorConfig.type,
                        reason: "Unknown site identifier",
                        siteIdentifier,
                    }
                );
            }
        }

        const monitorIdsBySite = new Map<string, string[]>();
        for (const [monitorId, monitorConfig] of Object.entries(
            desiredMonitors
        )) {
            const { siteIdentifier } = monitorConfig;

            if (
                mergedValidMonitorsById.has(monitorId) &&
                siteIdentifier in desiredSites
            ) {
                const current = monitorIdsBySite.get(siteIdentifier) ?? [];
                monitorIdsBySite.set(siteIdentifier, [...current, monitorId]);
            }
        }

        const keepSiteIds = new Set<string>();
        const keepMonitorIds = new Set<string>();

        for (const [siteId, siteConfig] of Object.entries(desiredSites)) {
            const monitorIds = monitorIdsBySite.get(siteId) ?? [];
            const monitors = monitorIds
                .map((monitorId) => mergedValidMonitorsById.get(monitorId))
                .filter((monitor): monitor is Monitor => monitor !== undefined);

            const siteCandidate: Site = {
                identifier: siteId,
                monitoring: siteConfig.monitoring,
                monitors,
                name: siteConfig.name,
            };

            const validation = validateSiteData(siteCandidate);
            if (validation.success) {
                keepSiteIds.add(siteId);
                for (const monitorId of monitorIds) {
                    keepMonitorIds.add(monitorId);
                }
            } else {
                logger.warn(
                    "[SyncEngine] Dropping invalid site from merged state",
                    {
                        errorCount: validation.errors.length,
                        errors: validation.errors.slice(0, 3),
                        monitorCount: monitors.length,
                        siteIdentifier: siteId,
                        warningCount: validation.warnings?.length ?? 0,
                        warnings: validation.warnings?.slice(0, 3) ?? [],
                    }
                );
            }
        }

        const nextSite: Record<string, CloudSyncEntityState> = {};
        for (const [siteId, entity] of Object.entries(state.site)) {
            if (entity.deleted !== undefined || keepSiteIds.has(siteId)) {
                nextSite[siteId] = entity;
            }
        }

        const nextMonitor: Record<string, CloudSyncEntityState> = {};
        for (const [monitorId, entity] of Object.entries(state.monitor)) {
            if (entity.deleted !== undefined || keepMonitorIds.has(monitorId)) {
                nextMonitor[monitorId] = entity;
            }
        }

        return {
            ...state,
            monitor: nextMonitor,
            site: nextSite,
        };
    }

    private mergeMonitorConfig(
        existingMonitors: Monitor[],
        config: CloudSyncMonitorConfig
    ): Monitor {
        const existing = existingMonitors.find((m) => m.id === config.id);

        // `siteIdentifier` is a cloud-sync routing field (monitors are stored
        // inside their parent site locally). It must never be passed into the
        // orchestrator, because strict monitor validation rejects unknown keys.
        const monitorFields = safeObjectOmit(config, [
            "siteIdentifier",
        ] as const);

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
            ...monitorFields,
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
