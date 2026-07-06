/**
 * Shared map helpers for cloud sync state reducers.
 */

import type {
    CloudSyncEntityState,
    CloudSyncFieldValue,
} from "@shared/types/cloudSyncState";

import { createNullPrototypeObject } from "@shared/utils/objectSafety";

export type CloudSyncEntityStateMap = Record<string, CloudSyncEntityState>;
export type CloudSyncFieldValueMap = Record<string, CloudSyncFieldValue>;

/**
 * Creates a prototype-pollution-safe map for cloud sync entities.
 */
export function createCloudSyncEntityStateMap(): CloudSyncEntityStateMap {
    return createNullPrototypeObject<CloudSyncEntityStateMap>();
}

/**
 * Creates a prototype-pollution-safe map for cloud sync fields.
 */
export function createCloudSyncFieldValueMap(): CloudSyncFieldValueMap {
    return createNullPrototypeObject<CloudSyncFieldValueMap>();
}

/**
 * Defines an enumerable, writable own data property on a cloud sync map.
 */
export function setCloudSyncRecordValue<T>(
    target: Record<string, T>,
    key: string,
    value: T
): void {
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
}

/**
 * Sets an entity in a cloud sync entity map.
 */
export function setCloudSyncEntityValue(
    target: CloudSyncEntityStateMap,
    key: string,
    value: CloudSyncEntityState
): void {
    setCloudSyncRecordValue(target, key, value);
}

/**
 * Sets a field value in a cloud sync field map.
 */
export function setCloudSyncFieldValue(
    target: CloudSyncFieldValueMap,
    key: string,
    value: CloudSyncFieldValue
): void {
    setCloudSyncRecordValue(target, key, value);
}
