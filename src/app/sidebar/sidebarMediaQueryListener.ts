/**
 * Sidebar breakpoint media-query listener extracted from `App.tsx`.
 */

import { SIDEBAR_COLLAPSE_MEDIA_QUERY } from "../../constants/layout";
import {
    subscribeToMediaQueryListChanges,
    tryGetMediaQueryList,
} from "../../utils/mediaQueries";

/**
 * Structural ref type (compatible with `useRef`) without depending on
 * deprecated React types.
 */
export interface MutableRef<T> {
    current: T;
}

/** Refs required by {@link setupSidebarMediaQueryListener}. */
export interface SidebarMediaQueryListenerRefs {
    mediaQueryRef: MutableRef<MediaQueryList | null>;
    unsubscribeRef: MutableRef<(() => void) | null>;
}

/** Options for {@link setupSidebarMediaQueryListener}. */
export interface SetupSidebarMediaQueryListenerOptions {
    /** Close the compact sidebar drawer when entering compact mode. */
    closeCompactSidebar: () => void;

    /** Handler invoked when the media query match changes. */
    onBreakpointChange: (event: MediaQueryListEvent) => void;

    refs: SidebarMediaQueryListenerRefs;

    /** Update compact viewport state from the media query match result. */
    setIsCompactViewport: (next: boolean) => void;
}

/**
 * Initialize the sidebar breakpoint media query listener.
 */
export function setupSidebarMediaQueryListener(
    options: SetupSidebarMediaQueryListenerOptions
): void {
    const mediaQuery = tryGetMediaQueryList(SIDEBAR_COLLAPSE_MEDIA_QUERY);
    if (!mediaQuery) {
        return;
    }

    options.refs.mediaQueryRef.current = mediaQuery;

    const { matches } = mediaQuery;
    if (typeof matches === "boolean") {
        options.setIsCompactViewport(matches);
        if (matches) {
            options.closeCompactSidebar();
        }
    }

    options.refs.unsubscribeRef.current = subscribeToMediaQueryListChanges(
        mediaQuery,
        options.onBreakpointChange
    );
}

/**
 * Clean up the sidebar breakpoint listener.
 */
export function cleanupSidebarMediaQueryListener(options: {
    refs: SidebarMediaQueryListenerRefs;
}): void {
    options.refs.unsubscribeRef.current?.();
    options.refs.unsubscribeRef.current = null;
    options.refs.mediaQueryRef.current = null;
}
