import { ensureError } from "@shared/utils/errorHandling";

import { RETRY_CONSTRAINTS } from "../../constants";
import { logger } from "../../services/logger";

/**
 * Clamps retry attempts to the UI/validation constraints.
 *
 * @public
 */
export const clampRetryAttempts = (retryAttempts: number): number =>
    Math.min(
        Math.max(RETRY_CONSTRAINTS.MIN, retryAttempts),
        RETRY_CONSTRAINTS.MAX
    );

/**
 * Per-monitor UI edit state for the site details view.
 *
 * @public
 */
export interface MonitorEditState {
    readonly intervalChanged: boolean;
    readonly retryAttemptsChanged: boolean;
    readonly timeoutChanged: boolean;
    readonly userEditedCheckIntervalMs?: number | undefined;
    readonly userEditedRetryAttempts?: number | undefined;
    readonly userEditedTimeoutSeconds?: number | undefined;
}

/**
 * Default (no changes) edit state for a monitor.
 *
 * @public
 */
export const DEFAULT_MONITOR_EDIT_STATE: MonitorEditState = {
    intervalChanged: false,
    retryAttemptsChanged: false,
    timeoutChanged: false,
};

/**
 * Updates the monitor edit-state map for a specific monitor id.
 *
 * @public
 */
export function updateMonitorEditStateById(args: {
    readonly monitorId: string;
    readonly previous: Readonly<Record<string, MonitorEditState>>;
    readonly updater: (current: MonitorEditState) => MonitorEditState;
}): Record<string, MonitorEditState> {
    const current = args.previous[args.monitorId] ?? DEFAULT_MONITOR_EDIT_STATE;

    return {
        ...args.previous,
        [args.monitorId]: args.updater(current),
    };
}

/**
 * Executes a site-details operation and logs failures without rethrowing.
 *
 * @remarks
 * This helper prevents unhandled promise rejections for UI-driven operations
 * while allowing underlying store-level error handling to manage user-facing
 * error state.
 *
 * @public
 */
export async function runSiteDetailsOperation(
    context: string,
    operation: () => Promise<void>
): Promise<void> {
    try {
        await operation();
    } catch (error: unknown) {
        logger.app.error(context, ensureError(error));
    }
}
