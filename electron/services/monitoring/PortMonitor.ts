import isPortReachable from "is-port-reachable";

import { DEFAULT_REQUEST_TIMEOUT, RETRY_BACKOFF } from "../../constants";
import { Site } from "../../types";
import { isDev } from "../../utils";
import { logger } from "../../utils/logger";
import { withRetry } from "../../utils/retry";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";

/**
 * Constants for port monitor error messages.
 */
const PORT_NOT_REACHABLE = "Port not reachable";

/**
 * Custom error class that preserves response time information from failed port checks.
 */
class PortCheckError extends Error {
    public readonly responseTime: number;

    constructor(message: string, responseTime: number) {
        super(message);
        this.name = "PortCheckError";
        this.responseTime = responseTime;
    }
}

/**
 * Service for performing port monitoring checks.
 * Handles TCP port connectivity checks with configurable timeouts.
 */
export class PortMonitor implements IMonitorService {
    private config: MonitorConfig;

    constructor(config: MonitorConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT, // Use consistent default timeout
            ...config,
        };
    }

    /**
     * Get the monitor type this service handles.
     */
    public getType(): Site["monitors"][0]["type"] {
        return "port";
    }

    /**
     * Perform a port connectivity check on the given monitor.
     * Uses per-monitor retry attempts and timeout configuration.
     */
    public async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
        if (monitor.type !== "port") {
            throw new Error(`PortMonitor cannot handle monitor type: ${monitor.type}`);
        }

        if (!monitor.host || !monitor.port) {
            return {
                details: "0",
                error: "Port monitor missing host or port",
                responseTime: 0,
                status: "down",
            };
        }

        const timeout = monitor.timeout ?? this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT;
        const retryAttempts = monitor.retryAttempts ?? 0;

        return await this.performPortCheckWithRetry(monitor.host, monitor.port, timeout, retryAttempts);
    }

    /**
     * Perform port check with retry logic.
     */
    private async performPortCheckWithRetry(
        host: string,
        port: number,
        timeout: number,
        maxRetries: number
    ): Promise<MonitorCheckResult> {
        // Convert maxRetries (additional attempts) to totalAttempts for withRetry utility
        const totalAttempts = maxRetries + 1;

        return await withRetry(() => this.performSinglePortCheck(host, port, timeout), {
            delayMs: RETRY_BACKOFF.INITIAL_DELAY,
            maxRetries: totalAttempts,
            onError: (error, attempt) => {
                if (isDev()) {
                    /* v8 ignore next */
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.debug(
                        `[PortMonitor] Port ${host}:${port} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                    );
                }
            },
            operationName: `Port check for ${host}:${port}`,
        }).catch((error) => this.handlePortCheckError(error, host, port));
    }

    /**
     * Perform a single port check attempt without retry logic.
     */
    private async performSinglePortCheck(host: string, port: number, timeout: number): Promise<MonitorCheckResult> {
        const startTime = performance.now();

        if (isDev()) {
            logger.debug(`[PortMonitor] Checking port: ${host}:${port} with timeout: ${timeout}ms`);
        }

        const isReachable = await isPortReachable(port, {
            host: host,
            timeout: timeout,
        });

        const responseTime = Math.round(performance.now() - startTime);

        if (isReachable) {
            if (isDev()) {
                logger.debug(`[PortMonitor] Port ${host}:${port} is reachable in ${responseTime}ms`);
            }
            return {
                details: String(port),
                responseTime,
                status: "up",
            };
        } else {
            // Port not reachable - throw error with response time to trigger retry
            throw new PortCheckError(PORT_NOT_REACHABLE, responseTime);
        }
    }

    /**
     * Handle errors that occur during port checks.
     */
    private handlePortCheckError(error: unknown, host: string, port: number): MonitorCheckResult {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        // Extract response time from custom error if available
        const responseTime = error instanceof PortCheckError ? error.responseTime : 0;

        if (isDev()) {
            logger.debug(`[PortMonitor] Final error for ${host}:${port}: ${errorMessage}`);
        }

        return {
            details: String(port),
            error: errorMessage === PORT_NOT_REACHABLE ? PORT_NOT_REACHABLE : errorMessage,
            responseTime,
            status: "down",
        };
    }

    /**
     * Update the configuration for this monitor.
     */
    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get the current configuration.
     */
    public getConfig(): MonitorConfig {
        return { ...this.config };
    }
}
