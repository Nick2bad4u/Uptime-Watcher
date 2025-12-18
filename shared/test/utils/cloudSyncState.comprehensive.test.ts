/**
 * Comprehensive tests for deterministic cloud sync state application.
 */

import { describe, expect, it } from "vitest";

import type { CloudSyncOperation } from "@shared/types/cloudSync";
import type { CloudSyncState } from "@shared/types/cloudSyncState";

import {
    applyCloudSyncOperations,
    applyCloudSyncOperationsToState,
} from "@shared/utils/cloudSyncState";

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
        entityType: "monitor" | "settings" | "site";
        entityId: string;
    }
): CloudSyncOperation {
    return {
        kind: "delete-entity",
        ...partial,
    } as CloudSyncOperation;
}

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
});
