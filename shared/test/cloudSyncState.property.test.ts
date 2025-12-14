import { describe, expect, it } from "vitest";

import fc from "fast-check";

import {
    CLOUD_SYNC_SCHEMA_VERSION,
    type CloudSyncOperation,
    parseCloudSyncOperation,
} from "@shared/types/cloudSync";
import { applyCloudSyncOperations } from "@shared/utils/cloudSyncState";

const hexCharArb = fc.constantFrom(
    ...("0123456789abcdef".split("") as readonly string[])
);

const deviceIdArb = fc
    .array(hexCharArb, { minLength: 1, maxLength: 8 })
    .map((chars) => chars.join(""));
const entityIdArb = fc
    .array(hexCharArb, { minLength: 1, maxLength: 12 })
    .map((chars) => chars.join(""));
const fieldArb = fc.string({ minLength: 1, maxLength: 16 });
const timestampArb = fc.integer({ min: 0, max: 9999 });
const opIdArb = fc.integer({ min: 0, max: 999 });

const entityTypeArb = fc.constantFrom(
    "site" as const,
    "monitor" as const,
    "settings" as const
);

const setFieldOperationArb: fc.Arbitrary<CloudSyncOperation> = fc
    .record({
        deviceId: deviceIdArb,
        entityId: entityIdArb,
        entityType: entityTypeArb,
        field: fieldArb,
        kind: fc.constant("set-field" as const),
        opId: opIdArb,
        syncSchemaVersion: fc.constant(CLOUD_SYNC_SCHEMA_VERSION),
        timestamp: timestampArb,
        value: fc.jsonValue(),
    })
    .map((value) => parseCloudSyncOperation(value));

const deleteEntityOperationArb: fc.Arbitrary<CloudSyncOperation> = fc
    .record({
        deviceId: deviceIdArb,
        entityId: entityIdArb,
        entityType: entityTypeArb,
        kind: fc.constant("delete-entity" as const),
        opId: opIdArb,
        syncSchemaVersion: fc.constant(CLOUD_SYNC_SCHEMA_VERSION),
        timestamp: timestampArb,
    })
    .map((value) => parseCloudSyncOperation(value));

const operationArb: fc.Arbitrary<CloudSyncOperation> = fc.oneof(
    setFieldOperationArb,
    deleteEntityOperationArb
);

describe(applyCloudSyncOperations, () => {
    it("is order-independent (deterministic)", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(operationArb, { maxLength: 50 }).chain((ops) =>
                    fc.tuple(
                        fc.constant(ops),
                        fc.shuffledSubarray(ops, {
                            minLength: ops.length,
                            maxLength: ops.length,
                        })
                    )),
                async ([ops, shuffled]) => {
                    const state = applyCloudSyncOperations(ops);
                    const shuffledState = applyCloudSyncOperations(shuffled);
                    expect(shuffledState).toEqual(state);
                }
            ),
            { numRuns: 50 }
        );
    });

    it("is idempotent for duplicated operations", async () => {
        await fc.assert(
            fc.asyncProperty(fc.array(operationArb, { maxLength: 50 }), async (
                ops
            ) => {
                const state = applyCloudSyncOperations(ops);
                const duplicated = applyCloudSyncOperations([...ops, ...ops]);
                expect(duplicated).toEqual(state);
            }),
            { numRuns: 50 }
        );
    });
});
