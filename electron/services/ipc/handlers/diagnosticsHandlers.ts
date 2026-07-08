import type {
    IpcHandlerVerificationLogMetadata,
    IpcInvokeChannel,
    IpcInvokeChannelParams,
    PreloadGuardDiagnosticsLogMetadata,
    PreloadGuardDiagnosticsReport,
} from "@shared/types/ipc";
import type { UnknownRecord } from "type-fest";

import { DIAGNOSTICS_CHANNELS } from "@shared/types/preload";
import { generateCorrelationId } from "@shared/utils/correlation";
import { readBooleanEnv } from "@shared/utils/environment";
import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import {
    normalizeLogValue,
    withLogContext,
} from "@shared/utils/loggingContext";
import { compareStringsCodeUnit } from "@shared/utils/stringOrdering";
import { isNonNegativeSafeInteger } from "@shared/utils/typeGuards";
import { isRecord } from "@shared/utils/typeHelpers";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { isDefined, setHas } from "ts-extras";

import type { UptimeEvents } from "../../../events/eventTypes";
import type { TypedEventBus } from "../../../events/TypedEventBus";

import { isDev } from "../../../electronUtils";
import { fireAndForget } from "../../../utils/fireAndForget";
import { diagnosticsLogger, logger } from "../../../utils/logger";
import {
    getUtfByteLength,
    MAX_DIAGNOSTICS_METADATA_BYTES,
    MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES,
    MAX_DIAGNOSTICS_REPORT_GUARD_BYTES,
    MAX_DIAGNOSTICS_REPORT_REASON_BYTES,
    MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES,
    truncateUtfString,
} from "../diagnosticsLimits";
import {
    recordMissingHandler,
    recordPreloadGuardFailure,
    recordSuccessfulHandlerCheck,
} from "../diagnosticsMetrics";
import { createStandardizedIpcRegistrar } from "../utils";
import { SystemHandlerValidators } from "../validators/system";

const shouldExposeChannelInventory = (): boolean =>
    isDev() || readBooleanEnv("VITEST");

const isPreloadGuardDiagnosticsReport = (
    value: unknown
): value is PreloadGuardDiagnosticsReport => {
    if (!isRecord(value)) {
        return false;
    }

    const channel = getOwnDataProperty(value, "channel");
    const guard = getOwnDataProperty(value, "guard");
    const timestamp = getOwnDataProperty(value, "timestamp");

    return (
        channel.found &&
        guard.found &&
        timestamp.found &&
        typeof channel.value === "string" &&
        typeof guard.value === "string" &&
        isNonNegativeSafeInteger(timestamp.value) &&
        timestamp.value <= MAX_VALID_DATE_EPOCH_MS
    );
};

const getOwnString = (
    value: PreloadGuardDiagnosticsReport,
    key: keyof Pick<
        PreloadGuardDiagnosticsReport,
        | "channel"
        | "guard"
        | "payloadPreview"
        | "reason"
    >
): string | undefined => {
    const property = getOwnDataProperty(value, key);
    return property.found && typeof property.value === "string"
        ? property.value
        : undefined;
};

const getOwnTimestamp = (
    value: PreloadGuardDiagnosticsReport
): number | undefined => {
    const property = getOwnDataProperty(value, "timestamp");
    return property.found && typeof property.value === "number"
        ? property.value
        : undefined;
};

const getOwnMetadata = (value: PreloadGuardDiagnosticsReport): unknown => {
    const property = getOwnDataProperty(value, "metadata");
    return property.found ? property.value : undefined;
};

const normalizeDiagnosticsString = (
    value: string,
    maxBytes: number,
    fallback: string
): string => {
    const normalized = normalizeLogValue(value);
    if (typeof normalized !== "string") {
        return fallback;
    }

    const compacted = normalized.replaceAll(/\s+/gu, " ").trim();
    if (compacted.length === 0) {
        return fallback;
    }

    return truncateUtfString(compacted, maxBytes).value;
};

const normalizeOptionalDiagnosticsString = (
    value: string | undefined,
    maxBytes: number
): string | undefined => {
    if (!isDefined(value)) {
        return undefined;
    }

    const normalized = normalizeLogValue(value);
    if (typeof normalized !== "string") {
        return undefined;
    }

    const compacted = normalized.replaceAll(/\s+/gu, " ").trim();
    if (compacted.length === 0) {
        return undefined;
    }

    return truncateUtfString(compacted, maxBytes).value;
};

/**
 * Dependencies required to register diagnostics IPC handlers.
 */
export interface DiagnosticsHandlersDependencies {
    readonly eventEmitter: TypedEventBus<UptimeEvents>;
    readonly registeredHandlers: Set<IpcInvokeChannel>;
}

