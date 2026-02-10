/**
 * Internal helpers for {@link electron/services/sync/SyncEngine#SyncEngine}.
 *
 * @remarks
 * This module intentionally centralizes the “pure” cloud-sync state
 * transformations used by the Electron sync engine:
 *
 * - Baseline serialization/parsing
 * - Canonical local-state projection
 * - Desired-state extraction from merged sync state
 * - Operation emission (local changes → remote operations)
 * - Merged-state normalization
 *
 * Keeping these out of SyncEngine.ts reduces file size/complexity and makes it
 * easier to test/refactor safely.
 *
 * @packageDocumentation
 */

import type { Monitor, Site } from "@shared/types";
import type { CloudSyncBaseline } from "@shared/types/cloudSyncBaseline";
import type {
    CloudSyncEntityState,
    CloudSyncFieldValue,
    CloudSyncState,
} from "@shared/types/cloudSyncState";
import type { UnknownRecord } from "type-fest";

import {
    CLOUD_SYNC_SCHEMA_VERSION,
    type CloudSyncOperation,
    type CloudSyncWriteKey,
    type JsonValue,
    jsonValueSchema,
} from "@shared/types/cloudSync";
import {
    CLOUD_SYNC_BASELINE_VERSION,
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
import { ensureError } from "@shared/utils/errorHandling";

import {
    DEFAULT_CHECK_INTERVAL,
    DEFAULT_REQUEST_TIMEOUT,
} from "../../constants";

// Keep aligned with renderer defaults (src/utils/fallbacks.ts).
const DEFAULT_RETRY_ATTEMPTS = 3;

const SETTINGS_KEY_PREFIX_CLOUD = "cloud." as const;

const DEFAULT_WRITE_KEY: CloudSyncWriteKey = {
    deviceId: "__defaults",
    opId: 0,
    timestamp: 0,
};

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function normalizeCloudSyncFieldValue<
    T extends CloudSyncFieldValue["value"],
>(args: {
    current: CloudSyncFieldValue | undefined;
    defaultValue: T;
    isValid: (value: unknown) => value is T;
}): CloudSyncFieldValue {
    const { current, defaultValue, isValid } = args;
    const write = current?.write ?? DEFAULT_WRITE_KEY;
    const currentValue = current?.value;

    return {
        value: isValid(currentValue) ? currentValue : defaultValue,
        write,
    };
}

/**
 * Stabilizes merged sync state by filling required default fields that may be
 * missing from remote operations.
 *
 * @remarks
 * Cloud sync operations may only record "changed" fields. If default monitor
 * fields were never explicitly written (e.g. checkInterval/timeout), other
 * devices can observe partial configs that fail validation.
 */
export function normalizeCloudSyncState(state: CloudSyncState): CloudSyncState {
    const nextSite: Record<string, CloudSyncEntityState> = {};
    for (const [siteId, entity] of Object.entries(state.site)) {
        const fields: Record<string, CloudSyncFieldValue> = {
            ...entity.fields,
        };

        fields["monitoring"] = normalizeCloudSyncFieldValue({
            current: fields["monitoring"],
            defaultValue: true,
            isValid: isBoolean,
        });

        fields["name"] = normalizeCloudSyncFieldValue({
            current: fields["name"],
            defaultValue: siteId,
            isValid: isNonEmptyString,
        });

        nextSite[siteId] = {
            ...entity,
            fields,
        };
    }

    const nextMonitor: Record<string, CloudSyncEntityState> = {};
    for (const [monitorId, entity] of Object.entries(state.monitor)) {
        const fields: Record<string, CloudSyncFieldValue> = {
            ...entity.fields,
        };

        fields["monitoring"] = normalizeCloudSyncFieldValue({
            current: fields["monitoring"],
            defaultValue: true,
            isValid: isBoolean,
        });
        fields["checkInterval"] = normalizeCloudSyncFieldValue({
            current: fields["checkInterval"],
            defaultValue: DEFAULT_CHECK_INTERVAL,
            isValid: isFiniteNumber,
        });
        fields["retryAttempts"] = normalizeCloudSyncFieldValue({
            current: fields["retryAttempts"],
            defaultValue: DEFAULT_RETRY_ATTEMPTS,
            isValid: isFiniteNumber,
        });
        fields["timeout"] = normalizeCloudSyncFieldValue({
            current: fields["timeout"],
            defaultValue: DEFAULT_REQUEST_TIMEOUT,
            isValid: isFiniteNumber,
        });

        nextMonitor[monitorId] = {
            ...entity,
            fields,
        };
    }

    return {
        ...state,
        monitor: nextMonitor,
        site: nextSite,
    };
}

export const EMPTY_STATE: CloudSyncState = {
    monitor: {},
    settings: {},
    site: {},
};

/**
 * Returns `true` when a given settings key should participate in cloud sync.
 *
 * @remarks
 * The sync engine persists internal bookkeeping under a reserved prefix. Those
 * keys must never be written to the provider operation log.
 *
 * @param key - Settings key from the local settings store.
 */
export function shouldSyncSettingKey(key: string): boolean {
    return !key.startsWith(SETTINGS_KEY_PREFIX_CLOUD);
}

function removeUndefinedEntries(value: UnknownRecord): UnknownRecord {
    const result: UnknownRecord = {};
    for (const [key, entryValue] of Object.entries(value)) {
        if (entryValue !== undefined) {
            result[key] = entryValue;
        }
    }

    return result;
}

// eslint-disable-next-line sonarjs/function-return-type -- Returns a JsonValue union (object/array/primitive) by design.
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

/**
 * Canonical, schema-validated snapshot of local sync-relevant state.
 *
 * @remarks
 * This structure is intentionally JSON-like and stable so it can be compared
 * against persisted baselines deterministically.
 */
export interface CanonicalLocalState {
    /** Canonical monitor configs keyed by monitor id. */
    readonly monitors: Record<string, CloudSyncMonitorConfig>;
    /** Canonical, filtered settings payload. */
    readonly settings: CloudSyncSettingsConfig;
    /** Canonical site configs keyed by site identifier. */
    readonly sites: Record<string, CloudSyncSiteConfig>;
}

/**
 * Builds a canonical representation of the current local state.
 *
 * @remarks
 * This canonical form is used to diff against the persisted baseline when
 * generating local operation log entries.
 *
 * @param sites - Current sites including nested monitors.
 * @param settings - Full key/value settings map.
 */
export function buildCanonicalLocalState(
    sites: Site[],
    settings: Record<string, string>
): CanonicalLocalState {
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

/**
 * Derives the desired site configs from the merged cloud sync state.
 *
 * @param siteState - Cloud sync site entity map.
 */
export function buildDesiredSitesFromSyncState(
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
                name:
                    typeof nameValue === "string" && nameValue.trim().length > 0
                        ? nameValue
                        : siteId,
            });

            if (parsed.success) {
                desiredSites[siteId] = parsed.data;
            }
        }
    }

    return desiredSites;
}

