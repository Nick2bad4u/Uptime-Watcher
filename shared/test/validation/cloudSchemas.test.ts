/**
 * Tests for shared Zod schemas in validation/cloudSchemas.
 */

import {
    validateCloudStatusSummary,
    validateCloudSyncResetPreview,
    validateCloudSyncResetResult,
} from "@shared/validation/cloudSchemas";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

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

    it("rejects CloudStatusSummary with invalid timestamp values", () => {
        for (const timestamp of [
            -1,
            1.5,
            MAX_VALID_DATE_EPOCH_MS + 1,
        ]) {
            const parsed = validateCloudStatusSummary({
                backupsEnabled: false,
                configured: false,
                connected: false,
                encryptionLocked: false,
                encryptionMode: "none",
                lastBackupAt: timestamp,
                lastSyncAt: null,
                provider: null,
                syncEnabled: false,
            });

            expect(parsed.success).toBeFalsy();
        }
    });

    it("accepts CloudStatusSummary timestamps at the Date upper bound", () => {
        const parsed = validateCloudStatusSummary({
            backupsEnabled: false,
            configured: false,
            connected: false,
            encryptionLocked: false,
            encryptionMode: "none",
            lastBackupAt: MAX_VALID_DATE_EPOCH_MS,
            lastSyncAt: MAX_VALID_DATE_EPOCH_MS,
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

    it("rejects providerDetails with a mismatched provider kind", () => {
        const parsed = validateCloudStatusSummary({
            backupsEnabled: true,
            configured: true,
            connected: true,
            encryptionLocked: false,
            encryptionMode: "none",
            lastBackupAt: null,
            lastSyncAt: null,
            provider: "dropbox",
            providerDetails: {
                accountLabel: "person@example.com",
                kind: "google-drive",
            },
            syncEnabled: true,
        });

        expect(parsed.success).toBeFalsy();
    });

    it("accepts providerDetails with a matching provider kind", () => {
        const parsed = validateCloudStatusSummary({
            backupsEnabled: true,
            configured: true,
            connected: true,
            encryptionLocked: false,
            encryptionMode: "none",
            lastBackupAt: null,
            lastSyncAt: null,
            provider: "dropbox",
            providerDetails: {
                accountLabel: "person@example.com",
                kind: "dropbox",
            },
            syncEnabled: true,
        });

        expect(parsed.success).toBeTruthy();
    });

    it("accepts an empty filesystem baseDirectory for unconfigured status", () => {
        const parsed = validateCloudStatusSummary({
            backupsEnabled: false,
            configured: false,
            connected: false,
            encryptionLocked: false,
            encryptionMode: "none",
            lastBackupAt: null,
            lastSyncAt: null,
            provider: "filesystem",
            providerDetails: {
                baseDirectory: "",
                kind: "filesystem",
            },
            syncEnabled: false,
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects non-empty invalid filesystem baseDirectory details", () => {
        const parsed = validateCloudStatusSummary({
            backupsEnabled: false,
            configured: false,
            connected: false,
            encryptionLocked: false,
            encryptionMode: "none",
            lastBackupAt: null,
            lastSyncAt: null,
            provider: "filesystem",
            providerDetails: {
                baseDirectory: "relative/backups",
                kind: "filesystem",
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

    it("rejects CloudSyncResetPreview with invalid timestamp values", () => {
        for (const invalidTimestamp of [
            -1,
            1.5,
            MAX_VALID_DATE_EPOCH_MS + 1,
        ]) {
            const parsed = validateCloudSyncResetPreview({
                deviceIds: ["device-a"],
                fetchedAt: invalidTimestamp,
                operationDeviceIds: ["device-a"],
                operationObjectCount: 1,
                otherObjectCount: 0,
                perDevice: [
                    {
                        deviceId: "device-a",
                        newestCreatedAtEpochMs: invalidTimestamp,
                        oldestCreatedAtEpochMs: 1,
                        operationObjectCount: 1,
                    },
                ],
                resetAt: 1,
                snapshotObjectCount: 0,
                syncObjectCount: 1,
            });

            expect(parsed.success).toBeFalsy();
        }
    });

    it("accepts CloudSyncResetPreview timestamps at the Date upper bound", () => {
        const parsed = validateCloudSyncResetPreview({
            deviceIds: ["device-a"],
            fetchedAt: MAX_VALID_DATE_EPOCH_MS,
            operationDeviceIds: ["device-a"],
            operationObjectCount: 1,
            otherObjectCount: 0,
            perDevice: [
                {
                    deviceId: "device-a",
                    newestCreatedAtEpochMs: MAX_VALID_DATE_EPOCH_MS,
                    oldestCreatedAtEpochMs: MAX_VALID_DATE_EPOCH_MS,
                    operationObjectCount: 1,
                },
            ],
            resetAt: MAX_VALID_DATE_EPOCH_MS,
            snapshotObjectCount: 0,
            syncObjectCount: 1,
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

    it("rejects CloudSyncResetResult with invalid timestamp values", () => {
        for (const invalidTimestamp of [
            -1,
            1.5,
            MAX_VALID_DATE_EPOCH_MS + 1,
        ]) {
            const parsed = validateCloudSyncResetResult({
                completedAt: invalidTimestamp,
                deletedObjects: 0,
                failedDeletions: [],
                resetAt: 2,
                startedAt: 1,
            });

            expect(parsed.success).toBeFalsy();
        }
    });

    it("accepts CloudSyncResetResult timestamps at the Date upper bound", () => {
        const parsed = validateCloudSyncResetResult({
            completedAt: MAX_VALID_DATE_EPOCH_MS,
            deletedObjects: 0,
            failedDeletions: [],
            resetAt: MAX_VALID_DATE_EPOCH_MS,
            startedAt: MAX_VALID_DATE_EPOCH_MS,
        });

        expect(parsed.success).toBeTruthy();
    });
});
