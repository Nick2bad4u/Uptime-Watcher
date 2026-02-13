/**
 * WebSocket keepalive monitor service.
 *
 * @remarks
 * Establishes a WebSocket connection, sends a ping frame, and ensures a pong
 * response (or any message) is received within the configured window. Reports
 * degraded status when the connection remains open but does not answer with a
 * pong in time, and down status when the connection fails or closes
 * prematurely.
 */

import type { MonitorType, Site } from "@shared/types";

import { createAbortError, isAbortError } from "@shared/utils/abortError";
import { ensureError } from "@shared/utils/errorHandling";
import { performance } from "node:perf_hooks";
import { WebSocket as NodeWebSocket } from "ws";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorServiceConfig,
} from "./types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { withOperationalHooks } from "../../utils/operationalHooks";
import {
    resolveMonitorNumericOverride,
    resolveRequiredMonitorUrlField,
} from "./shared/monitorConfigValueResolvers";
import { createMonitorRetryPlan } from "./shared/monitorRetryUtils";
import {
    createMonitorConfig,
    createMonitorErrorResult,
} from "./shared/monitorServiceHelpers";

const DEFAULT_PONG_TIMEOUT_MS = 1500;

/**
 * Monitor service that validates WebSocket connectivity using a ping/pong-style
 * keepalive handshake.
 */
