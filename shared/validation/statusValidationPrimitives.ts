import type { MonitorStatus, StatusHistoryStatus } from "@shared/types";

import { STATUS_KIND } from "@shared/types";

/**
 * Ordered tuple of valid {@link StatusHistoryStatus} values for historical
 * monitor records.
 *
 * @remarks
 * Centralized here so both monitor and status-update schemas can share the same
 * literal set without duplication.
 */
export const statusHistoryEnumValues: [
    StatusHistoryStatus,
    ...StatusHistoryStatus[],
] = [
    STATUS_KIND.UP,
    STATUS_KIND.DOWN,
    STATUS_KIND.DEGRADED,
];

/**
 * Ordered tuple of all {@link MonitorStatus} variants supported by monitor and
 * status-update schemas.
 *
 * @remarks
 * The order matches the user-facing status hierarchy so that validation and UI
 * rendering remain in sync.
 */
export const monitorStatusEnumValues: [MonitorStatus, ...MonitorStatus[]] = [
    STATUS_KIND.DEGRADED,
    STATUS_KIND.DOWN,
    STATUS_KIND.PAUSED,
    STATUS_KIND.PENDING,
    STATUS_KIND.UP,
];
