/**
 * Media query helpers for the renderer.
 *
 * @remarks
 * These utilities standardize `matchMedia` usage and listener registration so
 * components and hooks don't need to duplicate compatibility logic.
 */

const noop = (): void => {};

/**
 * Attempts to construct a {@link MediaQueryList} for the given query.
 *
 * @remarks
 * Returns `null` in non-browser environments (SSR/tests) or if the browser does
 * not support `matchMedia`.
 */
export function tryGetMediaQueryList(query: string): MediaQueryList | null {
    if (typeof window === "undefined") {
        return null;
    }

    if (typeof window.matchMedia !== "function") {
        return null;
    }

    try {
        return window.matchMedia(query);
    } catch {
        return null;
    }
}

/**
 * Returns the current `matches` value for a media query.
 */
export function getMediaQueryMatches(query: string): boolean {
    return tryGetMediaQueryList(query)?.matches ?? false;
}

/**
 * Subscribes to `change` events for a {@link MediaQueryList}.
 *
 * @remarks
 * Uses `addEventListener` when available.
 *
 * @returns Cleanup function that unregisters the listener.
 */
export function subscribeToMediaQueryListChanges(
    mediaQueryList: MediaQueryList,
    handler: (event: MediaQueryListEvent) => void
): () => void {
    if (typeof mediaQueryList.addEventListener === "function") {
        mediaQueryList.addEventListener("change", handler);
        return () => {
            mediaQueryList.removeEventListener("change", handler);
        };
    }

    // Legacy Safari/Chromium implementations.
    // Use Reflect.get to avoid touching deprecated DOM lib declarations while
    // still supporting older runtime APIs.
    const addListenerCandidate = Reflect.get(mediaQueryList, "addListener");

    if (typeof addListenerCandidate === "function") {
        addListenerCandidate.call(mediaQueryList, handler);
        return () => {
            const removeListenerCandidate = Reflect.get(
                mediaQueryList,
                "removeListener"
            );
            if (typeof removeListenerCandidate === "function") {
                removeListenerCandidate.call(mediaQueryList, handler);
            }
        };
    }

    return noop;
}

/**
 * Subscribes to `matches` changes for a media query string.
 *
 * @returns Cleanup function.
 */
export function subscribeToMediaQueryMatches(
    query: string,
    onMatchesChange: (matches: boolean) => void
): () => void {
    const mediaQueryList = tryGetMediaQueryList(query);
    if (!mediaQueryList) {
        return noop;
    }

    const handler = (event: MediaQueryListEvent): void => {
        onMatchesChange(event.matches);
    };

    return subscribeToMediaQueryListChanges(mediaQueryList, handler);
}
