/**
 * Modal stack manager.
 *
 * @remarks
 * Coordinates multiple open modals so only the top-most modal traps focus and
 * so the app root is only set to `inert` once (and restored only when the last
 * blocking modal closes).
 */

import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";
import { arrayAt } from "ts-extras";

interface AppRootInertSnapshot {
    readonly ariaHidden: null | string;
    readonly hadInert: boolean;
}

type AppRootElement = Pick<
    HTMLElement,
    "getAttribute" | "hasAttribute" | "removeAttribute" | "setAttribute"
>;

const modalStackState: {
    appRootSnapshot: AppRootInertSnapshot | null;
    blockingModalCount: number;
    modalStack: number[];
    nextModalId: number;
} = {
    appRootSnapshot: null,
    blockingModalCount: 0,
    modalStack: [],
    nextModalId: 1,
};

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

function isAppRootElement(value: unknown): value is AppRootElement {
    if (!isObjectLike(value)) {
        return false;
    }

    try {
        return (
            typeof Reflect.get(value, "getAttribute") === "function" &&
            typeof Reflect.get(value, "hasAttribute") === "function" &&
            typeof Reflect.get(value, "removeAttribute") === "function" &&
            typeof Reflect.get(value, "setAttribute") === "function"
        );
    } catch {
        return false;
    }
}

function resolveAppRootElement(): AppRootElement | null {
    const documentProperty = getOwnPropertyValue(globalThis, "document");

    if (!documentProperty.found || !isObjectLike(documentProperty.value)) {
        return null;
    }

    try {
        const querySelector: unknown = Reflect.get(
            documentProperty.value,
            "querySelector"
        );

        if (typeof querySelector !== "function") {
            return null;
        }

        const root: unknown = Reflect.apply(
            querySelector,
            documentProperty.value,
            ["#root"]
        );
        return isAppRootElement(root) ? root : null;
    } catch {
        return null;
    }
}

function ensureInertAppliedToAppRoot(): void {
    const root = resolveAppRootElement();
    if (!root) {
        return;
    }

    modalStackState.appRootSnapshot ??= {
        ariaHidden: root.getAttribute("aria-hidden"),
        hadInert: root.hasAttribute("inert"),
    };

    root.setAttribute("aria-hidden", "true");
    root.setAttribute("inert", "");
}

function restoreAppRootIfNeeded(): void {
    const root = resolveAppRootElement();
    const snapshot = modalStackState.appRootSnapshot;

    if (!root || !snapshot) {
        modalStackState.appRootSnapshot = null;
        return;
    }

    if (snapshot.ariaHidden === null) {
        root.removeAttribute("aria-hidden");
    } else {
        root.setAttribute("aria-hidden", snapshot.ariaHidden);
    }

    if (!snapshot.hadInert) {
        root.removeAttribute("inert");
    }

    modalStackState.appRootSnapshot = null;
}

/**
 * Allocates a unique modal instance id.
 */
export function allocateModalId(): number {
    const id = modalStackState.nextModalId;
    modalStackState.nextModalId += 1;
    return id;
}

/**
 * Registers a modal as open.
 */
export function pushModal(id: number): void {
    modalStackState.modalStack.push(id);
}

/**
 * Unregisters a modal.
 */
export function popModal(id: number): void {
    const index = modalStackState.modalStack.lastIndexOf(id);
    if (index !== -1) {
        modalStackState.modalStack.splice(index, 1);
    }
}

/**
 * Returns true if the provided modal id is currently the top-most open modal.
 */
export function isTopModal(id: number): boolean {
    const top = arrayAt(modalStackState.modalStack, -1);
    return top === id;
}

/**
 * Enables background inert/aria-hidden for a blocking modal.
 */
export function acquireBlockingModal(): void {
    modalStackState.blockingModalCount += 1;

    if (modalStackState.blockingModalCount === 1) {
        ensureInertAppliedToAppRoot();
    }
}

/**
 * Disables background inert/aria-hidden when the last blocking modal closes.
 */
export function releaseBlockingModal(): void {
    modalStackState.blockingModalCount = Math.max(
        0,
        modalStackState.blockingModalCount - 1
    );

    if (modalStackState.blockingModalCount === 0) {
        restoreAppRootIfNeeded();
    }
}
