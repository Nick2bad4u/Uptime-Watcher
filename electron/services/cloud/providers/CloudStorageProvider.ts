/**
 * Back-compat wrapper for provider type exports.
 *
 * @remarks
 * The canonical definitions live in `CloudStorageProvider.types.ts`.
 * This wrapper exists to avoid churn across imports while we migrate call sites.
 */

/** Runtime marker to ensure this wrapper participates in coverage. */
export const CLOUD_STORAGE_PROVIDER_TYPES_WRAPPER =
    "cloud-storage-provider-types-wrapper" as const;

export type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "./CloudStorageProvider.types";
