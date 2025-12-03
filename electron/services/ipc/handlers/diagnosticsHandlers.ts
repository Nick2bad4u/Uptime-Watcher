import type {
    IpcHandlerVerificationLogMetadata,
    IpcInvokeChannel,
    PreloadGuardDiagnosticsLogMetadata,
    PreloadGuardDiagnosticsReport,
} from "@shared/types/ipc";
import type { UnknownRecord } from "type-fest";

import { diagnosticsLogger, logger } from "../../../utils/logger";
import {
    recordMissingHandler,
    recordPreloadGuardFailure,
    recordSuccessfulHandlerCheck,
} from "../diagnosticsMetrics";
import { registerStandardizedIpcHandler } from "../utils";
import { SystemHandlerValidators } from "../validators";
import { withIgnoredIpcEvent } from "./handlerShared";

const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isPreloadGuardDiagnosticsReport = (
    value: unknown
): value is PreloadGuardDiagnosticsReport => {
    if (!isUnknownRecord(value)) {
        return false;
    }

    return (
        typeof value["channel"] === "string" &&
        typeof value["guard"] === "string" &&
        typeof value["timestamp"] === "number"
    );
};

/**
 * Dependencies for telemetry/diagnostics IPC handlers.
 */
export interface DiagnosticsHandlersDependencies {
    readonly registeredHandlers: Set<IpcInvokeChannel>;
    readonly reportChannel: Extract<
        IpcInvokeChannel,
        "diagnostics-report-preload-guard"
    >;
    readonly verifyChannel: Extract<
        IpcInvokeChannel,
        "diagnostics-verify-ipc-handler"
    >;
}

/**
 * Registers diagnostics-related IPC handlers used by the preload bridge.
 */
export function registerDiagnosticsHandlers({
    registeredHandlers,
    reportChannel,
    verifyChannel,
}: DiagnosticsHandlersDependencies): void {
    registerStandardizedIpcHandler<"diagnostics-verify-ipc-handler">(
        verifyChannel,
        withIgnoredIpcEvent((channelRaw) => {
            if (typeof channelRaw !== "string") {
                throw new TypeError("Channel name must be a non-empty string");
            }

            const availableChannels = Array.from(registeredHandlers).toSorted(
                (left, right) => left.localeCompare(right)
            );

            const matchedChannel = availableChannels.find(
                (registeredChannel) => registeredChannel === channelRaw
            );
            const isRegistered = matchedChannel !== undefined;

            if (isRegistered) {
                recordSuccessfulHandlerCheck();
            } else {
                recordMissingHandler(channelRaw);
                const logMetadata: IpcHandlerVerificationLogMetadata = {
                    availableChannels,
                    channel: channelRaw,
                };
                logger.error(
                    "[IpcService] Missing IPC handler requested by preload bridge",
                    logMetadata
                );
            }

            return {
                availableChannels,
                channel: channelRaw,
                registered: isRegistered,
            };
        }),
        SystemHandlerValidators.verifyIpcHandler,
        registeredHandlers
    );

    registerStandardizedIpcHandler<"diagnostics-report-preload-guard">(
        reportChannel,
        withIgnoredIpcEvent((reportCandidate): undefined => {
            if (!isPreloadGuardDiagnosticsReport(reportCandidate)) {
                throw new TypeError(
                    "Invalid preload guard diagnostics payload"
                );
            }

            const report = reportCandidate;

            recordPreloadGuardFailure(report);

            const logMetadata: PreloadGuardDiagnosticsLogMetadata = {
                channel: report.channel,
                guard: report.guard,
                ...(report.metadata !== undefined && {
                    metadata: report.metadata,
                }),
                ...(report.payloadPreview !== undefined && {
                    payloadPreview: report.payloadPreview,
                }),
                ...(report.reason !== undefined && { reason: report.reason }),
                timestamp: report.timestamp,
            };

            diagnosticsLogger.warn(
                "[IpcDiagnostics] Preload guard rejected payload",
                logMetadata
            );

            return undefined;
        }),
        SystemHandlerValidators.reportPreloadGuard,
        registeredHandlers
    );
}
