import type { RefObject } from "react";

import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";
import { useEffect } from "react";

import { SIDEBAR_COLLAPSE_MEDIA_QUERY } from "../../constants/layout";
import { tryGetMediaQueryList } from "../../utils/mediaQueries";

const SIDEBAR_DISMISS_INTERACTIVE_SELECTORS = [
    ".app-sidebar",
    ".app-topbar__sidebar-toggle",
    ".sidebar-reveal-button",
] as const;

const noop = (): void => {};

type ListenerMethod = (
    this: unknown,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
) => void;

type ClosestMethod = (this: unknown, selectors: string) => Element | null;

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

const isListenerMethod = (value: unknown): value is ListenerMethod =>
    typeof value === "function";

const isClosestMethod = (value: unknown): value is ClosestMethod =>
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
    const documentProperty = getOwnPropertyValue(globalThis, "document");

    if (!documentProperty.found) {
        return noop;
    }

    const addEventListener = getRuntimeListenerMethod(
        documentProperty.value,
        "addEventListener"
    );
    const removeEventListener = getRuntimeListenerMethod(
        documentProperty.value,
        "removeEventListener"
    );

    if (!addEventListener || !removeEventListener) {
        return noop;
    }

    try {
        Reflect.apply(addEventListener, documentProperty.value, [
            "pointerdown",
            handler,
            { capture: true },
        ]);
    } catch {
        return noop;
    }

    return (): void => {
        try {
            Reflect.apply(removeEventListener, documentProperty.value, [
                "pointerdown",
                handler,
                true,
            ]);
        } catch {
            // Auto-dismiss listener cleanup is best-effort during teardown.
        }
    };
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