export class WebsocketKeepaliveMonitor implements IMonitorService {
    private config: MonitorServiceConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "websocket-keepalive") {
            throw new Error(
                `WebsocketKeepaliveMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const urlResult = resolveRequiredMonitorUrlField(
            monitor,
            "url",
            "WebSocket keepalive monitor requires a valid ws:// or wss:// URL",
            ["ws", "wss"]
        );

        if (!urlResult.ok) {
            return createMonitorErrorResult(
                urlResult.message,
                0
            );
        }
        const { value: urlCandidate } = urlResult;

        const maxPongDelayMs = this.resolveMaxPongDelay(monitor);
        const { retryAttempts, timeout } = createMonitorConfig(monitor, {
            timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
        });
        const { totalAttempts } = createMonitorRetryPlan(retryAttempts);

        try {
            return await withOperationalHooks(
                () =>
                    this.performKeepaliveCheck(
                        urlCandidate,
                        timeout,
                        maxPongDelayMs,
                        signal
                    ),
                {
                    failureLogLevel: "warn",
                    maxRetries: totalAttempts,
                    operationName: `WebSocket keepalive for ${urlCandidate}`,
                    ...(signal ? { signal } : {}),
                }
            );
        } catch (error) {
            if (isAbortError(error)) {
                return {
                    ...createMonitorErrorResult("Request canceled", 0),
                    details: "Request canceled",
                };
            }

            const normalized = ensureError(error);
            return {
                ...createMonitorErrorResult(normalized.message, 0),
                details: normalized.message,
            };
        }
    }

    private async performKeepaliveCheck(
        url: string,
        timeout: number,
        maxPongDelay: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        const started = performance.now();

        return new Promise<MonitorCheckResult>((resolve, reject) => {
            if (signal?.aborted) {
                reject(
                    createAbortError({
                        cause: Reflect.get(signal, "reason"),
                    })
                );
                return;
            }

            const socket = new NodeWebSocket(url, {
                handshakeTimeout: timeout,
            });

            let handshakeTimer: NodeJS.Timeout | null = null;
            let pongTimer: NodeJS.Timeout | null = null;
            let settled = false;

            const cleanupCallbacks: Array<() => void> = [];

            const clearHandshakeTimer = (): void => {
                if (handshakeTimer !== null) {
                    clearTimeout(handshakeTimer);
                    handshakeTimer = null;
                }
            };

            const clearPongTimer = (): void => {
                if (pongTimer !== null) {
                    clearTimeout(pongTimer);
                    pongTimer = null;
                }
            };

            const cleanup = (): void => {
                clearHandshakeTimer();
                clearPongTimer();
                while (cleanupCallbacks.length > 0) {
                    const cleanupStep = cleanupCallbacks.pop();
                    try {
                        cleanupStep?.();
                    } catch {
                        // Swallow cleanup errors to avoid masking primary results
                    }
                }
            };

            const resolveOnce = (result: MonitorCheckResult): void => {
                if (!settled) {
                    settled = true;
                    cleanup();
                    resolve(result);
                }
            };

            const rejectOnce = (error: Error): void => {
                if (!settled) {
                    settled = true;
                    cleanup();
                    reject(error);
                }
            };

            const resolveSuccess = (details: string): void => {
                clearPongTimer();
                resolveOnce({
                    details,
                    responseTime: Math.round(performance.now() - started),
                    status: "up",
                });
            };

            const resolveDegraded = (
                details: string,
                errorMessage: string
            ): void => {
                clearPongTimer();
                resolveOnce({
                    details,
                    error: errorMessage,
                    responseTime: Math.round(performance.now() - started),
                    status: "degraded",
                });
            };

            const scheduleMissingPong = (): void => {
                clearPongTimer();
                pongTimer = setTimeout(() => {
                    resolveDegraded(
                        "No pong received within allowed interval",
                        `No pong within ${maxPongDelay}ms`
                    );
                }, maxPongDelay);
            };

            const sendPingSafely = (): void => {
                try {
                    socket.ping();
                } catch (error) {
                    rejectOnce(ensureError(error));
                    return;
                }

                scheduleMissingPong();
            };

            const handleOpen = (): void => {
                clearHandshakeTimer();
                sendPingSafely();
            };

            const handlePong = (): void => {
                resolveSuccess("WebSocket responded to ping");
            };

            const handleMessage = (): void => {
                resolveSuccess("WebSocket responded with message");
            };

            const handleClose = (code: number, reason: Buffer): void => {
                const reasonText =
                    reason.length > 0 ? reason.toString("utf8") : "";
                const reasonSuffix =
                    reasonText.length > 0 ? `, reason: ${reasonText}` : "";
                const details = `Connection closed (code ${code}${reasonSuffix})`;
                resolveOnce({
                    details,
                    error: details,
                    responseTime: Math.round(performance.now() - started),
                    status: "down",
                });
            };

            const handleError = (socketError: Error): void => {
                rejectOnce(ensureError(socketError));
            };

            handshakeTimer = setTimeout(() => {
                rejectOnce(
                    new Error(
                        `WebSocket handshake timed out after ${timeout}ms`
                    )
                );
            }, timeout);

            if (signal) {
                const abortHandler = (): void => {
                    try {
                        socket.terminate();
                    } catch {
                        // Ignore termination errors
                    }
                    rejectOnce(
                        createAbortError({
                            cause: Reflect.get(signal as object, "reason"),
                        })
                    );
                };
                signal.addEventListener("abort", abortHandler, {
                    once: true,
                });
                cleanupCallbacks.push(() => {
                    signal.removeEventListener("abort", abortHandler);
                });
            }

            cleanupCallbacks.push(() => {
                socket.removeAllListeners();

                switch (socket.readyState) {
                    case NodeWebSocket.CLOSED: {
                        // No-op.
                        break;
                    }

                    case NodeWebSocket.CLOSING:
                    case NodeWebSocket.CONNECTING: {
                        socket.terminate();
                        break;
                    }

                    case NodeWebSocket.OPEN: {
                        socket.close();
                        break;
                    }

                    default: {
                        // Exhaustiveness guard (should be unreachable).
                        throw new Error(
                            `Unexpected WebSocket readyState: ${String(socket.readyState)}`
                        );
                    }
                }
            });

            socket.once("open", handleOpen);
            socket.once("pong", handlePong);
            socket.once("message", handleMessage);
            socket.once("close", handleClose);
            socket.once("error", handleError);
        });
    }

    private resolveMaxPongDelay(monitor: Site["monitors"][0]): number {
        return resolveMonitorNumericOverride({
            allowEqualMinimum: false,
            fallbackValue: DEFAULT_PONG_TIMEOUT_MS,
            minimumValue: 0,
            monitor,
            monitorFieldName: "maxPongDelayMs",
            serviceConfig: this.config,
        });
    }

    public constructor(config: MonitorServiceConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            ...config,
        };
    }

    public getType(): MonitorType {
        return "websocket-keepalive";
    }

    public updateConfig(config: Partial<MonitorServiceConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
    }
}
