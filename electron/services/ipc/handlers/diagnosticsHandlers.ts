import type {
    IpcHandlerVerificationLogMetadata,
    IpcInvokeChannel,
    PreloadGuardDiagnosticsLogMetadata,
    PreloadGuardDiagnosticsReport,
} from "@shared/types/ipc";
import type { UnknownRecord } from "type-fest";

import { generateCorrelationId } from "@shared/utils/correlation";
import {
    normalizeLogValue,
    withLogContext,
} from "@shared/utils/loggingContext";
import { isRecord as isSharedRecord } from "@shared/utils/typeHelpers";

import type { UptimeEvents } from "../../../events/eventTypes";
import type { TypedEventBus } from "../../../events/TypedEventBus";

import { diagnosticsLogger, logger } from "../../../utils/logger";
import {
    getUtfByteLength,
    MAX_DIAGNOSTICS_METADATA_BYTES,
    MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES,
    truncateUtfString,
} from "../diagnosticsLimits";
import {
    recordMissingHandler,
    recordPreloadGuardFailure,
    recordSuccessfulHandlerCheck,
} from "../diagnosticsMetrics";
import { registerStandardizedIpcHandler } from "../utils";
import { SystemHandlerValidators } from "../validators";
import { withIgnoredIpcEvent } from "./handlerShared";

const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    isSharedRecord(value);

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
 * Dependencies required to register diagnostics IPC handlers.
 */
export interface DiagnosticsHandlersDependencies {
    readonly eventEmitter: TypedEventBus<UptimeEvents>;
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

const normalizeDiagnosticsReportPayload = (
    report: PreloadGuardDiagnosticsReport
): {
    metadataTruncated: boolean;
    payloadPreviewTruncated: boolean;
    sanitizedReport: PreloadGuardDiagnosticsReport;
} => {
    let metadataTruncated = false;
    let payloadPreviewTruncated = false;

    let metadata: undefined | UnknownRecord = undefined;
    if (report.metadata) {
        const sanitizedMetadata = normalizeLogValue(report.metadata);
        if (isUnknownRecord(sanitizedMetadata)) {
            const serialized = JSON.stringify(sanitizedMetadata);
            if (
                getUtfByteLength(serialized) <= MAX_DIAGNOSTICS_METADATA_BYTES
            ) {
                metadata = sanitizedMetadata;
            } else {
                metadataTruncated = true;
            }
        }
    }

    let payloadPreview: string | undefined = undefined;
    if (typeof report.payloadPreview === "string") {
        const sanitizedPreview = normalizeLogValue(report.payloadPreview);
        if (typeof sanitizedPreview === "string") {
            const { truncated, value } = truncateUtfString(
                sanitizedPreview,
                MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES
            );
            payloadPreviewTruncated = truncated;
            payloadPreview = value;
        }
    }

    const sanitizedReport: PreloadGuardDiagnosticsReport = {
        channel: report.channel,
        guard: report.guard,
        timestamp: report.timestamp,
        ...(report.reason ? { reason: report.reason } : {}),
        ...(metadata ? { metadata } : {}),
        ...(payloadPreview ? { payloadPreview } : {}),
    };

    return {
        metadataTruncated,
        payloadPreviewTruncated,
        sanitizedReport,
    };
};

/**
 * Registers diagnostics-related IPC handlers used by the preload bridge.
 */
/**
 * Wires up diagnostics IPC handlers that support preload guard reporting and
 * verification.
 */
export function registerDiagnosticsHandlers({
    eventEmitter,
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

            const availableChannels = Array.from(registeredHandlers).toSorted((
                left,
                right
            ) => left.localeCompare(right));

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
                    withLogContext({
                        channel: channelRaw,
                        event: "diagnostics:verify-ipc-handler",
                        severity: "error",
                    }),
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

            const correlationId = generateCorrelationId();
            const {
                metadataTruncated,
                payloadPreviewTruncated,
                sanitizedReport,
            } = normalizeDiagnosticsReportPayload(reportCandidate);
            const report = sanitizedReport;

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
                withLogContext({
                    channel: report.channel,
                    correlationId,
                    event: "diagnostics:preload-guard-report",
                    severity: "warn",
                }),
                {
                    ...logMetadata,
                    metadataTruncated,
                    payloadPreviewTruncated,
                }
            );

            void eventEmitter.emitTyped("diagnostics:report-created", {
                channel: report.channel,
                correlationId,
                guard: report.guard,
                metadataTruncated,
                payloadPreviewLength: report.payloadPreview?.length ?? 0,
                payloadPreviewTruncated,
                ...(report.reason ? { reason: report.reason } : {}),
                timestamp: report.timestamp,
            });

            return undefined;
        }),
        SystemHandlerValidators.reportPreloadGuard,
        registeredHandlers
    );
}

/** @internal */
export const DiagnosticsHandlerTestUtils: {
    normalizeDiagnosticsReportPayload: typeof normalizeDiagnosticsReportPayload;
} = {
    normalizeDiagnosticsReportPayload,
};
