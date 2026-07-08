import type { Promisable } from "type-fest";

export type BackgroundTask = () => Promisable<void>;

export interface FireAndForgetOptions {
    readonly onError: (error: unknown) => void;
}

/**
 * Starts background work from synchronous UI code and guarantees failures are
 * observed.
 */
export function fireAndForget(
    task: BackgroundTask,
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
