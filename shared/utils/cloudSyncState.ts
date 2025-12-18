/**
 * Deterministic state application for cloud sync operations (ADR-016).
 */

import type {
    CloudSyncEntityType,
    CloudSyncOperation,
    CloudSyncWriteKey,
} from "@shared/types/cloudSync";
import type {
    CloudSyncEntityState,
    CloudSyncFieldValue,
    CloudSyncState,
} from "@shared/types/cloudSyncState";

import { compareCloudSyncWriteKey } from "@shared/types/cloudSync";
import { stringifyJsonValueStable } from "@shared/utils/canonicalJson";

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

const OPERATION_KIND_RANK: Readonly<Record<CloudSyncOperation["kind"], number>> =
    Object.freeze({
        "delete-entity": 1,
        "set-field": 0,
    });

function compareStrings(a: string, b: string): number {
    if (a === b) {
        return 0;
    }

    const aChars = Array.from(a);
    const bChars = Array.from(b);
    const length = Math.min(aChars.length, bChars.length);

    for (let index = 0; index < length; index += 1) {
        const charA = aChars[index];
        const charB = bChars[index];

        if (charA !== charB) {
            const safeCodePointA = charA?.codePointAt(0) ?? 0;
            const safeCodePointB = charB?.codePointAt(0) ?? 0;

            if (safeCodePointA === safeCodePointB) {
                return 0;
            }

            return safeCodePointA < safeCodePointB ? -1 : 1;
        }
    }

    return aChars.length < bChars.length ? -1 : 1;
}

function getWriteKey(operation: CloudSyncOperation): CloudSyncWriteKey {
    return {
        deviceId: operation.deviceId,
        opId: operation.opId,
        timestamp: operation.timestamp,
    };
}

/**
 * Deterministic ordering for cloud sync operations.
 *
 * @remarks
 * The reducer logic is LWW-based via {@link compareCloudSyncWriteKey}. When two
 * operations share the same write key (should not happen in normal operation),
 * we still need stable tie-breaking so applying the same set of operations in
 * any input order yields the same derived state.
 */
function compareOperationsDeterministic(
    left: CloudSyncOperation,
    right: CloudSyncOperation
): number {
    // Primary: write key.
    const leftWrite = getWriteKey(left);
    const rightWrite = getWriteKey(right);
    const writeCompare = compareCloudSyncWriteKey(leftWrite, rightWrite);
    if (writeCompare !== 0) {
        return writeCompare;
    }

    // Secondary: entity identity.
    const entityTypeCompare = compareStrings(left.entityType, right.entityType);
    if (entityTypeCompare !== 0) {
        return entityTypeCompare;
    }

    const idCompare = compareStrings(left.entityId, right.entityId);
    if (idCompare !== 0) {
        return idCompare;
    }

    // Tertiary: kind (apply delete last so it wins on ties).
    const kindCompare =
        OPERATION_KIND_RANK[left.kind] - OPERATION_KIND_RANK[right.kind];
    if (kindCompare !== 0) {
        return kindCompare;
    }

    if (left.kind === "set-field" && right.kind === "set-field") {
        const fieldCompare = compareStrings(left.field, right.field);
        if (fieldCompare !== 0) {
            return fieldCompare;
        }

        const leftValue = stringifyJsonValueStable(left.value);
        const rightValue = stringifyJsonValueStable(right.value);
        const valueCompare = compareStrings(leftValue, rightValue);
        if (valueCompare !== 0) {
            return valueCompare;
        }
    }

    // Final tie-breaker: stable string derived from the whole operation.
    // This should only matter in corrupted/malicious cases.
    const leftKey = JSON.stringify({
        deviceId: left.deviceId,
        entityId: left.entityId,
        entityType: left.entityType,
        field: left.kind === "set-field" ? left.field : undefined,
        kind: left.kind,
        opId: left.opId,
        syncSchemaVersion: left.syncSchemaVersion,
        timestamp: left.timestamp,
        value:
            left.kind === "set-field"
                ? stringifyJsonValueStable(left.value)
                : undefined,
    });

    const rightKey = JSON.stringify({
        deviceId: right.deviceId,
        entityId: right.entityId,
        entityType: right.entityType,
        field: right.kind === "set-field" ? right.field : undefined,
        kind: right.kind,
        opId: right.opId,
        syncSchemaVersion: right.syncSchemaVersion,
        timestamp: right.timestamp,
        value:
            right.kind === "set-field"
                ? stringifyJsonValueStable(right.value)
                : undefined,
    });

    return compareStrings(leftKey, rightKey);
}

function createEmptyState(): Mutable<
    Record<CloudSyncEntityType, Record<string, CloudSyncEntityState>>
