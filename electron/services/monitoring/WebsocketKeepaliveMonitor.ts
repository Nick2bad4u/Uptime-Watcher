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

import { ensureError } from "@shared/utils/errorHandling";
import { isValidUrl } from "@shared/validation/validatorUtils";
import { performance } from "node:perf_hooks";
import { WebSocket as NodeWebSocket } from "ws";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorConfig,
} from "./types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { withOperationalHooks } from "../../utils/operationalHooks";
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
    private config: MonitorConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "websocket-keepalive") {
            throw new Error(
                `WebsocketKeepaliveMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const urlCandidate = Reflect.get(monitor, "url");
        if (
            typeof urlCandidate !== "string" ||
            !isValidUrl(urlCandidate, { protocols: ["ws", "wss"] })
        ) {
            return createMonitorErrorResult(
                "WebSocket keepalive monitor requires a valid ws:// or wss:// URL",
                0
            );
        }

        if (!/^wss?:\/\//iv.test(urlCandidate)) {
            return createMonitorErrorResult(
                "WebSocket URL must start with ws:// or wss://",
                0
            );
        }

        const maxPongDelayMs = this.resolveMaxPongDelay(monitor);
        const { retryAttempts, timeout } = createMonitorConfig(monitor, {
            timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
        });

        try {
            return await withOperationalHooks(
                () =>
                    this.performKeepaliveCheck(
                        urlCandidate.trim(),
                        timeout,
                        maxPongDelayMs,
                        signal
                    ),
                {
                    failureLogLevel: "warn",
                    maxRetries: retryAttempts + 1,
                    operationName: `WebSocket keepalive for ${urlCandidate}`,
                }
            );
        } catch (error) {
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
                    rejectOnce(new Error("Operation was aborted"));
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
                if (socket.readyState === NodeWebSocket.OPEN) {
                    socket.close();
                } else if (socket.readyState === NodeWebSocket.CONNECTING) {
                    socket.terminate();
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
        const monitorValue = Reflect.get(monitor, "maxPongDelayMs") as unknown;
        if (
            typeof monitorValue === "number" &&
            Number.isFinite(monitorValue) &&
            monitorValue > 0
        ) {
            return monitorValue;
        }

        if (Object.hasOwn(this.config, "maxPongDelayMs")) {
            const candidate = Reflect.get(
                this.config,
                "maxPongDelayMs"
            ) as unknown;
            if (
                typeof candidate === "number" &&
                Number.isFinite(candidate) &&
                candidate > 0
            ) {
                return candidate;
            }
        }

        return DEFAULT_PONG_TIMEOUT_MS;
    }

    public constructor(config: MonitorConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            ...config,
        };
    }

    public getType(): MonitorType {
        return "websocket-keepalive";
    }

    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
    }
}