/**
 * Derives the desired monitor configs from the merged cloud sync state.
 *
 * @remarks
 * Applies default values for required monitor fields that might not appear in
 * remote operation logs (because operations are field-level deltas).
 *
 * @param monitorState - Cloud sync monitor entity map.
 */
export function buildDesiredMonitorsFromSyncState(
    monitorState: CloudSyncState["monitor"]
): Record<string, CloudSyncMonitorConfig> {
    const desiredMonitors: Record<string, CloudSyncMonitorConfig> = {};

    for (const [monitorId, entity] of Object.entries(monitorState)) {
        if (entity.deleted === undefined) {
            const candidate: UnknownRecord = { id: monitorId };
            for (const [field, fieldValue] of Object.entries(entity.fields)) {
                if (field !== "id" && fieldValue.value !== null) {
                    candidate[field] = fieldValue.value;
                }
            }

            // Stabilize required baseline fields that may not be present in
            // remote operations.
            if (!isBoolean(candidate["monitoring"])) {
                candidate["monitoring"] = true;
            }
            if (!isFiniteNumber(candidate["checkInterval"])) {
                candidate["checkInterval"] = DEFAULT_CHECK_INTERVAL;
            }
            if (!isFiniteNumber(candidate["retryAttempts"])) {
                candidate["retryAttempts"] = DEFAULT_RETRY_ATTEMPTS;
            }
            if (!isFiniteNumber(candidate["timeout"])) {
                candidate["timeout"] = DEFAULT_REQUEST_TIMEOUT;
            }

            const parsed = cloudSyncMonitorConfigSchema.safeParse(candidate);
            if (parsed.success) {
                desiredMonitors[monitorId] = parsed.data;
            }
        }
    }

    return desiredMonitors;
}

