/**
 * Derived sync state types for ADR-016.
 *
 * @remarks
 * These types model the deterministic materialized state after applying
 * operations from one or more devices.
 */

import type {
    CloudSyncEntityType,
    CloudSyncWriteKey,
    JsonValue,
} from "@shared/types/cloudSync";

/**
 * Field-level value along with last-write metadata.
 */
export interface CloudSyncFieldValue {
    readonly value: JsonValue;
    readonly write: CloudSyncWriteKey;
}

/**
 * Derived entity state materialized from a stream of operations.
 */
export interface CloudSyncEntityState {
    /**
     * Tombstone marker.
     *
     * @remarks
     * When set, the entity is considered deleted until a newer write resurrects
     * it.
     */
    readonly deleted?: CloudSyncWriteKey | undefined;
    readonly entityId: string;
    readonly entityType: CloudSyncEntityType;
    readonly fields: Readonly<Record<string, CloudSyncFieldValue>>;
}

/**
 * Derived sync state materialized from operations.
 */
export type CloudSyncState = Readonly<
    Record<CloudSyncEntityType, Readonly<Record<string, CloudSyncEntityState>>>
>;
