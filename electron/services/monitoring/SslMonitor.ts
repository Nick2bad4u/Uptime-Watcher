/**
 * TLS/SSL certificate monitoring service for validating certificate health and
 * expiry windows.
 *
 * @remarks
 * Provides handshake verification and expiry checks for TLS certificates. Marks
 * monitors as degraded when certificates approach expiry thresholds and down
 * when expired or handshake fails.
 */

import type { MonitorType, Site } from "@shared/types";
import type { PeerCertificate } from "node:tls";

import { isRecord } from "@shared/utils/typeHelpers";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import * as tls from "node:tls";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorServiceConfig,
} from "./types";

import { DEFAULT_REQUEST_TIMEOUT, RETRY_BACKOFF } from "../../constants";
import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";
import { withOperationalHooks } from "../../utils/operationalHooks";
import {
    createMonitorConfig,
    createMonitorErrorResult,
    validateMonitorHostAndPort,
} from "./shared/monitorServiceHelpers";

const MS_IN_DAY = 86_400_000;
const DEFAULT_WARNING_THRESHOLD_DAYS = 30;
const MIN_WARNING_THRESHOLD_DAYS = 1;
const MAX_WARNING_THRESHOLD_DAYS = 365;

/**
 * Monitor service implementation for SSL/TLS certificate checks.
 */
