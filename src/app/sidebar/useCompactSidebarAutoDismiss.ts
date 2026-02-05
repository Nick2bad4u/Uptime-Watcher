import type { RefObject } from "react";

import { useEffect } from "react";

import { SIDEBAR_COLLAPSE_MEDIA_QUERY } from "../../constants/layout";
import { tryGetMediaQueryList } from "../../utils/mediaQueries";

const SIDEBAR_DISMISS_INTERACTIVE_SELECTORS = [
    ".app-sidebar",
    ".app-topbar__sidebar-toggle",
    ".sidebar-reveal-button",
] as const;

/**
 * Auto-dismisses the compact sidebar once focus leaves it.
 */
export function useCompactSidebarAutoDismiss(args: {
    readonly closeCompactSidebar: () => void;
    readonly closeNonCompactSidebar: () => void;
    readonly isCompactViewport: boolean;
    readonly isSidebarOpen: boolean;
    readonly sidebarMediaQueryRef: RefObject<MediaQueryList | null>;
}): void {
    const {
        closeCompactSidebar,
        closeNonCompactSidebar,
        isCompactViewport,
        isSidebarOpen,
        sidebarMediaQueryRef,
    } = args;

    useEffect(
        function handleCompactSidebarAutoDismissEffect(): () => void {
            const mediaQuery =
                sidebarMediaQueryRef.current ??
                tryGetMediaQueryList(SIDEBAR_COLLAPSE_MEDIA_QUERY);

            if (!isSidebarOpen || !(mediaQuery?.matches ?? false)) {
                return () => {};
            }

            const handlePointerDown = (event: PointerEvent): void => {
                const { target } = event;
                if (!(target instanceof HTMLElement)) {
                    return;
                }

                const interactedWithinSidebar =
                    SIDEBAR_DISMISS_INTERACTIVE_SELECTORS.some(
                        (selector) => target.closest(selector) !== null
                    );

                if (interactedWithinSidebar) {
                    return;
                }

                if (isCompactViewport) {
                    closeCompactSidebar();
                } else {
                    closeNonCompactSidebar();
                }
            };

            document.addEventListener("pointerdown", handlePointerDown, true);

            return () => {
                document.removeEventListener(
                    "pointerdown",
                    handlePointerDown,
                    true
                );
            };
        },
        [
            closeCompactSidebar,
            closeNonCompactSidebar,
            isCompactViewport,
            isSidebarOpen,
            sidebarMediaQueryRef,
        ]
    );
}
