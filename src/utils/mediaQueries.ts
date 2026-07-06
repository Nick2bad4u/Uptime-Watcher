/**
 * Media query helpers for the renderer.
 *
 * @remarks
 * These utilities standardize `matchMedia` usage and listener registration so
 * components and hooks don't need to duplicate compatibility logic.
 */

import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";

const noop = (): void => undefined;

type MediaQueryListLegacyMethod = (
    this: MediaQueryList,
    listener: (event: MediaQueryListEvent) => void
) => void;

const isMediaQueryListLegacyMethod = (
    value: unknown
): value is MediaQueryListLegacyMethod => typeof value === "function";

const getMediaQueryListDataMethod = (
    mediaQueryList: MediaQueryList,
    methodName: "addListener" | "removeListener"
): MediaQueryListLegacyMethod | undefined => {
    let current: object | null = mediaQueryList;

    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, methodName);

        if (descriptor) {
            const value: unknown = descriptor.value;
            return "value" in descriptor && isMediaQueryListLegacyMethod(value)
                ? value
                : undefined;
        }

        const prototype: unknown = Object.getPrototypeOf(current);
        current =
            typeof prototype === "object" && prototype !== null
                ? prototype
                : null;
    }

    return undefined;
};

type MatchMediaMethod = (query: string) => unknown;

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

const isMatchMediaMethod = (value: unknown): value is MatchMediaMethod =>
    typeof value === "function";

const isMediaQueryList = (value: unknown): value is MediaQueryList =>
    isObjectLike(value) && typeof Reflect.get(value, "matches") === "boolean";

const getTrustedGlobalValue = (key: PropertyKey): unknown => {
    const property = getOwnPropertyValue(globalThis, key);
    return property.found ? property.value : undefined;
};

const getMatchMediaMethod = (): MatchMediaMethod | undefined => {
    const windowCandidate = getTrustedGlobalValue("window");
    if (!isObjectLike(windowCandidate)) {
        return undefined;
    }

    const matchMediaProperty = getOwnPropertyValue(
        windowCandidate,
        "matchMedia"
    );
    const candidate = matchMediaProperty.found
        ? matchMediaProperty.value
        : undefined;

    return isMatchMediaMethod(candidate)
        ? (query: string) => Reflect.apply(candidate, windowCandidate, [query])
        : undefined;
};

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
    const addListenerCandidate = getMediaQueryListDataMethod(
        mediaQueryList,
        "addListener"
    );

    if (typeof addListenerCandidate === "function") {
        addListenerCandidate.call(mediaQueryList, handler);
        return () => {
            const removeListenerCandidate = getMediaQueryListDataMethod(
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

/**
 * Attempts to construct a {@link MediaQueryList} for the given query.
 *
 * @remarks
 * Returns `null` in non-browser environments (SSR/tests) or if the browser does
 * not support `matchMedia`.
 */
export function tryGetMediaQueryList(query: string): MediaQueryList | null {
    const matchMedia = getMatchMediaMethod();
    if (!matchMedia) {
        return null;
    }

    try {
        const mediaQueryList = matchMedia(query);
        return isMediaQueryList(mediaQueryList) ? mediaQueryList : null;
    } catch {
        return null;
    }
}