/**
 * Derives the desired settings payload from the merged cloud sync state.
 *
 * @param settingsState - Cloud sync settings entity map.
 */
export function buildDesiredSettingsFromSyncState(
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

/**
 * Creates an empty baseline snapshot.
 *
 * @remarks
 * Baselines are stored locally and represent the last fully-synchronized state
 * that remote operations are diffed against.
 */
export function createEmptyBaseline(): CloudSyncBaseline {
    return {
        baselineVersion: CLOUD_SYNC_BASELINE_VERSION,
        createdAt: 0,
        monitors: {},
        settings: {},
        sites: {},
        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
    };
}

/**
 * Serializes a baseline snapshot for storage.
 *
 * @param baseline - Baseline snapshot to persist.
 */
export function stringifyBaseline(baseline: CloudSyncBaseline): string {
    return JSON.stringify(baseline, null, 2);
}

/**
 * Result envelope for parsing a stored baseline.
 */
export interface ParsedBaselineResult {
    /** Parsed baseline (or an empty baseline when recovery occurs). */
    readonly baseline: CloudSyncBaseline;
    /** Error message describing why parsing failed (only when recovered). */
    readonly error?: string | undefined;
    /** Indicates whether parsing failed and the empty baseline was used. */
    readonly recovered: boolean;
}

/**
 * Parses a stored baseline snapshot.
 *
 * @remarks
 * On parse failure, falls back to {@link createEmptyBaseline}.
 *
 * @param raw - Stored baseline string.
 */
export function parseBaseline(raw: string): ParsedBaselineResult {
    try {
        return {
            baseline: parseCloudSyncBaseline(JSON.parse(raw)),
            recovered: false,
        };
    } catch (error) {
        const resolved = ensureError(error);
        return {
            baseline: createEmptyBaseline(),
            error: resolved.message,
            recovered: true,
        };
    }
}

/**
 * Inputs required to build local operation log entries.
 */
export interface BuildLocalOperationsArgs {
    readonly baseline: CloudSyncBaseline;
    readonly current: CanonicalLocalState;
    readonly deviceId: string;
    readonly nextOpId: number;
    readonly now: number;
}

/**
 * Builds the operation log entries required to transform the baseline into the
 * current canonical state.
 *
 * @param args - Diff inputs including baseline and current state.
 */
export function buildLocalOperations(args: BuildLocalOperationsArgs): {
    nextOpId: number;
    operations: CloudSyncOperation[];
} {
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

/**
 * Computes the latest operation id emitted by each device.
 *
 * @param operations - Operation log entries.
 */
export function getMaxOpIdByDevice(
    operations: readonly CloudSyncOperation[]
): Record<string, number> {
    const result: Record<string, number> = {};

    for (const op of operations) {
        result[op.deviceId] = Math.max(result[op.deviceId] ?? -1, op.opId);
    }

    return result;
}
