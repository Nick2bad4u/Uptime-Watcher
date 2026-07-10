import { ensureError } from "@shared/utils/errorHandling";

/** Result of a single scheduled monitor operation. */
type MonitorCheckExecutionOutcome =
    | { error: Error; kind: "error" }
    | { kind: "cancelled" }
    | { kind: "success" }
    | { kind: "timeout" };

interface MonitorCheckExecutionOptions {
    readonly abortController: AbortController;
    readonly operation: (signal: AbortSignal) => Promise<void>;
    readonly onSettled: (timedOut: boolean) => void;
    readonly timeoutMs: number;
    readonly timeoutReason: string;
}

/** Handle for a monitor operation racing against its timeout guard. */
interface MonitorCheckExecution {
    readonly clearTimeout: () => void;
    readonly hasTimedOut: () => boolean;
    readonly outcome: Promise<MonitorCheckExecutionOutcome>;
}

/**
 * Starts a monitor operation and races it against an unrefed timeout guard.
 *
 * @remarks
 * The timeout outcome is resolved before aborting the operation so timeout
 * classification does not depend on how quickly an abort-aware operation
 * rejects.
 *
 * @internal
 */
export function createMonitorCheckExecution(
    options: MonitorCheckExecutionOptions
): MonitorCheckExecution {
    const { abortController } = options;
    const timeoutState = { isTimedOut: false };
    let timeoutHandle: NodeJS.Timeout | undefined;

    const checkPromise = (async (): Promise<MonitorCheckExecutionOutcome> => {
        try {
            await options.operation(abortController.signal);
            return { kind: "success" };
        } catch (error: unknown) {
            if (timeoutState.isTimedOut) {
                return { kind: "success" };
            }

            if (abortController.signal.aborted) {
                return { kind: "cancelled" };
            }

            return { error: ensureError(error), kind: "error" };
        } finally {
            options.onSettled(timeoutState.isTimedOut);
        }
    })();

    const timeoutPromise = new Promise<MonitorCheckExecutionOutcome>(
        (resolve) => {
            timeoutHandle = setTimeout(() => {
                timeoutState.isTimedOut = true;
                resolve({ kind: "timeout" });
                abortController.abort(options.timeoutReason);
            }, options.timeoutMs);
            timeoutHandle.unref();
        }
    );

    return {
        clearTimeout: () => {
            if (!timeoutHandle) {
                return;
            }

            clearTimeout(timeoutHandle);
            timeoutHandle = undefined;
        },
        hasTimedOut: () => timeoutState.isTimedOut,
        outcome: Promise.race([checkPromise, timeoutPromise]),
    };
}