export class SslMonitor implements IMonitorService {
    private config: MonitorServiceConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "ssl") {
            throw new Error(
                `SslMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const validationError = validateMonitorHostAndPort(monitor);
        if (validationError) {
            return createMonitorErrorResult(validationError, 0);
        }

        const { retryAttempts, timeout } = createMonitorConfig(monitor, {
            timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
        });
        const host = (monitor.host ?? "").trim();
        const port = monitor.port ?? 443;
        const warningThreshold = this.getWarningThreshold(
            monitor.certificateWarningDays
        );

        return this.performCertificateCheckWithRetry(
            host,
            port,
            timeout,
            warningThreshold,
            retryAttempts,
            signal
        );
    }

    private async performCertificateCheckWithRetry(
        host: string,
        port: number,
        timeout: number,
        warningThreshold: number,
        retryAttempts: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        try {
            const totalAttempts = retryAttempts + 1;
            const onRetryHandler = isDev()
                ? (attempt: number, error: Error): void => {
                      logger.debug(
                          `[SslMonitor] Retry ${attempt}/${totalAttempts} for ${host}:${port} failed: ${error.message}`
                      );
                  }
                : undefined;

            return await withOperationalHooks(
                () =>
                    this.performSingleCertificateCheck(
                        host,
                        port,
                        timeout,
                        warningThreshold,
                        signal
                    ),
                {
                    initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                    maxRetries: totalAttempts,
                    operationName: `SSL check for ${host}:${port}`,
                    ...(signal ? { signal } : {}),
                    ...(onRetryHandler ? { onRetry: onRetryHandler } : {}),
                }
            );
        } catch (error) {
            const message = getUserFacingErrorDetail(error);
            return createMonitorErrorResult(message, 0);
        }
    }

    private async performSingleCertificateCheck(
        host: string,
        port: number,
        timeout: number,
        warningThreshold: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        const start = performance.now();
        try {
            const { certificate } = await this.createTlsConnection(
                host,
                port,
                timeout,
                signal
            );
            const evaluation = this.evaluateCertificate(
                certificate,
                warningThreshold
            );
            const responseTime = Math.round(performance.now() - start);
            return {
                ...evaluation,
                responseTime,
            };
        } catch (error) {
            const responseTime = Math.round(performance.now() - start);
            return createMonitorErrorResult(
                getUserFacingErrorDetail(error),
                responseTime
            );
        }
    }

    private async createTlsConnection(
        host: string,
        port: number,
        timeout: number,
        signal?: AbortSignal
    ): Promise<{ certificate: PeerCertificate }> {
        return new Promise((resolve, reject) => {
            const socket = tls.connect({
                host,
                port,
                rejectUnauthorized: true,
                servername: host,
            });

            let completed = false;

            const cleanup = (listener?: () => void): void => {
                socket.removeAllListeners("secureConnect");
                socket.removeAllListeners("error");
                socket.removeAllListeners("timeout");
                socket.setTimeout(0);
                socket.end();
                socket.destroy();
                if (signal && listener) {
                    signal.removeEventListener("abort", listener);
                }
            };

            const completeOperation = (
                action: () => void,
                listener?: () => void
            ): void => {
                if (completed) {
                    return;
                }
                completed = true;
                cleanup(listener);
                action();
            };

            const handleFailure = (
                error: Error,
                listener?: () => void
            ): void => {
                completeOperation(() => {
                    reject(error);
                }, listener);
            };

            const handleSuccess = (
                certificate: PeerCertificate,
                listener?: () => void
            ): void => {
                completeOperation(() => {
                    resolve({ certificate });
                }, listener);
            };

            const abortListener = (): void => {
                handleFailure(new Error("Operation aborted"), abortListener);
            };

            const onSecureConnect = (): void => {
                if (!socket.authorized) {
                    const { authorizationError } = socket;
                    let details: string | undefined = undefined;
                    if (authorizationError instanceof Error) {
                        details = authorizationError.message;
                    } else if (typeof authorizationError === "string") {
                        details = authorizationError;
                    }

                    const errorMessage = details
                        ? `TLS authorization failed: ${details}`
                        : "TLS authorization failed";

                    const error =
                        authorizationError instanceof Error
                            ? new Error(errorMessage, {
                                  cause: authorizationError,
                              })
                            : new Error(errorMessage);

                    handleFailure(error, abortListener);
                    return;
                }

                const peerCertificate = socket.getPeerCertificate(true);
                // Node returns an empty object when the peer omits a certificate.
                if (Object.keys(peerCertificate).length === 0) {
                    handleFailure(
                        new Error(
                            "TLS connection succeeded but no certificate was provided"
                        ),
                        abortListener
                    );
                    return;
                }

                handleSuccess(peerCertificate, abortListener);
            };

            const onError = (error: Error): void => {
                handleFailure(error, abortListener);
            };

            const onTimeout = (): void => {
                handleFailure(
                    new Error(`TLS handshake timed out after ${timeout}ms`),
                    abortListener
                );
            };

            socket.once("secureConnect", onSecureConnect);
            socket.once("error", onError);
            socket.setTimeout(timeout, onTimeout);

            if (signal?.aborted) {
                abortListener();
                return;
            }

            if (signal) {
                signal.addEventListener("abort", abortListener, {
                    once: true,
                });
            }
        });
    }

    private evaluateCertificate(
        certificate: PeerCertificate,
        warningThreshold: number
    ): Omit<MonitorCheckResult, "responseTime"> {
        const validTo = certificate.valid_to;
        if (!validTo) {
            return {
                details: "Certificate has no expiration date",
                error: "Certificate expiration missing",
                status: "down",
            };
        }

        const expiry = new Date(validTo);
        if (Number.isNaN(expiry.getTime())) {
            return {
                details: `Unable to parse certificate expiration date: ${validTo}`,
                error: "Invalid certificate expiration date",
                status: "down",
            };
        }

        const now = new Date();
        const msRemaining = expiry.getTime() - now.getTime();
        const subject = this.extractSubject(certificate);
        const formattedExpiry = this.formatDate(expiry);

        if (msRemaining <= 0) {
            return {
                details: `Certificate for ${subject} expired on ${formattedExpiry}`,
                error: "Certificate expired",
                status: "down",
            };
        }

        const daysRemaining = Math.ceil(msRemaining / MS_IN_DAY);
        const detailPrefix = `Certificate for ${subject}`;

        if (daysRemaining <= warningThreshold) {
            return {
                details: `${detailPrefix} expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} (on ${formattedExpiry})`,
                status: "degraded",
            };
        }

        return {
            details: `${detailPrefix} valid until ${formattedExpiry} (${daysRemaining} days remaining)`,
            status: "up",
        };
    }

    private getWarningThreshold(value: unknown): number {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            return DEFAULT_WARNING_THRESHOLD_DAYS;
        }

        const normalized = Math.trunc(value);
        if (normalized < MIN_WARNING_THRESHOLD_DAYS) {
            return MIN_WARNING_THRESHOLD_DAYS;
        }
        if (normalized > MAX_WARNING_THRESHOLD_DAYS) {
            return MAX_WARNING_THRESHOLD_DAYS;
        }
        return normalized;
    }

    private extractSubject(certificate: PeerCertificate): string {
        const { subject } = certificate;

        if (!isRecord(subject)) {
            return "unknown subject";
        }

        const candidates: unknown[] = [
            subject["CN"],
            subject["O"],
            subject["OU"],
        ];
        const name = candidates.find(
            (value): value is string =>
                typeof value === "string" && value.trim().length > 0
        );

        return name ?? "unknown subject";
    }

    private formatDate(date: Date): string {
        return date.toISOString().slice(0, 10);
    }

    public constructor(config: MonitorServiceConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            ...config,
        };
    }

    public getType(): MonitorType {
        return "ssl";
    }

    public updateConfig(config: Partial<MonitorServiceConfig>): void {
        if (
            config.timeout !== undefined &&
            (typeof config.timeout !== "number" || config.timeout <= 0)
        ) {
            throw new Error("Invalid timeout: must be a positive number");
        }

        this.config = {
            ...this.config,
            ...config,
        };
    }
}
