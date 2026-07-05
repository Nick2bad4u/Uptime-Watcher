/**
 * Hook for synchronizing data when the app window gains focus.
 *
 * @remarks
 * Provides functionality to automatically refresh data from the backend when
 * users return to the app after being away. Uses window focus events to trigger
 * full backend synchronization when enabled. Errors are handled internally by
 * the store's error handling system through {@link useSitesStore}'s
 * `withErrorHandling` wrapper, so the fire-and-forget void pattern is safe
 * here.
 *
 * @public
 */

import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";
import { useCallback, useEffect } from "react";

import { useSitesStore } from "../stores/sites/useSitesStore";

const noop = (): void => {};

type ListenerMethod = (
    this: unknown,
    type: string,
    listener: EventListenerOrEventListenerObject
) => void;

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

const isListenerMethod = (value: unknown): value is ListenerMethod =>
    typeof value === "function";

function getRuntimeListenerMethod(
    holder: unknown,
    key: "addEventListener" | "removeEventListener"
): ListenerMethod | undefined {
    if (!isObjectLike(holder)) {
        return undefined;
    }

    try {
        const candidate: unknown = Reflect.get(holder, key);
        return isListenerMethod(candidate) ? candidate : undefined;
    } catch {
        return undefined;
    }
}

function addWindowFocusListener(handler: () => void): () => void {
    const windowProperty = getOwnPropertyValue(globalThis, "window");

    if (!windowProperty.found) {
        return noop;
    }

    const addEventListener = getRuntimeListenerMethod(
        windowProperty.value,
        "addEventListener"
    );
    const removeEventListener = getRuntimeListenerMethod(
        windowProperty.value,
        "removeEventListener"
    );

    if (!addEventListener || !removeEventListener) {
        return noop;
    }

    try {
        Reflect.apply(addEventListener, windowProperty.value, [
            "focus",
            handler,
        ]);
    } catch {
        return noop;
    }

    return (): void => {
        try {
            Reflect.apply(removeEventListener, windowProperty.value, [
                "focus",
                handler,
            ]);
        } catch {
            // Focus-sync teardown is best-effort during renderer shutdown.
        }
    };
}

/**
 * Custom hook that synchronizes app data when the window gains focus.
 *
 * @example
 *
 * ```tsx
 * function App() {
 *   const [syncOnFocus, setSyncOnFocus] = useState(true);
 *
 *   // Enable automatic sync when user returns to app
 *   useBackendFocusSync(syncOnFocus);
 *
 *   return <div>App content</div>;
 * }
 * ```
 *
 * @param enabled - Set to `true` to enable focus-based backend synchronization
 *   (defaults to `false`).
 *
 * @returns `void` – the hook only manages side effects.
 *
 * @public
 *
 * @see {@link useSitesStore} for the backing store implementation.
 */
export function useBackendFocusSync(enabled = false): void {
    // Use selector to avoid unnecessary re-renders when other store state
    // changes
    const fullResyncSites = useSitesStore(
        useCallback((state) => state.fullResyncSites, [])
    );

    useEffect(
        function handleBackendFocusSync(): () => void {
            if (!enabled) {
                return noop;
            }

            const handleFocus = (): void => {
                // Use full sync on focus to ensure complete data consistency
                // since the user may have been away for a while
                // Note: Error handling is managed internally by
                // fullResyncSites through the store's withErrorHandling
                // wrapper, so void is safe here
                void (async (): Promise<void> => {
                    try {
                        await fullResyncSites();
                    } catch {
                        // Focus sync should not crash the renderer focus handler.
                    }
                })();
            };

            return addWindowFocusListener(handleFocus);
        },
        [enabled, fullResyncSites]
    );
}
