/**
 * Back-compat wrapper for sync transport type exports.
 *
 * @remarks
 * The canonical definitions live in `CloudSyncTransport.types.ts`.
 */

/** Runtime marker to ensure this wrapper participates in coverage. */
export const CLOUD_SYNC_TRANSPORT_TYPES_WRAPPER =
    "cloud-sync-transport-types-wrapper" as const;

export type {
    CloudSyncTransport,
    CloudSyncTransportFactory,
} from "./CloudSyncTransport.types";
