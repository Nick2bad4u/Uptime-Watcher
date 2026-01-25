/**
 * Fire-and-forget async helpers.
 *
 * @remarks
 * Electron code frequently needs to start background async work from sync
 * event handlers (e.g., app lifecycle events, orchestrator events). Using a
 * plain async IIFE repeatedly leads to duplicated boilerplate and increases the
 * chance of accidental unhandled promise rejections.
 */

/**
 * Minimal logger shape for background task error reporting.
 */
export interface BackgroundTaskLogger {
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
}

/**
 * Options for {@link fireAndForget}.
 */
export interface FireAndForgetOptions {
    /**
     * Error handler invoked when the task throws/rejects.
     *
     * @remarks
     * This is required to ensure background failures are surfaced.
     */
    onError: (error: unknown) => void;
}

/**
 * Starts an async task without awaiting it, ensuring rejections are handled.
 */
export function fireAndForget(
    task: () => Promise<void>,
    options: FireAndForgetOptions
): void {
    void (async (): Promise<void> => {
        try {
            await task();
        } catch (error) {
            options.onError(error);
        }
    })();
}

/**
 * Arguments for {@link fireAndForgetLogged}.
 */
export interface FireAndForgetLoggedArgs {
    logger: BackgroundTaskLogger;
    /** Optional extra logger args (structured context, etc.). */
    loggerArgs?: readonly unknown[];
    message: string;
    task: () => Promise<void>;
}

/**
 * Convenience wrapper around {@link fireAndForget} that logs failures.
 */
export function fireAndForgetLogged(args: FireAndForgetLoggedArgs): void {
    fireAndForget(args.task, {
        onError: (error) => {
            args.logger.error(args.message, error, ...(args.loggerArgs ?? []));
        },
    });
}
