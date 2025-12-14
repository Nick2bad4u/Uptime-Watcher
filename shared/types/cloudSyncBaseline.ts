/**
 * Local baseline snapshot used to compute device-local diffs between sync runs.
 */

import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import {
    type CloudSyncMonitorConfig,
    cloudSyncMonitorConfigSchema,
    type CloudSyncSettingsConfig,
    cloudSyncSettingsConfigSchema,
    type CloudSyncSiteConfig,
    cloudSyncSiteConfigSchema,
} from "@shared/types/cloudSyncDomain";
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

export const cloudSyncBaselineSchema: z.ZodType<CloudSyncBaseline> = z
    .object({
        baselineVersion: z.literal(CLOUD_SYNC_BASELINE_VERSION),
        createdAt: z.number().int().nonnegative(),
        monitors: z.record(z.string().min(1), cloudSyncMonitorConfigSchema),
        settings: cloudSyncSettingsConfigSchema,
        sites: z.record(z.string().min(1), cloudSyncSiteConfigSchema),
        syncSchemaVersion: z.literal(CLOUD_SYNC_SCHEMA_VERSION),
    })
    .strict();

/**
 * Parses and validates a baseline payload.
 */
export function parseCloudSyncBaseline(candidate: unknown): CloudSyncBaseline {
    return cloudSyncBaselineSchema.parse(candidate);
}
