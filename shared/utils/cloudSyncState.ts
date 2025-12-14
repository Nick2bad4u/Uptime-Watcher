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

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

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
        if (shouldReplaceWrite(entity.deleted, write)) {
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

    state[operation.entityType][operation.entityId] =
        shouldResurrect || existingDeletion === undefined
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

    for (const operation of operations) {
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

    for (const operation of operations) {
        applyOperation(state, operation);
    }

    return state;
}
