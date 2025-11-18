/**
 * Diagnostics metrics collector for IPC bridge verification.
 *
 * @remarks
 * Tracks runtime statistics exposed by the preload diagnostics handshake so we
 * can detect missing handler registrations during CI and in production logs.
 */

import type { PreloadGuardDiagnosticsReport } from "@shared/types/ipc";
import type { Logger } from "@shared/utils/logger/interfaces";

import log from "electron-log/main";

import * as loggerModule from "../../utils/logger";

/**
 * Snapshot of IPC diagnostics metrics maintained by the main process.
 */
export interface DiagnosticsMetricsSnapshot {
    lastMissingChannel?: string;
    lastPreloadGuard?: {
        channel: string;
        guard: string;
        reason?: string;
        timestamp: number;
    };
    lastUpdatedAt?: number;
    missingHandlerChecks: number;
    preloadGuardReports: number;
    successfulHandlerChecks: number;
}

const metrics: DiagnosticsMetricsSnapshot = {
    missingHandlerChecks: 0,
    preloadGuardReports: 0,
    successfulHandlerChecks: 0,
};

interface DiagnosticsSnapshotContext {
    readonly channel?: string;
    readonly event: "guard-failure" | "missing" | "success";
}

const fallbackDiagnosticsLogger: Logger = {
    debug: (message: string, ...details: unknown[]): void => {
        log.debug(message, ...details);
    },
    error: (message: string, error?: unknown, ...details: unknown[]): void => {
        log.error(message, error, ...details);
    },
    info: (message: string, ...details: unknown[]): void => {
        log.info(message, ...details);
    },
    warn: (message: string, ...details: unknown[]): void => {
        log.warn(message, ...details);
    },
};

function resolveDiagnosticsLogger(): Logger {
    const moduleWithDiagnostics = loggerModule as Partial<{
        diagnosticsLogger: Logger;
        logger: Logger;
    }>;

    if (moduleWithDiagnostics.diagnosticsLogger) {
        return moduleWithDiagnostics.diagnosticsLogger;
    }

    if (moduleWithDiagnostics.logger) {
        return moduleWithDiagnostics.logger;
    }

    return fallbackDiagnosticsLogger;
}

const diagnosticsLog: Logger = resolveDiagnosticsLogger();

function logDiagnosticsSnapshot({
    channel,
    event,
}: DiagnosticsSnapshotContext): void {
    diagnosticsLog.info("[IpcDiagnostics] Metrics snapshot", {
        event,
        ...(channel ? { channel } : {}),
        snapshot: { ...metrics },
    });
}

/**
 * Records a successful diagnostics verification.
 *
 * @public
 */
export function recordSuccessfulHandlerCheck(): void {
    metrics.successfulHandlerChecks += 1;
    metrics.lastUpdatedAt = Date.now();
    logDiagnosticsSnapshot({ event: "success" });
}

/**
 * Records a missing handler discovery and logs metadata for observability.
 *
 * @param channel - The channel that failed diagnostics verification.
 *
 * @public
 */
export function recordMissingHandler(channel: string): void {
    metrics.missingHandlerChecks += 1;
    metrics.lastMissingChannel = channel;
    metrics.lastUpdatedAt = Date.now();

    diagnosticsLog.warn("[IpcDiagnostics] Missing handler detected", {
        channel,
        missingHandlerChecks: metrics.missingHandlerChecks,
    });

    logDiagnosticsSnapshot({ channel, event: "missing" });
}

/**
 * Records a preload guard failure reported by the preload diagnostics bridge.
 *
 * @param report - Guard diagnostics payload emitted by preload.
 */
export function recordPreloadGuardFailure(
    report: PreloadGuardDiagnosticsReport
): void {
    metrics.preloadGuardReports += 1;
    metrics.lastUpdatedAt = report.timestamp;
    metrics.lastPreloadGuard = {
        channel: report.channel,
        guard: report.guard,
        timestamp: report.timestamp,
        ...(report.reason ? { reason: report.reason } : {}),
    };

    diagnosticsLog.warn("[IpcDiagnostics] Preload guard failure", {
        channel: report.channel,
        guard: report.guard,
        metadata: report.metadata,
        payloadPreviewLength: report.payloadPreview?.length ?? 0,
        reason: report.reason,
    });

    logDiagnosticsSnapshot({
        channel: report.channel,
        event: "guard-failure",
    });
}

/**
 * Retrieves a snapshot of the current diagnostics metrics.
 *
 * @returns Diagnostics metrics snapshot with counters and metadata.
 *
 * @public
 */
export function getDiagnosticsMetrics(): DiagnosticsMetricsSnapshot {
    return { ...metrics };
}

/**
 * Resets diagnostics metrics.
 *
 * @internal
 */
export function resetDiagnosticsMetrics(): void {
    delete metrics.lastMissingChannel;
    delete metrics.lastPreloadGuard;
    delete metrics.lastUpdatedAt;
    metrics.missingHandlerChecks = 0;
    metrics.preloadGuardReports = 0;
    metrics.successfulHandlerChecks = 0;
}
