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

const cloudProviderDetailsSchema: z.ZodType<CloudProviderDetails> = z.discriminatedUnion(
    "kind",
    [
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
    ]
);

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
        lastBackupAt: z.union([z.number(), z.null()]),
        lastError: z.string().min(1).optional(),
        lastSyncAt: z.union([z.number(), z.null()]),
        provider: z.union([cloudProviderKindSchema, z.null()]),
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Runtime schema enforces the interface; cast works around Zod typing noise.
    cloudStatusSummaryInternalSchema as unknown as z.ZodType<CloudStatusSummary>;

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Runtime schema enforces the interface; cast works around Zod typing noise.
    cloudSyncResetPreviewInternalSchema as unknown as z.ZodType<CloudSyncResetPreview>;

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Runtime schema enforces the interface; cast works around Zod typing noise.
    cloudSyncResetResultInternalSchema as unknown as z.ZodType<CloudSyncResetResult>;

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
