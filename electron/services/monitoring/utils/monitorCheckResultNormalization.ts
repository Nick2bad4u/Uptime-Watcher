import type { StatusUpdate } from "@shared/types";

import { isRecord } from "@shared/utils/typeHelpers";

import type { StatusUpdateMonitorCheckResult } from "../MonitorStatusUpdateService";
import type { MonitorCheckResult } from "../types";

/**
 * Creates a fallback failure result for monitor services.
 */
export function toFailure(details?: string): MonitorCheckResult {
    return {
        ...(details ? { details } : {}),
        responseTime: 0,
        status: "down",
    };
}

/**
 * Runtime validation guard for {@link MonitorCheckResult}.
 */
export function isValidServiceResult(value: unknown): value is MonitorCheckResult {
    if (!isRecord(value)) {
        return false;
    }

    const { responseTime, status } = value;

    if (status !== "up" && status !== "down" && status !== "degraded") {
        return false;
    }

    if (typeof responseTime !== "number") {
        return false;
    }

    return true;
}

/**
 * Create the baseline, human-readable details string for a status update.
 */
export function resolveStatusUpdateDetails(args: {
    serviceDetails?: string;
    status: StatusUpdate["status"];
}): string {
    const trimmed = args.serviceDetails?.trim();
    if (trimmed) {
        return trimmed;
    }

    switch (args.status) {
        case "degraded": {
            return "Monitor is partially responding";
        }
        case "down": {
            return "Monitor is not responding";
        }
        case "paused": {
            return "Monitor is paused";
        }
        case "pending": {
            return "Monitor check pending";
        }
        case "up": {
            return "Monitor is responding";
        }
        default: {
            return "Monitor check completed";
        }
    }
}

/**
 * Convert a raw monitor service check result into a stable payload for
 * {@link MonitorStatusUpdateService}.
 */
export function buildStatusUpdateMonitorCheckResult(args: {
    monitorId: string;
    operationId: string;
    serviceResult: MonitorCheckResult;
    timestamp?: Date;
}): StatusUpdateMonitorCheckResult {
    const { monitorId, operationId, serviceResult } = args;
    const timestamp = args.timestamp ?? new Date();

    return {
        details:
            serviceResult.details ??
            (serviceResult.status === "up"
                ? "Check successful"
                : "Check failed"),
        monitorId,
        operationId,
        responseTime: serviceResult.responseTime,
        status: serviceResult.status,
        timestamp,
    };
}
