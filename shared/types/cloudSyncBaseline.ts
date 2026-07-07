/**
 * Local baseline snapshot used to compute device-local diffs between sync runs.
 */

import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import {
    type CloudSyncMonitorConfig,
    cloudSyncMonitorConfigSchema,
    type CloudSyncSettingsConfig,
    type CloudSyncSiteConfig,
    cloudSyncSiteConfigSchema,
} from "@shared/types/cloudSyncDomain";
import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { createOwnDataRecordSchema } from "@shared/validation/ownDataRecordSchema";
import { epochMsSchema } from "@shared/validation/timestampSchemas";
import { objectEntries } from "ts-extras";
import * as z from "zod";

export const CLOUD_SYNC_BASELINE_VERSION = 1 as const;

/**
 * Local baseline used to compute device-local diffs between sync runs.
 */
export interface CloudSyncBaseline {
    baselineVersion: typeof CLOUD_SYNC_BASELINE_VERSION;
    createdAt: number;
    monitors: Record<string, CloudSyncMonitorConfig>;
    settings: CloudSyncSettingsConfig;
    sites: Record<string, CloudSyncSiteConfig>;
    syncSchemaVersion: typeof CLOUD_SYNC_SCHEMA_VERSION;
}

function createBaselineRecord<T>(
    entries: readonly [string, T][] = []
): Record<string, T> {
    const record = createNullPrototypeObject<Record<string, T>>();
    for (const [key, value] of entries) {
        Object.defineProperty(record, key, {
            configurable: true,
            enumerable: true,
            value,
            writable: true,
        });
    }

    return record;
}

export function createCloudSyncBaselineMonitors(
    entries: readonly [string, CloudSyncMonitorConfig][] = []
): CloudSyncBaseline["monitors"] {
    return createBaselineRecord(entries);
}

export function createCloudSyncBaselineSettings(
    entries: readonly [string, string][] = []
): CloudSyncBaseline["settings"] {
    return createBaselineRecord(entries);
}

export function createCloudSyncBaselineSites(
    entries: readonly [string, CloudSyncSiteConfig][] = []
): CloudSyncBaseline["sites"] {
    return createBaselineRecord(entries);
}

const cloudSyncBaselineInternalSchema = z
    .object({
        baselineVersion: z.literal(CLOUD_SYNC_BASELINE_VERSION),
        createdAt: epochMsSchema,
        monitors: createOwnDataRecordSchema(cloudSyncMonitorConfigSchema),
        settings: createOwnDataRecordSchema(z.string()),
        sites: createOwnDataRecordSchema(cloudSyncSiteConfigSchema),
        syncSchemaVersion: z.literal(CLOUD_SYNC_SCHEMA_VERSION),
    })
    .strict()
    .superRefine((baseline, ctx) => {
        for (const [siteId, site] of objectEntries(baseline.sites)) {
            if (site.identifier !== siteId) {
                ctx.addIssue({
                    code: "custom",
                    message: "site identifier must match its baseline map key",
                    path: [
                        "sites",
                        siteId,
                        "identifier",
                    ],
                });
            }
        }

        for (const [monitorId, monitor] of objectEntries(baseline.monitors)) {
            if (monitor.id !== monitorId) {
                ctx.addIssue({
                    code: "custom",
                    message: "monitor id must match its baseline map key",
                    path: [
                        "monitors",
                        monitorId,
                        "id",
                    ],
                });
            }
        }
    });

const cloudSyncBaselineSchema: z.ZodType<CloudSyncBaseline> =
    cloudSyncBaselineInternalSchema.transform((baseline) => ({
        ...baseline,
        monitors: createCloudSyncBaselineMonitors(
            objectEntries(baseline.monitors)
        ),
        settings: createCloudSyncBaselineSettings(
            objectEntries(baseline.settings)
        ),
        sites: createCloudSyncBaselineSites(objectEntries(baseline.sites)),
    }));

/**
 * Parses and validates a baseline payload.
 */
export function parseCloudSyncBaseline(candidate: unknown): CloudSyncBaseline {
    return cloudSyncBaselineSchema.parse(candidate);
}
