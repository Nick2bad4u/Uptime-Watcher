import { useCallback, useEffect, useState } from "react";

/**
 * Manages a delayed boolean transition for loading indicators.
 *
 * @remarks
 * Showing is delayed to avoid flashing for fast operations. Hiding is also
 * deferred so callers can satisfy the project rule that avoids direct state
 * updates inside effects.
 */
export function useDelayedBoolean(args: {
    readonly clearDelayMs: number;
    readonly enabled?: boolean;
    readonly showDelayMs: number;
    readonly value: boolean;
}): boolean {
    const [delayedValue, setDelayedValue] = useState(false);
    const isEnabled = args.enabled ?? true;

    const clearDelayedValue = useCallback(() => {
        setDelayedValue(false);
    }, []);

    const showDelayedValue = useCallback(() => {
        setDelayedValue(true);
    }, []);

    useEffect(
        function handleDelayedBooleanEffect(): () => void {
            if (!isEnabled) {
                return (): void => undefined;
            }

            if (!args.value) {
                const clearTimeoutId = setTimeout(
                    clearDelayedValue,
                    args.clearDelayMs
                );

                return (): void => {
                    clearTimeout(clearTimeoutId);
                };
            }

            const timeoutId = setTimeout(showDelayedValue, args.showDelayMs);

            return (): void => {
                clearTimeout(timeoutId);
            };
        },
        [
            args.clearDelayMs,
            args.showDelayMs,
            args.value,
            clearDelayedValue,
            isEnabled,
            showDelayedValue,
        ]
    );

    return delayedValue;
}
