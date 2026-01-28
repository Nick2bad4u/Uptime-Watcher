import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type {
    CloudSyncResetPreview,
    CloudSyncResetPreviewDevice,
} from "@shared/types/cloudSyncResetPreview";

import {
    CLOUD_PROVIDER_KIND,
    type CloudProviderDetails,
    type CloudStatusSummary,
} from "@shared/types/cloud";
import * as z from "zod";

const cloudProviderKindSchema = z.enum([
    CLOUD_PROVIDER_KIND.DROPBOX,
    CLOUD_PROVIDER_KIND.FILESYSTEM,
    CLOUD_PROVIDER_KIND.GOOGLE_DRIVE,
    CLOUD_PROVIDER_KIND.WEBDAV,
]);

const cloudEncryptionModeSchema = z.enum(["none", "passphrase"]);

const cloudProviderDetailsSchema: z.ZodType<CloudProviderDetails> =
    z.discriminatedUnion("kind", [
        z
            .object({
                baseDirectory: z.string().min(1),
                kind: z.literal(CLOUD_PROVIDER_KIND.FILESYSTEM),
            })
            .strict(),
        z
            .object({
                accountLabel: z.string().min(1).optional(),
                kind: z.enum([
                    CLOUD_PROVIDER_KIND.DROPBOX,
                    CLOUD_PROVIDER_KIND.GOOGLE_DRIVE,
                    CLOUD_PROVIDER_KIND.WEBDAV,
                ]),
            })
            .strict(),
    ]);

// NOTE: Zod v4's type-level object inference + strict TS settings can produce
// spurious optional properties for nullable fields. The runtime schema is the
// source of truth; we cast to the shared interface to satisfy
// `--isolatedDeclarations` and keep downstream IPC code strongly typed.
const cloudStatusSummaryInternalSchema = z
    .object({
        backupsEnabled: z.boolean(),
        configured: z.boolean(),
        connected: z.boolean(),
        encryptionLocked: z.boolean(),
        encryptionMode: cloudEncryptionModeSchema,
        lastBackupAt: z.number().nullable(),
        lastError: z.string().min(1).optional(),
        lastSyncAt: z.number().nullable(),
        provider: cloudProviderKindSchema.nullable(),
        providerDetails: cloudProviderDetailsSchema.optional(),
        syncEnabled: z.boolean(),
    })
    .strict()
    .superRefine((value, ctx) => {
        if (value.provider === null && value.providerDetails !== undefined) {
            ctx.addIssue({
                code: "custom",
                message:
                    "providerDetails must be omitted when provider is null",
                path: ["providerDetails"],
            });
        }
    });

export const cloudStatusSummarySchema: z.ZodType<CloudStatusSummary> =
    cloudStatusSummaryInternalSchema.transform((value) => {
        const provider = value.provider ?? null;

        return {
            ...value,
            lastBackupAt: value.lastBackupAt ?? null,
            lastSyncAt: value.lastSyncAt ?? null,
            provider,
            providerDetails:
                provider === null ? undefined : value.providerDetails,
        };
    });

const cloudSyncResetPreviewDeviceSchema: z.ZodType<CloudSyncResetPreviewDevice> =
    z
        .object({
            deviceId: z.string().min(1),
            newestCreatedAtEpochMs: z.number().optional(),
            oldestCreatedAtEpochMs: z.number().optional(),
            operationObjectCount: z.int().nonnegative(),
        })
        .strict();

/** Zod schema for {@link CloudSyncResetPreview}. */
const cloudSyncResetPreviewInternalSchema = z
    .object({
        deviceIds: z.array(z.string().min(1)),
        fetchedAt: z.number(),
        latestSnapshotKey: z.string().min(1).optional(),
        operationDeviceIds: z.array(z.string().min(1)),
        operationObjectCount: z.int().nonnegative(),
        otherObjectCount: z.int().nonnegative(),
        perDevice: z.array(cloudSyncResetPreviewDeviceSchema),
        resetAt: z.number().optional(),
        snapshotObjectCount: z.int().nonnegative(),
        syncObjectCount: z.int().nonnegative(),
    })
    .strict();

export const cloudSyncResetPreviewSchema: z.ZodType<CloudSyncResetPreview> =
    cloudSyncResetPreviewInternalSchema.transform((value) => ({
        deviceIds: value.deviceIds,
        fetchedAt: value.fetchedAt,
        latestSnapshotKey: value.latestSnapshotKey,
        operationDeviceIds: value.operationDeviceIds,
        operationObjectCount: value.operationObjectCount,
        otherObjectCount: value.otherObjectCount,
        perDevice: value.perDevice,
        resetAt: value.resetAt,
        snapshotObjectCount: value.snapshotObjectCount,
        syncObjectCount: value.syncObjectCount,
    }));

const cloudSyncResetDeletionFailureSchema: z.ZodType<
    CloudSyncResetResult["failedDeletions"][number]
> = z
    .object({
        key: z.string().min(1),
        message: z.string().min(1),
    })
    .strict();

/** Zod schema for {@link CloudSyncResetResult}. */
const cloudSyncResetResultInternalSchema = z
    .object({
        completedAt: z.number(),
        deletedObjects: z.int().nonnegative(),
        failedDeletions: z.array(cloudSyncResetDeletionFailureSchema),
        resetAt: z.number(),
        seededSnapshotKey: z.string().min(1).optional(),
        startedAt: z.number(),
    })
    .strict();

export const cloudSyncResetResultSchema: z.ZodType<CloudSyncResetResult> =
    cloudSyncResetResultInternalSchema.transform((value) => ({
        completedAt: value.completedAt,
        deletedObjects: value.deletedObjects,
        failedDeletions: value.failedDeletions,
        resetAt: value.resetAt,
        seededSnapshotKey: value.seededSnapshotKey,
        startedAt: value.startedAt,
    }));

export const validateCloudStatusSummary = (
    value: unknown
): ReturnType<typeof cloudStatusSummarySchema.safeParse> =>
    cloudStatusSummarySchema.safeParse(value);

export const validateCloudSyncResetPreview = (
    value: unknown
): ReturnType<typeof cloudSyncResetPreviewSchema.safeParse> =>
    cloudSyncResetPreviewSchema.safeParse(value);

export const validateCloudSyncResetResult = (
    value: unknown
): ReturnType<typeof cloudSyncResetResultSchema.safeParse> =>
    cloudSyncResetResultSchema.safeParse(value);
