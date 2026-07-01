/**
 * Canonical domain payloads for true multi-device sync (ADR-016).
 */

import { BASE_MONITOR_TYPES } from "@shared/types";
import * as z from "zod";

/**
 * Canonical synced site configuration.
 */
export interface CloudSyncSiteConfig {
    identifier: string;
    monitoring: boolean;
    name: string;
}

export const cloudSyncSiteConfigSchema: z.ZodType<CloudSyncSiteConfig> = z
    .object({
        identifier: z.string().min(1),
        monitoring: z.boolean(),
        name: z.string().min(1),
    })
    .strict();

/**
 * Canonical synced monitor configuration.
 */
export interface CloudSyncMonitorConfig {
    baselineUrl?: string | undefined;
    bodyKeyword?: string | undefined;
    certificateWarningDays?: number | undefined;
    checkInterval: number;
    edgeLocations?: string | undefined;
    expectedHeaderValue?: string | undefined;
    expectedJsonValue?: string | undefined;
    expectedStatusCode?: number | undefined;
    expectedValue?: string | undefined;
    headerName?: string | undefined;
    heartbeatExpectedStatus?: string | undefined;
    heartbeatMaxDriftSeconds?: number | undefined;
    heartbeatStatusField?: string | undefined;
    heartbeatTimestampField?: string | undefined;
    host?: string | undefined;
    id: string;
    jsonPath?: string | undefined;
    maxPongDelayMs?: number | undefined;
    maxReplicationLagSeconds?: number | undefined;
    maxResponseTime?: number | undefined;
    monitoring: boolean;
    port?: number | undefined;
    primaryStatusUrl?: string | undefined;
    recordType?: string | undefined;
    replicaStatusUrl?: string | undefined;
    replicationTimestampField?: string | undefined;
    retryAttempts: number;
    siteIdentifier: string;
    timeout: number;
    type: (typeof BASE_MONITOR_TYPES)[number];
    url?: string | undefined;
}

export const cloudSyncMonitorConfigSchema: z.ZodType<CloudSyncMonitorConfig> = z
    .object({
        baselineUrl: z.string().min(1).optional(),
        bodyKeyword: z.string().min(1).optional(),
        certificateWarningDays: z.int().nonnegative().optional(),
        checkInterval: z.int().nonnegative(),
        edgeLocations: z.string().min(1).optional(),
        expectedHeaderValue: z.string().min(1).optional(),
        expectedJsonValue: z.string().min(1).optional(),
        expectedStatusCode: z.int().nonnegative().optional(),
        expectedValue: z.string().min(1).optional(),
        headerName: z.string().min(1).optional(),
        heartbeatExpectedStatus: z.string().min(1).optional(),
        heartbeatMaxDriftSeconds: z.int().nonnegative().optional(),
        heartbeatStatusField: z.string().min(1).optional(),
        heartbeatTimestampField: z.string().min(1).optional(),
        host: z.string().min(1).optional(),
        id: z.string().min(1),
        jsonPath: z.string().min(1).optional(),
        maxPongDelayMs: z.int().nonnegative().optional(),
        maxReplicationLagSeconds: z.int().nonnegative().optional(),
        maxResponseTime: z.int().nonnegative().optional(),
        monitoring: z.boolean(),
        port: z.int().nonnegative().optional(),
        primaryStatusUrl: z.string().min(1).optional(),
        recordType: z.string().min(1).optional(),
        replicaStatusUrl: z.string().min(1).optional(),
        replicationTimestampField: z.string().min(1).optional(),
        retryAttempts: z.int().nonnegative(),
        siteIdentifier: z.string().min(1),
        timeout: z.int().nonnegative(),
        type: z.enum(BASE_MONITOR_TYPES),
        url: z.string().min(1).optional(),
    })
    .strict();

/**
 * Synced key/value settings.
 */
export type CloudSyncSettingsConfig = Record<string, string>;

export const cloudSyncSettingsConfigSchema: z.ZodType<CloudSyncSettingsConfig> =
    z.record(z.string().min(1), z.string());
