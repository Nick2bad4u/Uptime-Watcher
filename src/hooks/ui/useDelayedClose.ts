import { useCallback, useEffect, useRef, useState } from "react";

import { useMount } from "../useMount";
import { waitForAnimation } from "../../utils/time/waitForAnimation";

/**
 * Options for {@link useDelayedClose}.
 */
export interface UseDelayedCloseOptions {
    /** Optional animation duration to wait before invoking `onClose`. */
    readonly delayMs?: number;
    /** Close callback invoked after the animation delay finishes. */
    readonly onClose: () => void;
}

/**
 * State and close requester returned by {@link useDelayedClose}.
 */
export interface UseDelayedCloseResult {
    /** Whether a close request has started and closing styles should apply. */
    readonly isClosing: boolean;
    /** Starts the delayed close sequence. Repeated calls are ignored. */
    readonly requestClose: () => void;
}

/**
 * Coordinates an idempotent delayed close sequence for animated overlays.
 *
 * @remarks
 * The first close request starts the closing state and waits for the animation
 * duration before calling `onClose`. Later requests are ignored, and unmounted
 * components do not invoke the parent close callback after the delay resolves.
 */
export function useDelayedClose({
    delayMs,
    onClose,
}: UseDelayedCloseOptions): UseDelayedCloseResult {
    const [isClosing, setIsClosing] = useState(false);
    const hasRequestedCloseRef = useRef(false);
    const isMountedRef = useRef(true);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const trackMountedState = useCallback(
        function markDelayedCloseMounted(): void {
            isMountedRef.current = true;
        },
        []
    );

    const clearMountedState = useCallback(
        function clearDelayedCloseMounted(): void {
            isMountedRef.current = false;
        },
        []
    );

    useMount(trackMountedState, clearMountedState);

    const requestClose = useCallback((): void => {
        if (hasRequestedCloseRef.current) {
            return;
        }

        hasRequestedCloseRef.current = true;
        setIsClosing(true);

        void (async (): Promise<void> => {
            await waitForAnimation(delayMs);

            if (isMountedRef.current) {
                onCloseRef.current();
            }
        })();
    }, [delayMs]);

    return {
        isClosing,
        requestClose,
    };
}
