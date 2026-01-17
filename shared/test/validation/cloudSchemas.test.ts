/**
 * Tests for shared Zod schemas in validation/cloudSchemas.
 */

import { describe, expect, it } from "vitest";

import {
    validateCloudStatusSummary,
    validateCloudSyncResetPreview,
    validateCloudSyncResetResult,
} from "@shared/validation/cloudSchemas";

describe("cloudSchemas", () => {
    it("validates a minimal CloudStatusSummary payload", () => {
        const parsed = validateCloudStatusSummary({
            backupsEnabled: false,
            configured: false,
            connected: false,
            encryptionLocked: false,
            encryptionMode: "none",
            lastBackupAt: null,
            lastSyncAt: null,
            provider: null,
            syncEnabled: false,
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects providerDetails when provider is null", () => {
        const parsed = validateCloudStatusSummary({
            backupsEnabled: false,
            configured: false,
            connected: false,
            encryptionLocked: false,
            encryptionMode: "none",
            lastBackupAt: null,
            lastSyncAt: null,
            provider: null,
            providerDetails: {
                kind: "filesystem",
                baseDirectory: "C:/tmp",
            },
            syncEnabled: false,
        });

        expect(parsed.success).toBeFalsy();
    });

    it("validates CloudSyncResetPreview", () => {
        const parsed = validateCloudSyncResetPreview({
            deviceIds: [],
            fetchedAt: 1,
            operationDeviceIds: [],
            operationObjectCount: 0,
            otherObjectCount: 0,
            perDevice: [],
            snapshotObjectCount: 0,
            syncObjectCount: 0,
        });

        expect(parsed.success).toBeTruthy();
    });

    it("validates CloudSyncResetResult", () => {
        const parsed = validateCloudSyncResetResult({
            completedAt: 2,
            deletedObjects: 0,
            failedDeletions: [],
            resetAt: 2,
            startedAt: 1,
        });

        expect(parsed.success).toBeTruthy();
    });
});
