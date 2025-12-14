import { ensureError } from "@shared/utils/errorHandling";
import { randomInt } from "node:crypto";

import type { CloudService } from "./CloudService";

import { logger } from "../../utils/logger";

const DEFAULT_SYNC_INTERVAL_MS = 10 * 60_000;
const MAX_BACKOFF_DELAY_MS = 10 * 60_000;
const JITTER_PERCENTAGE = 0.1;

/**
 * Background scheduler for cloud sync (ADR-015).
 *
 * @remarks
 * - Runs only when the configured provider is connected and sync is enabled.
 * - Uses jittered fixed-base intervals and exponential backoff on failures.
 * - Uses `unref()` timers so the scheduler will not keep the process alive
 *   (important for tests and graceful shutdown).
 */
export class CloudSyncScheduler {
    private readonly cloudService: CloudService;

    private isRunning = false;

    private backoffAttempt = 0;

    private timer: NodeJS.Timeout | undefined;

    private async runOnce(): Promise<void> {
        if (this.isRunning) {
            this.scheduleNextRun(this.applyJitter(DEFAULT_SYNC_INTERVAL_MS));
            return;
        }

        this.isRunning = true;

        let success = false;
        try {
            const status = await this.cloudService.getStatus();
            if (!status.syncEnabled || !status.connected) {
                success = true;
                return;
            }

            await this.cloudService.requestSyncNow();
            success = true;
        } catch (error) {
            const resolved = ensureError(error);
            logger.warn("[CloudSyncScheduler] Sync cycle failed", resolved);
        } finally {
            this.isRunning = false;
            this.scheduleNextRun(this.computeDelayMs(success));
        }
    }

    /** Starts the scheduler loop. */
    public initialize(): void {
        this.scheduleNextRun(0);
    }

    /** Stops any scheduled work. */
    public stop(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }

    private scheduleNextRun(delayMs: number): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(
            () => {
                this.timer = undefined;
                void this.runOnce();
            },
            Math.max(0, delayMs)
        );

        // Ensure background timers do not keep the process alive.
        this.timer.unref();
    }

    private computeDelayMs(success: boolean): number {
        if (success) {
            this.backoffAttempt = 0;
            return this.applyJitter(DEFAULT_SYNC_INTERVAL_MS);
        }

        this.backoffAttempt = Math.min(this.backoffAttempt + 1, 10);
        const multiplier = 2 ** this.backoffAttempt;
        const delay = Math.min(
            DEFAULT_SYNC_INTERVAL_MS * multiplier,
            MAX_BACKOFF_DELAY_MS
        );
        return this.applyJitter(delay);
    }

    private applyJitter(value: number): number {
        if (!Number.isFinite(value) || value <= 0) {
            return DEFAULT_SYNC_INTERVAL_MS;
        }

        const jitterRange = Math.max(1, Math.round(value * JITTER_PERCENTAGE));
        const jitterOffset = randomInt(-jitterRange, jitterRange + 1);
        return Math.max(1000, value + jitterOffset);
    }

    public constructor(args: { cloudService: CloudService }) {
        this.cloudService = args.cloudService;
    }
}
