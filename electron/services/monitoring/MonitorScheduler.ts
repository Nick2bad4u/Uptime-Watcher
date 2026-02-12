import type { Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { createCombinedAbortSignal } from "@shared/utils/abortUtils";
import { generateCorrelationId } from "@shared/utils/correlation";
import { ensureError } from "@shared/utils/errorHandling";
import { randomInt } from "node:crypto";

import type { UptimeEventName, UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";

import { DEFAULT_CHECK_INTERVAL } from "../../constants";
import { isDev } from "../../electronUtils";
import { logger as backendLogger } from "../../utils/logger";
import { MIN_CHECK_INTERVAL } from "./constants";
import {
    resolveMonitorBaseTimeoutMs,
    resolveMonitorOperationTimeoutMs,
} from "./shared/timeoutUtils";

const JITTER_PERCENTAGE = 0.1;

// Backoff must be able to exceed typical monitoring intervals; otherwise
// repeated failures won't slow down and can amplify provider throttling or
// local resource contention.
//
// NOTE: This is a global cap. The effective cap is `max(baseIntervalMs, cap)`
// so user-configured intervals are never reduced by the backoff logic.
const MAX_BACKOFF_DELAY_MS = 60 * 60_000; // 60 minutes

type MonitorSchedulerEventBus = Pick<TypedEventBus<UptimeEvents>, "emitTyped">;

const noopEventEmitter: MonitorSchedulerEventBus = {
    async emitTyped() {
        /* noop */
    },
};

interface MonitorJob {
    abortController: AbortController | undefined;
    backoffAttempt: number;
    baseIntervalMs: number;
    correlationId: string;
    isRunning: boolean;
    monitorId: string;
    needsReschedule: boolean;
    pendingManualCheckCorrelationId: string | undefined;
    siteIdentifier: string;
    timeoutMs: number;
    timer: NodeJS.Timeout | undefined;
}

interface MonitorJobSnapshot {
    backoffAttempt: number;
    baseIntervalMs: number;
    correlationId: string;
    hasAbortController: boolean;
    hasTimer: boolean;
    isRunning: boolean;
    monitorId: string;
    needsReschedule: boolean;
    pendingManualCheckCorrelationId: string | undefined;
    siteIdentifier: string;
    timeoutMs: number;
}

/**
 * Job-based scheduler that emits telemetry and enforces per-monitor timeouts.
 *
 * @remarks
 * Turns each monitor into an independent job that executes immediately, then
 * reschedules itself using jittered intervals with exponential backoff. Jobs
 * are guarded by a timeout buffer and surface their lifecycle through typed
 * events for downstream observability.
 *
 * @example
 *
 * ```typescript
 * const scheduler = new MonitorScheduler();
 * scheduler.setCheckCallback(async (siteIdentifier, monitorId, signal) => {
 *     // Optional: respect signal.aborted for timeouts.
 * });
 * scheduler.startSite(siteObj);
 * ```
 *
 * @public
 */
export class MonitorScheduler {
    /**
     * Logger instance used for emitting scheduler diagnostics.
     *
     * @remarks
     * Injected via the constructor to simplify testing scenarios that need to
     * assert on logging behaviour without relying on the shared singleton.
     */
    private readonly logger: Logger;

    /** Active monitor jobs keyed by `${siteIdentifier}|${monitorId}`. */
    private readonly jobs = new Map<string, MonitorJob>();

    /** Event emitter used for surfacing scheduling/backoff/timeout lifecycle. */
    private readonly eventEmitter: MonitorSchedulerEventBus;

    /**
     * Callback invoked to perform a monitor check for a given site and monitor.
     *
     * @remarks
     * Must be set via {@link setCheckCallback} before starting monitoring. The
     * callback should be async and handle timeouts and errors internally.
     * Errors are logged but do not interrupt scheduling.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @param signal - Abort signal that is aborted when the scheduler times out
     *   (and also when monitoring is stopped for the job).
     *
     * @returns Promise resolving when the check completes.
     *
     * @internal
     */
    private onCheckCallback?: (
        siteIdentifier: string,
        monitorId: string,
        signal: AbortSignal
    ) => Promise<void>;

    private async runJob(intervalKey: string): Promise<void> {
        const job = this.jobs.get(intervalKey);
        const checkOperation = this.onCheckCallback;

        if (!job) {
            return;
        }

        if (!checkOperation) {
            this.logger.warn(
                `[MonitorScheduler] No check callback configured; skipping ${intervalKey}`
            );
            this.scheduleNextRun(intervalKey);
            return;
        }

        if (job.isRunning) {
            this.logger.warn(
                `[MonitorScheduler] Job already running; skipping overlapping trigger for ${intervalKey}`
            );
            // Avoid timer churn: reschedule only once the in-flight check
            // settles.
            job.needsReschedule = true;
            return;
        }

        job.isRunning = true;
        const abortController = new AbortController();
        job.abortController = abortController;
        const timeoutState = { timedOut: false };
        const timeoutRef: { handle: NodeJS.Timeout | null } = { handle: null };

        const checkPromise = (async (): Promise<
            | { error: Error; kind: "error" }
            | { kind: "cancelled" }
            | { kind: "success" }
        > => {
            try {
                await checkOperation(
                    job.siteIdentifier,
                    job.monitorId,
                    abortController.signal
                );
                return { kind: "success" };
            } catch (error: unknown) {
                // If a timeout has already fired, treat any subsequent errors
                // as noise (often abort-related) and avoid double-counting.
                if (timeoutState.timedOut) {
                    return { kind: "success" };
                }

                if (abortController.signal.aborted) {
                    return { kind: "cancelled" };
                }

                return { error: ensureError(error), kind: "error" };
            } finally {
                // Important: if we timed out, keep the job marked as running
                // until the underlying async work settles so we don't run
                // overlapping checks.
                const currentJob = this.jobs.get(intervalKey);
                if (currentJob === job) {
                    currentJob.abortController = undefined;

                    if (timeoutState.timedOut) {
                        currentJob.isRunning = false;
                        const startedQueuedManual =
                            this.startQueuedManualCheckIfAny(
                                intervalKey,
                                currentJob
                            );

                        if (
                            !startedQueuedManual &&
                            currentJob.needsReschedule
                        ) {
                            currentJob.needsReschedule = false;
                            this.scheduleNextRun(intervalKey);
                        }
                    }
                }
            }
        })();

        const timeoutPromise = new Promise<{ kind: "timeout" }>((resolve) => {
            timeoutRef.handle = setTimeout(() => {
                timeoutState.timedOut = true;
                abortController.abort("Monitor job timed out");
                resolve({ kind: "timeout" });
            }, job.timeoutMs);
        });

        try {
            const result = await Promise.race([checkPromise, timeoutPromise]);

            const currentJob = this.jobs.get(intervalKey);
            if (currentJob !== job) {
                return;
            }

            switch (result.kind) {
                case "cancelled": {
                    currentJob.backoffAttempt = 0;
                    break;
                }
                case "error": {
                    this.logger.error(
                        `[MonitorScheduler] Error during monitor job for ${intervalKey}`,
                        result.error
                    );
                    currentJob.backoffAttempt += 1;
                    break;
                }
                case "success": {
                    currentJob.backoffAttempt = 0;
                    break;
                }
                case "timeout": {
                    this.emitMonitorTimeoutEvent(
                        currentJob,
                        currentJob.timeoutMs
                    );
                    currentJob.backoffAttempt += 1;
                    currentJob.needsReschedule = true;
                    break;
                }
                default: {
                    currentJob.backoffAttempt += 1;
                    break;
                }
            }
        } finally {
            if (timeoutRef.handle) {
                clearTimeout(timeoutRef.handle);
                timeoutRef.handle = null;
            }

            if (!timeoutState.timedOut) {
                const currentJob = this.jobs.get(intervalKey);
                if (currentJob === job) {
                    currentJob.isRunning = false;
                    currentJob.abortController = undefined;
                }
            }

            const currentJob = this.jobs.get(intervalKey);
            // If we timed out, rescheduling is deferred until the underlying
            // check settles (see checkPromise.finally) to avoid timer churn.
            if (currentJob === job && !timeoutState.timedOut) {
                const startedQueuedManual = this.startQueuedManualCheckIfAny(
                    intervalKey,
                    currentJob
                );

                if (!startedQueuedManual) {
                    this.scheduleNextRun(intervalKey);
                }
            }
        }
    }

    /**
     * Performs an immediate check for a specific monitor by pre-empting the
     * scheduled job when available.
     */
    public async performImmediateCheck(
        siteIdentifier: string,
        monitorId: string
    ): Promise<void> {
        const intervalKey = this.createIntervalKey(siteIdentifier, monitorId);
        const job = this.jobs.get(intervalKey);

        if (job) {
            // If a check is already in flight, queue exactly one manual check
            // to run immediately after the current check settles.
            if (job.isRunning) {
                if (job.pendingManualCheckCorrelationId) {
                    return;
                }

                this.clearJobTimer(job);
                const correlationId = generateCorrelationId();
                job.pendingManualCheckCorrelationId = correlationId;
                this.emitManualCheckStartedEvent({
                    correlationId,
                    monitorId: job.monitorId,
                    siteIdentifier: job.siteIdentifier,
                });
                return;
            }

            this.clearJobTimer(job);
            job.backoffAttempt = 0;
            job.correlationId = generateCorrelationId();
            this.emitManualCheckStartedEvent(job);
            await this.runJob(intervalKey);
            return;
        }

        if (!this.onCheckCallback) {
            return;
        }

        const correlationId = generateCorrelationId();
        this.emitManualCheckStartedEvent({
            correlationId,
            monitorId,
            siteIdentifier,
        });
        const timeoutMs = resolveMonitorBaseTimeoutMs();

        const signal = createCombinedAbortSignal({
            reason: "Manual check timed out",
            timeoutMs,
        });

        try {
            await this.onCheckCallback(
                siteIdentifier,
                monitorId,
                signal
            );
        } catch (error) {
            const normalizedError = ensureError(error);
            const logMethod = signal.aborted
                ? this.logger.warn
                : this.logger.error;

            logMethod.call(
                this.logger,
                `[MonitorScheduler] Error during immediate check for ${intervalKey}`,
                normalizedError
            );
        }
    }

    private async emitEvent<K extends UptimeEventName>(
        eventName: K,
        payload: UptimeEvents[K]
    ): Promise<void> {
        try {
            await this.eventEmitter.emitTyped(eventName, payload);
        } catch (error: unknown) {
            this.logger.error(
                `[MonitorScheduler] Failed to emit ${eventName}`,
                error
            );
        }
    }

    /**
     * Attempts to start a queued manual check for the specified job.
     *
     * @remarks
     * Manual checks are allowed to be requested while a job is already
     * executing. In that case, we queue exactly one pending manual check and
     * run it immediately after the current check settles.
     *
     * This prevents clobbering the in-flight correlation ID (used by timeout
     * and schedule telemetry) while still honoring the manual check request.
     */
    private startQueuedManualCheckIfAny(
        intervalKey: string,
        job: MonitorJob
    ): boolean {
        if (job.isRunning) {
            return false;
        }

        const correlationId = job.pendingManualCheckCorrelationId;
        if (!correlationId) {
            return false;
        }

        job.pendingManualCheckCorrelationId = undefined;
        job.needsReschedule = false;
        job.backoffAttempt = 0;
        this.clearJobTimer(job);

        // Important: set correlation ID only for the manual run that is about
        // to begin.
        job.correlationId = correlationId;

        void this.runJob(intervalKey);
        return true;
    }

    /**
     * Creates a new {@link MonitorScheduler}.
     *
     * @param loggerInstance - Optional logger implementation to use for
     *   diagnostic output. Defaults to the shared backend logger.
     */
    public constructor(
        loggerInstance: Logger = backendLogger,
        eventEmitter: MonitorSchedulerEventBus = noopEventEmitter
    ) {
        this.logger = loggerInstance;
        this.eventEmitter = eventEmitter;
    }

    /**
     * Returns the number of currently active monitoring intervals.
     *
     * @returns The number of scheduled monitor intervals.
     *
     * @public
     */
    public getActiveCount(): number {
        return this.jobs.size;
    }

    /**
     * Returns all active monitor interval keys.
     *
     * @returns An array of interval keys in the format
     *   `${siteIdentifier}|${monitorId}`.
     *
     * @public
     */
    public getActiveMonitors(): string[] {
        return Array.from(this.jobs.keys());
    }

    /**
     * Returns a snapshot of the internal job map for diagnostics and tests.
     *
     * @remarks
     * The returned map is a shallow copy and mutating it will not affect the
     * scheduler's internal state. Only exposed in non-production scenarios.
     *
     * @internal
     */
    public getJobsForTesting(): ReadonlyMap<string, MonitorJobSnapshot> {
        return new Map(
            Array.from(this.jobs.entries(), ([key, job]) => [
                key,
                {
                    backoffAttempt: job.backoffAttempt,
                    baseIntervalMs: job.baseIntervalMs,
                    correlationId: job.correlationId,
                    hasAbortController: Boolean(job.abortController),
                    hasTimer: Boolean(job.timer),
                    isRunning: job.isRunning,
                    monitorId: job.monitorId,
                    needsReschedule: job.needsReschedule,
                    pendingManualCheckCorrelationId:
                        job.pendingManualCheckCorrelationId,
                    siteIdentifier: job.siteIdentifier,
                    timeoutMs: job.timeoutMs,
                },
            ])
        );
    }

    /**
     * Determines if a monitor is currently being scheduled and actively
     * monitored.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     *
     * @returns `true` if the monitor is actively scheduled; otherwise, `false`.
     *
     * @public
     */
    public isMonitoring(siteIdentifier: string, monitorId: string): boolean {
        const intervalKey = this.createIntervalKey(siteIdentifier, monitorId);
        return this.jobs.has(intervalKey);
    }

    /**
     * Restarts monitoring for a specific monitor.
     *
     * @remarks
     * Stops any existing interval for the monitor, then starts a new one.
     * Useful when monitor settings (such as interval) change. If the monitor
     * has no ID, no action is taken.
     *
     * @example
     *
     * ```typescript
     * scheduler.restartMonitor("siteA", monitorObj);
     * ```
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitor - Monitor configuration object.
     *
     * @returns `true` if monitoring was restarted; `false` if the monitor has
     *   no ID.
     *
     * @public
     */
    public restartMonitor(
        siteIdentifier: string,
        monitor: Site["monitors"][0]
    ): boolean {
        if (!monitor.id) {
            return false;
        }

        this.stopMonitor(siteIdentifier, monitor.id);
        return this.startMonitor(siteIdentifier, monitor);
    }

    /**
     * Registers the callback to execute when a monitor check is scheduled.
     *
     * @remarks
     * Must be called before starting any monitoring. The callback should be
     * async and handle errors internally. This callback is invoked for every
     * scheduled or immediate monitor check.
     *
     * @example
     *
     * ```typescript
     * scheduler.setCheckCallback(
     *     async (siteIdentifier, monitorId, signal) => {
     *         // Custom check implementation
     *     }
     * );
     * ```
     *
     * @param callback - Function to execute for each scheduled monitor check.
     *   Receives the site identifier and monitor ID.
     *
     * @public
     */
    public setCheckCallback(
        callback: (
            siteIdentifier: string,
            monitorId: string,
            signal: AbortSignal
        ) => Promise<void>
    ): void {
        this.onCheckCallback = callback;
    }

    /**
     * Starts monitoring for a specific monitor with its own interval.
     *
     * @remarks
     * Stops any existing interval for the monitor before starting. Validates
     * and applies the monitor's checkInterval. Triggers an immediate check
     * after starting. Throws if the checkInterval is invalid. If the monitor
     * has no ID, no action is taken.
     *
     * @example
     *
     * ```typescript
     * scheduler.startMonitor("siteA", monitorObj);
     * ```
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitor - Monitor configuration object.
     *
     * @returns `true` if monitoring started; `false` if the monitor has no ID.
     *
     * @throws Error if checkInterval is invalid.
     *
     * @public
     */
    public startMonitor(
        siteIdentifier: string,
        monitor: Site["monitors"][0]
    ): boolean {
        if (!monitor.id) {
            this.logger.warn(
                `[MonitorScheduler] Cannot start monitoring for monitor without ID: ${siteIdentifier}`
            );
            return false;
        }

        const intervalKey = this.createIntervalKey(siteIdentifier, monitor.id);

        this.stopMonitor(siteIdentifier, monitor.id);

        const baseIntervalMs = this.resolveBaseIntervalMs(
            monitor.checkInterval
        );
        const timeoutMs = this.resolveTimeout(monitor.timeout);

        const job: MonitorJob = {
            abortController: undefined,
            backoffAttempt: 0,
            baseIntervalMs,
            correlationId: generateCorrelationId(),
            isRunning: false,
            monitorId: monitor.id,
            needsReschedule: false,
            pendingManualCheckCorrelationId: undefined,
            siteIdentifier,
            timeoutMs,
            timer: undefined,
        };

        this.jobs.set(intervalKey, job);

        if (isDev()) {
            this.logger.debug(
                `[MonitorScheduler] Started job for ${intervalKey} with base interval ${baseIntervalMs}ms`
            );
        }

        void this.runJob(intervalKey);
        return true;
    }

    /**
     * Starts monitoring for all monitors in a site.
     *
     * @remarks
     * Only monitors with `monitoring: true` and a valid ID are started. This
     * method is idempotent and safe to call multiple times.
     *
     * @example
     *
     * ```typescript
     * scheduler.startSite(siteObj);
     * ```
     *
     * @param site - Site configuration object containing monitors.
     *
     * @public
     */
    public startSite(site: Site): void {
        for (const monitor of site.monitors) {
            if (monitor.monitoring && monitor.id) {
                this.startMonitor(site.identifier, monitor);
            }
        }
    }

    /**
     * Stops all monitoring intervals and clears all tracked monitors.
     *
     * @remarks
     * Clears all interval timers and removes all monitors from tracking. Logs
     * an info message when complete. Safe to call even if no monitors are
     * active.
     *
     * @example
     *
     * ```typescript
     * scheduler.stopAll();
     * ```
     *
     * @public
     */
    public stopAll(): void {
        for (const job of this.jobs.values()) {
            job.abortController?.abort("Monitoring stopped");
            job.abortController = undefined;
            job.needsReschedule = false;
            this.clearJobTimer(job);
        }
        this.jobs.clear();
        this.logger.info("[MonitorScheduler] Stopped all monitoring jobs");
    }

    /**
     * Stops monitoring for a specific monitor.
     *
     * @remarks
     * Clears the interval timer and removes the monitor from tracking. Safe to
     * call even if the monitor is not currently monitored. Logs debug
     * information about the stop operation.
     *
     * @example
     *
     * ```typescript
     * scheduler.stopMonitor("siteA", "monitor123");
     * ```
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     *
     * @returns `true` if monitoring was stopped; `false` if not currently
     *   monitored.
     *
     * @public
     */
    public stopMonitor(siteIdentifier: string, monitorId: string): boolean {
        const intervalKey = this.createIntervalKey(siteIdentifier, monitorId);
        const job = this.jobs.get(intervalKey);

        if (!job) {
            return false;
        }

        job.abortController?.abort("Monitoring stopped");
        job.abortController = undefined;
        job.needsReschedule = false;

        this.clearJobTimer(job);
        this.jobs.delete(intervalKey);

        if (isDev()) {
            this.logger.debug(
                `[MonitorScheduler] Stopped monitoring for ${intervalKey}`
            );
        }

        return true;
    }

    /**
     * Stops monitoring for all monitors in a site.
     *
     * @remarks
     * If `monitors` is provided, only those monitors are stopped. Otherwise,
     * all monitors for the site are stopped. Safe to call even if no monitors
     * are active for the site.
     *
     * @example
     *
     * ```typescript
     * scheduler.stopSite("siteA");
     * scheduler.stopSite("siteA", [monitorObj1, monitorObj2]);
     * ```
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitors - Optional array of monitor configurations to stop. If
     *   omitted, all monitors for the site are stopped.
     *
     * @public
     */
    public stopSite(siteIdentifier: string, monitors?: Site["monitors"]): void {
        if (monitors) {
            // Stop specific monitors
            for (const monitor of monitors) {
                if (monitor.id) {
                    this.stopMonitor(siteIdentifier, monitor.id);
                }
            }
        } else {
            // Stop all monitors for this site
            const siteIntervals = Array.from(this.jobs.keys()).filter((key) =>
                key.startsWith(`${siteIdentifier}|`)
            );
            for (const intervalKey of siteIntervals) {
                const parsed = this.parseIntervalKey(intervalKey);
                if (parsed) {
                    this.stopMonitor(parsed.siteIdentifier, parsed.monitorId);
                }
            }
        }
    }

    /**
     * Creates a standardized interval key for monitor tracking.
     *
     * @remarks
     * Format: `${siteIdentifier}|${monitorId}`. Used internally for consistent
     * lookup and management of monitor intervals.
     *
     * @example
     *
     * ```typescript
     * const key = scheduler.createIntervalKey("siteA", "monitor123");
     * ```
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     *
     * @returns The formatted interval key string.
     *
     * @internal
     */
    private createIntervalKey(
        siteIdentifier: string,
        monitorId: string
    ): string {
        return `${siteIdentifier}|${monitorId}`;
    }

    /**
     * Parses an interval key into its site and monitor components.
     *
     * @remarks
     * Returns `null` if the key is invalid or does not match the expected
     * format.
     *
     * @example
     *
     * ```typescript
     * const parsed = scheduler.parseIntervalKey("siteA|monitor123");
     * // parsed = { siteIdentifier: "siteA", monitorId: "monitor123" }
     * ```
     *
     * @param intervalKey - Interval key string in the format
     *   `${siteIdentifier}|${monitorId}`.
     *
     * @returns An object with `siteIdentifier` and `monitorId`, or `null` if
     *   invalid.
     *
     * @internal
     */
    private parseIntervalKey(
        intervalKey: string
    ): null | { monitorId: string; siteIdentifier: string } {
        const parts = intervalKey.split("|");
        if (parts.length !== 2) return null;

        const [siteIdentifier, monitorId] = parts;
        if (!siteIdentifier || !monitorId) return null;

        return { monitorId, siteIdentifier };
    }

    /**
     * Validates a monitor's check interval value.
     *
     * @remarks
     * Ensures the interval is a positive integer. Warns if the interval is less
     * than 1000ms. Throws if the interval is invalid.
     *
     * @example
     *
     * ```typescript
     * const interval = scheduler.validateCheckInterval(5000);
     * ```
     *
     * @param checkInterval - Interval value in milliseconds.
     *
     * @returns The validated interval value.
     *
     * @throws Error if the interval is not a positive integer.
     *
     * @internal
     */
    private validateCheckInterval(checkInterval: number): number {
        if (!Number.isInteger(checkInterval) || checkInterval <= 0) {
            throw new Error(
                `Invalid check interval: ${checkInterval}. Must be a positive integer.`
            );
        }

        if (checkInterval < MIN_CHECK_INTERVAL) {
            this.logger.warn(
                `[MonitorScheduler] Check interval ${checkInterval}ms is below minimum ${MIN_CHECK_INTERVAL}ms; clamping to minimum`
            );
            return MIN_CHECK_INTERVAL;
        }

        return checkInterval;
    }

    private resolveBaseIntervalMs(checkInterval?: number): number {
        if (typeof checkInterval !== "number" || checkInterval === 0) {
            return this.validateCheckInterval(DEFAULT_CHECK_INTERVAL);
        }

        return this.validateCheckInterval(checkInterval);
    }

    private resolveTimeout(timeoutMs?: number): number {
        return resolveMonitorOperationTimeoutMs(timeoutMs);
    }

    private clearJobTimer(job: MonitorJob): void {
        if (job.timer) {
            clearTimeout(job.timer);
            job.timer = undefined;
        }
    }

    private scheduleNextRun(intervalKey: string): void {
        const job = this.jobs.get(intervalKey);
        if (!job) {
            return;
        }

        this.clearJobTimer(job);

        // We are about to schedule a new run; clear any pending reschedule
        // requests that may have been set by overlapping triggers.
        job.needsReschedule = false;

        const delayMs = this.computeNextDelay(job);
        job.correlationId = generateCorrelationId();

        job.timer = setTimeout(() => {
            job.timer = undefined;
            void this.runJob(intervalKey);
        }, delayMs);

        // Avoid keeping the Node/Electron process alive solely because of a
        // scheduled monitor check. This matters for graceful shutdown and for
        // tests.
        job.timer.unref();

        if (job.backoffAttempt > 0) {
            this.emitBackoffAppliedEvent(job, delayMs);
        }

        this.emitScheduleUpdatedEvent(job, delayMs);
    }

    private computeNextDelay(job: MonitorJob): number {
        const backoffMultiplier = 2 ** job.backoffAttempt;

        // Never reduce the user-configured base interval by applying a global
        // cap that is smaller than it.
        const maxDelayMs = Math.max(job.baseIntervalMs, MAX_BACKOFF_DELAY_MS);
        const targetInterval = Math.min(
            job.baseIntervalMs * backoffMultiplier,
            maxDelayMs
        );
        const jitteredInterval = this.applyJitter(targetInterval);
        return Math.max(MIN_CHECK_INTERVAL, jitteredInterval);
    }

    private applyJitter(value: number): number {
        if (value <= 0) {
            return MIN_CHECK_INTERVAL;
        }

        const jitterRange = Math.max(1, Math.round(value * JITTER_PERCENTAGE));
        const jitterOffset = randomInt(0, jitterRange * 2 + 1) - jitterRange;
        return Math.max(MIN_CHECK_INTERVAL, value + jitterOffset);
    }

    /** Emits a schedule updated event with correlation metadata. */
    private emitScheduleUpdatedEvent(job: MonitorJob, delayMs: number): void {
        void this.emitEvent("monitor:schedule-updated", {
            backoffAttempt: job.backoffAttempt,
            correlationId: job.correlationId,
            delayMs,
            monitorId: job.monitorId,
            siteIdentifier: job.siteIdentifier,
            timestamp: Date.now(),
        });
    }

    private emitBackoffAppliedEvent(job: MonitorJob, delayMs: number): void {
        void this.emitEvent("monitor:backoff-applied", {
            backoffAttempt: job.backoffAttempt,
            correlationId: job.correlationId,
            delayMs,
            monitorId: job.monitorId,
            siteIdentifier: job.siteIdentifier,
            timestamp: Date.now(),
        });
    }

    private emitManualCheckStartedEvent(job: {
        correlationId: string;
        monitorId: string;
        siteIdentifier: string;
    }): void {
        void this.emitEvent("monitor:manual-check-started", {
            correlationId: job.correlationId,
            monitorId: job.monitorId,
            siteIdentifier: job.siteIdentifier,
            timestamp: Date.now(),
        });
    }

    private emitMonitorTimeoutEvent(job: MonitorJob, timeoutMs: number): void {
        void this.emitEvent("monitor:timeout", {
            correlationId: job.correlationId,
            monitorId: job.monitorId,
            siteIdentifier: job.siteIdentifier,
            timeoutMs,
            timestamp: Date.now(),
        });
    }
}
