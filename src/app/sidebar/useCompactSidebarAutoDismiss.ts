import type { RefObject } from "react";

import { useEffect } from "react";

import { SIDEBAR_COLLAPSE_MEDIA_QUERY } from "../../constants/layout";
import { subscribeToGlobalEvent } from "../../utils/dom/eventListeners";
import { tryGetMediaQueryList } from "../../utils/mediaQueries";

const SIDEBAR_DISMISS_INTERACTIVE_SELECTORS = [
    ".app-sidebar",
    ".app-topbar__sidebar-toggle",
    ".sidebar-reveal-button",
] as const;

const noop = (): void => {};

type ClosestMethod = (this: unknown, selectors: string) => Element | null;

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

const isClosestMethod = (value: unknown): value is ClosestMethod =>
    typeof value === "function";

function getClosestMethod(target: unknown): ClosestMethod | undefined {
    if (!isObjectLike(target)) {
        return undefined;
    }

    try {
        const candidate: unknown = Reflect.get(target, "closest");
        return isClosestMethod(candidate) ? candidate : undefined;
    } catch {
        return undefined;
    }
}

function addDocumentPointerDownListener(
    handler: (event: PointerEvent) => void
): () => void {
    return subscribeToGlobalEvent(
        "document",
        "pointerdown",
        handler,
        { capture: true },
        true
    );
}

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
                return noop;
            }

            const handlePointerDown = (event: PointerEvent): void => {
                const target = event.target;
                const closest = getClosestMethod(target);
                if (!closest) {
                    return;
                }

                const isInteractedWithinSidebar =
                    SIDEBAR_DISMISS_INTERACTIVE_SELECTORS.some(
                        (selector) =>
                            Reflect.apply(closest, target, [selector]) !== null
                    );

                if (isInteractedWithinSidebar) {
                    return;
                }

                if (isCompactViewport) {
                    closeCompactSidebar();
                } else {
                    closeNonCompactSidebar();
                }
            };

            return addDocumentPointerDownListener(handlePointerDown);
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