const normalizeDiagnosticsReportPayload = (
    report: PreloadGuardDiagnosticsReport
): {
    metadataTruncated: boolean;
    payloadPreviewTruncated: boolean;
    sanitizedReport: PreloadGuardDiagnosticsReport;
} => {
    let isMetadataTruncated = false;
    let isPayloadPreviewTruncated = false;

    let metadata: undefined | UnknownRecord;
    const metadataCandidate = getOwnMetadata(report);
    if (metadataCandidate) {
        const sanitizedMetadata = normalizeLogValue(metadataCandidate);
        if (isRecord(sanitizedMetadata)) {
            const serialized = JSON.stringify(sanitizedMetadata);
            if (
                getUtfByteLength(serialized) <= MAX_DIAGNOSTICS_METADATA_BYTES
            ) {
                metadata = sanitizedMetadata;
            } else {
                isMetadataTruncated = true;
            }
        }
    }

    let payloadPreview: string | undefined;
    const payloadPreviewCandidate = getOwnString(report, "payloadPreview");
    if (payloadPreviewCandidate) {
        const sanitizedPreview = normalizeLogValue(payloadPreviewCandidate);
        if (typeof sanitizedPreview === "string") {
            const { truncated, value } = truncateUtfString(
                sanitizedPreview,
                MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES
            );
            isPayloadPreviewTruncated = truncated;
            payloadPreview = value;
        }
    }

    const reason = normalizeOptionalDiagnosticsString(
        getOwnString(report, "reason"),
        MAX_DIAGNOSTICS_REPORT_REASON_BYTES
    );

    const sanitizedReport: PreloadGuardDiagnosticsReport = {
        channel: normalizeDiagnosticsString(
            getOwnString(report, "channel") ?? "",
            MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES,
            "unknown-channel"
        ),
        guard: normalizeDiagnosticsString(
            getOwnString(report, "guard") ?? "",
            MAX_DIAGNOSTICS_REPORT_GUARD_BYTES,
            "unknown-guard"
        ),
        timestamp: getOwnTimestamp(report) ?? 0,
        ...(reason && { reason }),
        ...(metadata && { metadata }),
        ...(payloadPreview && { payloadPreview }),
    };

    return {
        metadataTruncated: isMetadataTruncated,
        payloadPreviewTruncated: isPayloadPreviewTruncated,
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
}: DiagnosticsHandlersDependencies): void {
    const register = createStandardizedIpcRegistrar(registeredHandlers);

    register(
        DIAGNOSTICS_CHANNELS.verifyIpcHandler,
        (
            channelRaw: IpcInvokeChannelParams<
                typeof DIAGNOSTICS_CHANNELS.verifyIpcHandler
            >[0]
        ) => {
            if (typeof channelRaw !== "string") {
                throw new TypeError("Channel name must be a non-empty string");
            }

            // Do not expose the full channel inventory outside dev/test.
            const includeInventory = shouldExposeChannelInventory();

            const registeredHandlerSet: ReadonlySet<string> =
                registeredHandlers;
            const isRegistered = setHas(registeredHandlerSet, channelRaw);

            const availableChannels = includeInventory
                ? [...registeredHandlers].toSorted(compareStringsCodeUnit)
                : [];

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
                        metadata: logMetadata,
                        severity: "error",
                    })
                );
            }

            return {
                availableChannels,
                channel: channelRaw,
                registered: isRegistered,
            };
        },
        SystemHandlerValidators.verifyIpcHandler
    );

    register(
        DIAGNOSTICS_CHANNELS.reportPreloadGuard,
        (
            reportCandidate: IpcInvokeChannelParams<
                typeof DIAGNOSTICS_CHANNELS.reportPreloadGuard
            >[0]
        ): undefined => {
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
                ...(isDefined(report.metadata) && {
                    metadata: report.metadata,
                }),
                ...(isDefined(report.payloadPreview) && {
                    payloadPreview: report.payloadPreview,
                }),
                ...(isDefined(report.reason) && { reason: report.reason }),
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

            fireAndForget(
                () =>
                    eventEmitter.emitTyped("diagnostics:report-created", {
                        channel: report.channel,
                        correlationId,
                        guard: report.guard,
                        metadataTruncated,
                        payloadPreviewLength:
                            report.payloadPreview?.length ?? 0,
                        payloadPreviewTruncated,
                        ...(report.reason && { reason: report.reason }),
                        timestamp: report.timestamp,
                    }),
                {
                    onError(error) {
                        logger.error(
                            "[IpcDiagnostics] Failed to emit diagnostics report-created event",
                            error
                        );
                    },
                }
            );
        },
        SystemHandlerValidators.reportPreloadGuard
    );
}
