/**
 * Diagnostics metrics collector for IPC bridge verification.
 *
 * @remarks
 * Tracks runtime statistics exposed by the preload diagnostics handshake so we
 * can detect missing handler registrations during CI and in production logs.
 */

import type { Logger } from "@shared/utils/logger/interfaces";

import * as loggerModule from "../../utils/logger";

export interface DiagnosticsMetricsSnapshot {
    lastMissingChannel?: string;
    lastUpdatedAt?: number;
    missingHandlerChecks: number;
    successfulHandlerChecks: number;
}

const metrics: DiagnosticsMetricsSnapshot = {
    missingHandlerChecks: 0,
    successfulHandlerChecks: 0,
};

interface DiagnosticsSnapshotContext {
    readonly channel?: string;
    readonly event: "missing" | "success";
}

function resolveDiagnosticsLogger(): Logger {
    try {
        const moduleWithDiagnostics = loggerModule as {
            diagnosticsLogger?: Logger;
        };
        if (moduleWithDiagnostics.diagnosticsLogger) {
            return moduleWithDiagnostics.diagnosticsLogger;
        }
    } catch (error) {
        // Silently ignore lookup issues caused by partial test mocks.
    }

    try {
        return loggerModule.logger;
    } catch (error) {
        // Fallback to a minimal console-backed logger if the module mock is incomplete.
        const noop = (): void => {};
        return {
            debug: noop,
            error: (...args: unknown[]) => console.error(...args),
            info: (...args: unknown[]) => console.info(...args),
            warn: (...args: unknown[]) => console.warn(...args),
        };
    }
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
    delete metrics.lastUpdatedAt;
    metrics.missingHandlerChecks = 0;
    metrics.successfulHandlerChecks = 0;
}
