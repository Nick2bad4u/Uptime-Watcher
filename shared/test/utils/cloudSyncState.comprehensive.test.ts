/**
 * Comprehensive tests for deterministic cloud sync state app.
 */

import type { CloudSyncOperation } from "@shared/types/cloudSync";
import type { CloudSyncState } from "@shared/types/cloudSyncState";

import {
    applyCloudSyncOperations,
    applyCloudSyncOperationsToState,
} from "@shared/utils/cloudSyncState";
import { describe, expect, it } from "vitest";

function setField(
    partial: Omit<CloudSyncOperation, "kind"> & {
        field: string;
        value: unknown;
    }
): CloudSyncOperation {
    return {
        kind: "set-field",
        ...partial,
    } as CloudSyncOperation;
}

function deleteEntity(
    partial: Omit<CloudSyncOperation, "kind"> & {
        entityId: string;
        entityType:
            | "monitor"
            | "settings"
            | "site";
    }
): CloudSyncOperation {
    return {
        kind: "delete-entity",
        ...partial,
    };
}

const PROTOTYPE_PROPERTY_NAME = "__proto__";

describe("cloudSyncState", () => {
    it("applies set-field operations into a derived state", () => {
        const state = applyCloudSyncOperations([
            setField({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                field: "monitoring",
                opId: 1,
                syncSchemaVersion: 1,
                timestamp: 1,
                value: true,
            }),
        ]);

        expect(state.site["site-1"]).toBeDefined();
        expect(state.site["site-1"]?.fields["monitoring"]?.value).toBeTruthy();
    });

    it("ensures newer writes replace older writes", () => {
        const state = applyCloudSyncOperations([
            setField({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                field: "monitoring",
                opId: 1,
                syncSchemaVersion: 1,
                timestamp: 1,
                value: true,
            }),
            setField({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                field: "monitoring",
                opId: 2,
                syncSchemaVersion: 1,
                timestamp: 2,
                value: false,
            }),
        ]);

        expect(state.site["site-1"]?.fields["monitoring"]?.value).toBeFalsy();
    });

    it("treats delete-entity as a tombstone that blocks older writes", () => {
        const state = applyCloudSyncOperations([
            setField({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                field: "monitoring",
                opId: 1,
                syncSchemaVersion: 1,
                timestamp: 1,
                value: true,
            }),
            deleteEntity({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                opId: 2,
                syncSchemaVersion: 1,
                timestamp: 2,
            }),
            // Older than deletion => ignored.
            setField({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                field: "monitoring",
                opId: 3,
                syncSchemaVersion: 1,
                timestamp: 1,
                value: false,
            }),
        ]);

        const entity = state.site["site-1"];
        expect(entity?.deleted).toBeDefined();
        expect(entity?.fields["monitoring"]?.value).toBeFalsy();
    });

    it("treats delete-entity as winning ties when write keys are equal", () => {
        const state = applyCloudSyncOperations([
            setField({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                field: "monitoring",
                opId: 1,
                syncSchemaVersion: 1,
                timestamp: 1,
                value: true,
            }),
            // Corrupt/tie case: delete shares the same write key as the field
            // write. Deterministic ordering should ensure delete wins.
            deleteEntity({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                opId: 1,
                syncSchemaVersion: 1,
                timestamp: 1,
            }),
        ]);

        const entity = state.site["site-1"];
        expect(entity?.deleted).toBeDefined();
        expect(entity?.fields["monitoring"]?.value).toBeTruthy();
    });

    it("resurrects an entity when a newer write arrives after deletion", () => {
        const state = applyCloudSyncOperations([
            deleteEntity({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                opId: 1,
                syncSchemaVersion: 1,
                timestamp: 2,
            }),
            setField({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                field: "monitoring",
                opId: 2,
                syncSchemaVersion: 1,
                timestamp: 3,
                value: true,
            }),
        ]);

        const entity = state.site["site-1"];
        expect(entity?.fields["monitoring"]?.value).toBeTruthy();
        expect("deleted" in (entity ?? {})).toBeFalsy();
    });

    it("clones initial state when applying operations to an existing snapshot", () => {
        const initialState: CloudSyncState = {
            monitor: {},
            settings: {},
            site: {
                "site-1": {
                    entityId: "site-1",
                    entityType: "site",
                    fields: {
                        monitoring: {
                            value: true,
                            write: { deviceId: "a", opId: 1, timestamp: 1 },
                        },
                    },
                },
            },
        };

        const next = applyCloudSyncOperationsToState(initialState, [
            setField({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                field: "monitoring",
                opId: 2,
                syncSchemaVersion: 1,
                timestamp: 2,
                value: false,
            }),
        ]);

        expect(next).not.toBe(initialState);
        expect(next.site["site-1"]).not.toBe(initialState.site["site-1"]);
        expect(
            initialState.site["site-1"]?.fields["monitoring"]?.value
        ).toBeTruthy();
        expect(next.site["site-1"]?.fields["monitoring"]?.value).toBeFalsy();
    });

    it("stores prototype-named entity ids as own state entries", () => {
        const state = applyCloudSyncOperations([
            setField({
                deviceId: "a",
                entityId: "__proto__",
                entityType: "site",
                field: "monitoring",
                opId: 1,
                syncSchemaVersion: 1,
                timestamp: 1,
                value: true,
            }),
        ]);

        expect(Object.getPrototypeOf(state.site)).toBeNull();
        expect(Object.hasOwn(state.site, PROTOTYPE_PROPERTY_NAME)).toBeTruthy();
        expect(state.site[PROTOTYPE_PROPERTY_NAME]?.entityId).toBe(
            PROTOTYPE_PROPERTY_NAME
        );
        expect(
            state.site[PROTOTYPE_PROPERTY_NAME]?.fields["monitoring"]?.value
        ).toBeTruthy();
    });

    it("stores prototype-named fields as own field entries", () => {
        const state = applyCloudSyncOperations([
            setField({
                deviceId: "a",
                entityId: "site-1",
                entityType: "site",
                field: "__proto__",
                opId: 1,
                syncSchemaVersion: 1,
                timestamp: 1,
                value: "field-value",
            }),
        ]);

        const entity = state.site["site-1"];

        expect(entity).toBeDefined();
        expect(Object.getPrototypeOf(entity?.fields)).toBeNull();
        expect(
            Object.hasOwn(entity?.fields ?? {}, PROTOTYPE_PROPERTY_NAME)
        ).toBeTruthy();
        expect(entity?.fields[PROTOTYPE_PROPERTY_NAME]?.value).toBe(
            "field-value"
        );
    });

    it("normalizes cloned snapshot maps before applying new operations", () => {
        const initialState = JSON.parse(`{
            "monitor": {},
            "settings": {},
            "site": {
                "__proto__": {
                    "entityId": "__proto__",
                    "entityType": "site",
                    "fields": {
                        "__proto__": {
                            "value": "old-value",
                            "write": {
                                "deviceId": "a",
                                "opId": 1,
                                "timestamp": 1
                            }
                        }
                    }
                }
            }
        }`) as CloudSyncState;

        const next = applyCloudSyncOperationsToState(initialState, [
            setField({
                deviceId: "a",
                entityId: "__proto__",
                entityType: "site",
                field: "__proto__",
                opId: 2,
                syncSchemaVersion: 1,
                timestamp: 2,
                value: "new-value",
            }),
        ]);

        const entity = next.site[PROTOTYPE_PROPERTY_NAME];

        expect(Object.getPrototypeOf(next.site)).toBeNull();
        expect(entity?.entityId).toBe(PROTOTYPE_PROPERTY_NAME);
        expect(Object.getPrototypeOf(entity?.fields)).toBeNull();
        expect(
            Object.hasOwn(entity?.fields ?? {}, PROTOTYPE_PROPERTY_NAME)
        ).toBeTruthy();
        expect(entity?.fields[PROTOTYPE_PROPERTY_NAME]?.value).toBe(
            "new-value"
        );
    });
});