> {
    return {
        monitor: {},
        settings: {},
        site: {},
    };
}

function cloneState(
    initialState: CloudSyncState
): Mutable<Record<CloudSyncEntityType, Record<string, CloudSyncEntityState>>> {
    const state = createEmptyState();

    for (const entityType of [
        "monitor",
        "settings",
        "site",
    ] as const) {
        for (const [entityId, entity] of Object.entries(
            initialState[entityType]
        )) {
            const nextFields: Record<string, CloudSyncFieldValue> = {};
            for (const [field, fieldValue] of Object.entries(entity.fields)) {
                nextFields[field] = {
                    value: fieldValue.value,
                    write: fieldValue.write,
                };
            }

            state[entityType][entityId] = entity.deleted
                ? {
                      deleted: entity.deleted,
                      entityId: entity.entityId,
                      entityType: entity.entityType,
                      fields: nextFields,
                  }
                : {
                      entityId: entity.entityId,
                      entityType: entity.entityType,
                      fields: nextFields,
                  };
        }
    }

    return state;
}

function shouldReplaceWrite(
    current: CloudSyncWriteKey | undefined,
    incoming: CloudSyncWriteKey
): boolean {
    if (!current) {
        return true;
    }

    return compareCloudSyncWriteKey(current, incoming) < 0;
}

function getLatestEntityWrite(
    entity: CloudSyncEntityState
): CloudSyncWriteKey | undefined {
    let latest = entity.deleted;

    for (const fieldValue of Object.values(entity.fields)) {
        if (!latest || compareCloudSyncWriteKey(latest, fieldValue.write) < 0) {
            latest = fieldValue.write;
        }
    }

    return latest;
}

function upsertEntity(
    state: Mutable<
        Record<CloudSyncEntityType, Record<string, CloudSyncEntityState>>
    >,
    entityType: CloudSyncEntityType,
    entityId: string
): CloudSyncEntityState {
    state[entityType][entityId] ??= {
        entityId,
        entityType,
        fields: {},
    };

    return state[entityType][entityId];
}

function applyOperation(
    state: Mutable<
        Record<CloudSyncEntityType, Record<string, CloudSyncEntityState>>
    >,
    operation: CloudSyncOperation
): void {
    const write: CloudSyncWriteKey = {
        deviceId: operation.deviceId,
        opId: operation.opId,
        timestamp: operation.timestamp,
    };

    const entity = upsertEntity(
        state,
        operation.entityType,
        operation.entityId
    );

    if (operation.kind === "delete-entity") {
        const latestEntityWrite = getLatestEntityWrite(entity);

        if (shouldReplaceWrite(latestEntityWrite, write)) {
            state[operation.entityType][operation.entityId] = {
                ...entity,
                deleted: write,
            };
        }
        return;
    }

    const existingDeletion = entity.deleted;
    const deletionWinsOverWrite =
        existingDeletion !== undefined &&
        compareCloudSyncWriteKey(write, existingDeletion) < 0;

    if (deletionWinsOverWrite) {
        return;
    }

    const existingField = entity.fields[operation.field];
    if (!shouldReplaceWrite(existingField?.write, write)) {
        return;
    }

    const nextFields: Record<string, CloudSyncFieldValue> = {
        ...entity.fields,
        [operation.field]: {
            value: operation.value,
            write,
        },
    };

    const shouldResurrect =
        existingDeletion !== undefined &&
        compareCloudSyncWriteKey(existingDeletion, write) < 0;

    if (shouldResurrect) {
        state[operation.entityType][operation.entityId] = {
            entityId: entity.entityId,
            entityType: entity.entityType,
            fields: nextFields,
        };
        return;
    }

    state[operation.entityType][operation.entityId] =
        existingDeletion === undefined
            ? {
                  ...entity,
                  fields: nextFields,
              }
            : {
                  ...entity,
                  deleted: existingDeletion,
                  fields: nextFields,
              };
}

/**
 * Applies operations to an existing derived state.
 */
export function applyCloudSyncOperationsToState(
    initialState: CloudSyncState,
    operations: readonly CloudSyncOperation[]
): CloudSyncState {
    const state = cloneState(initialState);

    const sorted = Array.from(operations).toSorted(compareOperationsDeterministic);
    for (const operation of sorted) {
        applyOperation(state, operation);
    }

    return state;
}

/**
 * Applies operations to produce a derived state from scratch.
 */
export function applyCloudSyncOperations(
    operations: readonly CloudSyncOperation[]
): CloudSyncState {
    const state = createEmptyState();

    const sorted = Array.from(operations).toSorted(compareOperationsDeterministic);
    for (const operation of sorted) {
        applyOperation(state, operation);
    }

    return state;
}
