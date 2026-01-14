/**
 * Advanced/system monitor schema builders.
 *
 * @remarks
 * This module exports factory functions only. The public constants are defined
 * in `monitorSchemas.ts`.
 */

import type {
    BaseMonitorSchemaType,
    CdnEdgeConsistencyMonitorSchemaType,
    ReplicationMonitorSchemaType,
    ServerHeartbeatMonitorSchemaType,
    WebsocketKeepaliveMonitorSchemaType,
} from "@shared/types/schemaTypes";

import * as z from "zod";

interface AdvancedMonitorSchemaBaseArgs {
    readonly baseMonitorSchema: BaseMonitorSchemaType;
    readonly createDotPathSchema: (fieldLabel: string) => z.ZodString;
    readonly edgeLocationListSchema: z.ZodString;
    readonly httpUrlSchema: z.ZodString;
    readonly websocketUrlSchema: z.ZodString;
}

/** Creates the CDN edge consistency monitor schema. */
export function createCdnEdgeConsistencyMonitorSchema(
    args: AdvancedMonitorSchemaBaseArgs
): CdnEdgeConsistencyMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            baselineUrl: args.httpUrlSchema,
            edgeLocations: args.edgeLocationListSchema,
            type: z.literal("cdn-edge-consistency"),
        })
        .strict();
}

/** Creates the replication monitor schema. */
export function createReplicationMonitorSchema(
    args: AdvancedMonitorSchemaBaseArgs
): ReplicationMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            maxReplicationLagSeconds: z
                .number()
                .min(0, "Replication lag threshold must be zero or greater"),
            primaryStatusUrl: args.httpUrlSchema,
            replicaStatusUrl: args.httpUrlSchema,
            replicationTimestampField: args.createDotPathSchema(
                "Replication timestamp field"
            ),
            type: z.literal("replication"),
        })
        .strict();
}

/** Creates the server heartbeat monitor schema. */
export function createServerHeartbeatMonitorSchema(
    args: AdvancedMonitorSchemaBaseArgs
): ServerHeartbeatMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            heartbeatExpectedStatus: z
                .string()
                .min(1, "Expected status is required")
                .max(128, "Expected status must be 128 characters or fewer")
                .refine((value) => value.trim().length > 0, {
                    error: "Expected status is required",
                }),
            heartbeatMaxDriftSeconds: z
                .number()
                .min(0, "Heartbeat drift tolerance must be zero or greater")
                .max(
                    86_400,
                    "Heartbeat drift tolerance cannot exceed 24 hours"
                ),
            heartbeatStatusField: args.createDotPathSchema(
                "Heartbeat status field"
            ),
            heartbeatTimestampField: args.createDotPathSchema(
                "Heartbeat timestamp field"
            ),
            type: z.literal("server-heartbeat"),
            url: args.httpUrlSchema,
        })
        .strict();
}

/** Creates the WebSocket keepalive monitor schema. */
export function createWebsocketKeepaliveMonitorSchema(
    args: AdvancedMonitorSchemaBaseArgs
): WebsocketKeepaliveMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            maxPongDelayMs: z
                .number()
                .min(10, "Maximum pong delay must be at least 10 milliseconds")
                .max(60_000, "Maximum pong delay cannot exceed 60 seconds"),
            type: z.literal("websocket-keepalive"),
            url: args.websocketUrlSchema,
        })
        .strict();
}
