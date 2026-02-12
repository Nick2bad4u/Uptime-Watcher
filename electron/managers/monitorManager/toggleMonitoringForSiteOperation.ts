/**
 * Per-site monitor toggle helper.
 *
 * @remarks
 * Extracted from {@link electron/managers/MonitorManager#MonitorManager} to
 * centralize event emission and keep the manager focused on orchestration.
 *
 * @packageDocumentation
 */

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";

type ToggleMonitoringForSiteOperationArgs =
    | {
          readonly eventEmitter: TypedEventBus<UptimeEvents>;
          readonly identifier: string;
          readonly monitorId: string | undefined;
          readonly operation: "started";
          readonly toggle: () => Promise<boolean>;
      }
    | {
          readonly eventEmitter: TypedEventBus<UptimeEvents>;
          readonly identifier: string;
          readonly monitorId: string | undefined;
          readonly operation: "stopped";
          readonly reason: UptimeEvents["internal:monitor:stopped"]["reason"];
          readonly toggle: () => Promise<boolean>;
      };

/**
 * Emits the canonical per-site start/stop events after executing a toggle.
 *
 * @param args - Operation arguments.
 */
export async function toggleMonitoringForSiteOperation(
    args: ToggleMonitoringForSiteOperationArgs
): Promise<boolean> {
    const { eventEmitter, identifier, monitorId, operation, toggle } = args;

    const result = await toggle();

    if (!result) {
        return false;
    }

    if (operation === "started") {
        const payload: UptimeEvents["internal:monitor:started"] = {
            identifier,
            operation: "started",
            timestamp: Date.now(),
            ...(monitorId ? { monitorId } : {}),
        };

        await eventEmitter.emitTyped("internal:monitor:started", payload);
        return true;
    }

    const { reason } = args;

    const payload: UptimeEvents["internal:monitor:stopped"] = {
        identifier,
        operation: "stopped",
        reason,
        timestamp: Date.now(),
        ...(monitorId ? { monitorId } : {}),
    };

    await eventEmitter.emitTyped("internal:monitor:stopped", payload);
    return true;
}
