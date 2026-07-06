import type { EscapeKeyModalConfig } from "@shared/utils/modalHandlers";
import type { JSX } from "react/jsx-runtime";

import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";
import { useEscapeKeyModalHandler } from "@shared/utils/modalHandlers";
import {
    type ReactNode,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
} from "react";
import { createPortal } from "react-dom";
import { arrayAt, arrayFirst, arrayJoin, isEmpty } from "ts-extras";

import { AppIcons } from "../../../utils/icons";
import {
    acquireBlockingModal,
    allocateModalId,
    isTopModal,
    popModal,
    pushModal,
    releaseBlockingModal,
} from "./modalStack";

const noop = (): void => {};

type KeyDownListenerMethod = (
    this: unknown,
    type: "keydown",
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
) => void;

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

type FocusRestoreElement = Pick<HTMLElement, "focus" | "isConnected">;

const isKeyDownListenerMethod = (
    value: unknown
): value is KeyDownListenerMethod => typeof value === "function";

function getDocumentKeyDownListenerMethod(
    holder: unknown,
    key: "addEventListener" | "removeEventListener"
): KeyDownListenerMethod | undefined {
    if (!isObjectLike(holder)) {
        return undefined;
    }

    try {
        const candidate: unknown = Reflect.get(holder, key);
        return isKeyDownListenerMethod(candidate) ? candidate : undefined;
    } catch {
        return undefined;
    }
}

function addDocumentKeyDownCaptureListener(
    handler: (event: globalThis.KeyboardEvent) => void
): () => void {
    const documentProperty = getOwnPropertyValue(globalThis, "document");

    if (!documentProperty.found) {
        return noop;
    }

    const addEventListener = getDocumentKeyDownListenerMethod(
        documentProperty.value,
        "addEventListener"
    );
    const removeEventListener = getDocumentKeyDownListenerMethod(
        documentProperty.value,
        "removeEventListener"
    );

    if (!addEventListener || !removeEventListener) {
        return noop;
    }

    try {
        Reflect.apply(addEventListener, documentProperty.value, [
            "keydown",
            handler,
            { capture: true },
        ]);
    } catch {
        return noop;
    }

    return (): void => {
        try {
            Reflect.apply(removeEventListener, documentProperty.value, [
                "keydown",
                handler,
                true,
            ]);
        } catch {
            // Focus-trap cleanup is best-effort during renderer teardown.
        }
    };
}

function isElementNode(value: unknown): value is Element {
    if (!isObjectLike(value)) {
        return false;
    }

    try {
        return Reflect.get(value, "nodeType") === 1;
    } catch {
        return false;
    }
}

function getDocumentBodyElement(): Element | null {
    const documentProperty = getOwnPropertyValue(globalThis, "document");

    if (!documentProperty.found || !isObjectLike(documentProperty.value)) {
        return null;
    }

    try {
        const body: unknown = Reflect.get(documentProperty.value, "body");
        return isElementNode(body) ? body : null;
    } catch {
        return null;
    }
}

function getDocumentActiveElement(): Element | null {
    const documentProperty = getOwnPropertyValue(globalThis, "document");

    if (!documentProperty.found || !isObjectLike(documentProperty.value)) {
        return null;
    }

    try {
        const activeElement: unknown = Reflect.get(
            documentProperty.value,
            "activeElement"
        );

        return isElementNode(activeElement) ? activeElement : null;
    } catch {
        return null;
    }
}

function isFocusRestoreElement(value: unknown): value is FocusRestoreElement {
    if (!isElementNode(value)) {
        return false;
    }

    try {
        return (
            typeof Reflect.get(value, "focus") === "function" &&
            typeof Reflect.get(value, "isConnected") === "boolean"
        );
    } catch {
        return false;
    }
}

function focusElementSafely(element: FocusRestoreElement): void {
    try {
        element.focus();
    } catch {
        // Focus restoration is best-effort after modal teardown.
    }
}

/** Accent styling applied to the modal shell. */
export type ModalAccent = "danger" | "default" | "success" | "warning";

/** Variant styling applied to the modal shell. */
export type ModalVariant = "default" | "form" | "site-details";

/** Overlay z-index variant. */
export type ModalOverlayVariant = "confirm" | "default";

/** Width sizing for the modal shell. */
export type ModalSize = "lg" | "md" | "sm";

/**
 * Props for {@link Modal}.
 */
export interface ModalProperties {
    /** Accent styling applied to the modal shell. */
    readonly accent?: ModalAccent;

    /** Optional aria-describedby id applied to the dialog element. */
    readonly ariaDescribedById?: string;

    /** Modal content. */
    readonly children: ReactNode;

    /** Accessible label for the close (X) button. */
    readonly closeButtonAriaLabel?: string;

    /** Optional test id for the close (X) button. */
    readonly closeButtonTestId?: string;

    /** If true, clicking the overlay closes the modal (default: true). */
    readonly closeOnOverlayClick?: boolean;

    /**
     * Escape priority (larger wins) for nested modals.
     *
     * @defaultValue 100
     */
    readonly escapePriority?: number;

    /** Optional footer content rendered below the scrollable body. */
    readonly footer?: ReactNode;

    /** Optional decorative content rendered behind the header content. */
    readonly headerBackground?: ReactNode;

    /** Optional accent icon rendered next to the modal title. */
    readonly headerIcon?: ReactNode;

    /**
     * If true, the app root (#root) is set to inert/aria-hidden while this
     * modal is open.
     *
     * @defaultValue true
     */
    readonly isBlocking?: boolean;

    /**
     * If false, the body will not be scrollable.
     *
     * @defaultValue true
     */
    readonly isBodyScrollable?: boolean;

    /** Whether the modal is currently open. */
    readonly isOpen: boolean;

    /** Optional test id for the modal shell. */
    readonly modalTestId?: string;

    /**
     * Called when the modal requests to close (Escape, overlay click, close
     * button).
     */
    readonly onRequestClose: () => void;

    /** Optional extra class name(s) applied to the modal overlay. */
    readonly overlayClassName?: string;

    /** Optional test id for the overlay. */
    readonly overlayTestId?: string;

    /** Overlay z-index variant. */
    readonly overlayVariant?: ModalOverlayVariant;

    /**
     * Dialog role.
     *
     * @defaultValue "dialog"
     */
    readonly role?: "alertdialog" | "dialog";

    /** Optional extra class name(s) applied to the modal shell. */
    readonly shellClassName?: string;

    /** If true, the close (X) button is shown in the header. */
    readonly showCloseButton?: boolean;

    /**
     * Controls the modal shell width.
     *
     * @defaultValue "md"
     */
    readonly size?: ModalSize;

    /** Optional subtitle/description rendered below the title. */
    readonly subtitle?: ReactNode;

    /** Modal title shown in the header and used for aria-labelledby. */
    readonly title: string;

    /** Variant styling applied to the modal shell. */
    readonly variant?: ModalVariant;
}

function resolveModalShellAccentClass(accent: ModalAccent): string {
    switch (accent) {
        case "danger": {
            return "modal-shell--accent-danger";
        }
        case "default": {
            return "";
        }
        case "success": {
            return "modal-shell--accent-success";
        }
        case "warning": {
            return "modal-shell--accent-warning";
        }
        default: {
            return "";
        }
    }
}

function resolveModalShellVariantClass(variant: ModalVariant): string {
    switch (variant) {
        case "default": {
            return "";
        }
        case "form": {
            return "modal-shell--form";
        }
        case "site-details": {
            return "modal-shell--site-details";
        }
        default: {
            return "";
        }
    }
}

function resolveOverlayVariantClass(variant: ModalOverlayVariant): string {
    switch (variant) {
        case "confirm": {
            return "modal-overlay--confirm";
        }
        case "default": {
            return "";
        }
        default: {
            return "";
        }
    }
}

function resolveModalShellSizeClass(size: ModalSize): string {
    switch (size) {
        case "lg": {
            return "modal-shell--size-lg";
        }
        case "md": {
            return "";
        }
        case "sm": {
            return "modal-shell--size-sm";
        }
        default: {
            return "";
        }
    }
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    return [...container.querySelectorAll<HTMLElement>(selector)].filter(
        (el) => !el.hasAttribute("aria-hidden")
    );
}

function renderModalHeader(args: {
    readonly closeButtonAriaLabel: string;
    readonly closeButtonTestId: string | undefined;
    readonly closeIcon: JSX.Element;
    readonly headerBackground: ReactNode | undefined;
    readonly headerIcon: ReactNode | undefined;
    readonly onClose: () => void;
    readonly showCloseButton: boolean;
    readonly subtitle: ReactNode | undefined;
    readonly title: string;
    readonly titleId: string;
}): JSX.Element {
    const {
        closeButtonAriaLabel,
        closeButtonTestId,
        closeIcon,
        headerBackground,
        headerIcon,
        onClose,
        showCloseButton,
        subtitle,
        title,
        titleId,
    } = args;

    return (
        <div className="modal-shell__header">
            {headerBackground}
            <div className="modal-shell__header-content">
                <div className="modal-shell__title-group">
                    <div className="modal-shell__title-row">
                        {headerIcon ? (
                            <div
                                className="modal-shell__accent-icon"
                                data-testid="modal-accent-icon"
                            >
                                {headerIcon}
                            </div>
                        ) : null}
                        <h3 className="modal-shell__title" id={titleId}>
                            {title}
                        </h3>
                    </div>

                    {subtitle ? (
                        <div className="modal-shell__subtitle">{subtitle}</div>
                    ) : null}
                </div>

                {showCloseButton ? (
                    <div className="modal-shell__actions">
                        <button
                            aria-label={closeButtonAriaLabel}
                            className="modal-shell__close"
                            data-testid={closeButtonTestId}
                            onClick={onClose}
                            type="button"
                        >
                            {closeIcon}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

/**
 * Shared, accessible modal dialog.
 *
 * @remarks
 * -
 *
 * Renders in a portal to `document.body`.
 *
 * - Traps focus within the top-most open modal.
 * - Restores focus to the previously focused element on close.
 * - Uses the shared escape-key modal handler with per-modal priority.
 * - Optionally sets the app root (#root) to inert while open.
 */
export const Modal = ({
    accent = "default",
    ariaDescribedById,
    children,
    closeButtonAriaLabel = "Close dialog",
    closeButtonTestId,
    closeOnOverlayClick = true,
    escapePriority = 100,
    footer,
    headerBackground,
    headerIcon,
    isBlocking = true,
    isBodyScrollable = true,
    isOpen,
    modalTestId,
    onRequestClose,
    overlayClassName,
    overlayTestId,
    overlayVariant = "confirm",
    role = "dialog",
    shellClassName,
    showCloseButton = true,
    size = "md",
    subtitle,
    title,
    variant = "default",
}: ModalProperties): JSX.Element | null => {
    const modalId = useMemo(() => allocateModalId(), []);
    const titleId = useId();

    const CloseIcon = AppIcons.ui.close;
    const closeIconElement = useMemo(
        () => <CloseIcon size={18} />,
        [CloseIcon]
    );

    const portalRoot = useMemo<Element | null>(
        () => getDocumentBodyElement(),
        []
    );

    const modalRef = useRef<HTMLDialogElement | null>(null);
    const previouslyFocusedElementRef = useRef<FocusRestoreElement | null>(
        null
    );

    const handleCloseTopMost = useCallback((): void => {
        if (!isTopModal(modalId)) {
            return;
        }

        onRequestClose();
    }, [modalId, onRequestClose]);

    const escapeConfigs = useMemo<EscapeKeyModalConfig[]>(
        () => [
            {
                isOpen,
                onClose: handleCloseTopMost,
                priority: escapePriority,
            },
        ],
        [
            escapePriority,
            handleCloseTopMost,
            isOpen,
        ]
    );

    useEscapeKeyModalHandler(escapeConfigs);

    useEffect(
        function registerModalInStack(): () => void {
            if (!isOpen) {
                return () => {};
            }

            pushModal(modalId);

            if (isBlocking) {
                acquireBlockingModal();
            }

            const activeElement = getDocumentActiveElement();
            previouslyFocusedElementRef.current = isFocusRestoreElement(
                activeElement
            )
                ? activeElement
                : null;

            return () => {
                popModal(modalId);

                if (isBlocking) {
                    releaseBlockingModal();
                }

                const element = previouslyFocusedElementRef.current;
                if (element?.isConnected) {
                    queueMicrotask(() => {
                        focusElementSafely(element);
                    });
                }
            };
        },
        [
            isBlocking,
            isOpen,
            modalId,
        ]
    );

    useEffect(
        function trapTabKeyWithinModal(): () => void {
            if (!isOpen) {
                return () => {};
            }

            const handleKeyDownCapture = (event: KeyboardEvent): void => {
                if (!isTopModal(modalId)) {
                    return;
                }

                if (event.key !== "Tab") {
                    return;
                }

                const modalElement = modalRef.current;
                if (!modalElement) {
                    return;
                }

                const focusable = getFocusableElements(modalElement);
                if (isEmpty(focusable)) {
                    event.preventDefault();
                    modalElement.focus();
                    return;
                }

                const [first] = focusable;
                const last = arrayAt(focusable, -1);
                if (!first || !last) {
                    return;
                }

                const active = getDocumentActiveElement();

                if (!active || !modalElement.contains(active)) {
                    event.preventDefault();
                    first.focus();
                    return;
                }

                if (event.shiftKey && active === first) {
                    event.preventDefault();
                    last.focus();
                    return;
                }

                if (!event.shiftKey && active === last) {
                    event.preventDefault();
                    first.focus();
                }
            };

            return addDocumentKeyDownCaptureListener(handleKeyDownCapture);
        },
        [isOpen, modalId]
    );

    useEffect(
        function focusInitialElement(): () => void {
            if (!isOpen) {
                return () => {};
            }

            if (!isTopModal(modalId)) {
                return () => {};
            }

            const element = modalRef.current;
            if (!element) {
                return () => {};
            }

            const closeButton = element.querySelector<HTMLElement>(
                ".modal-shell__close"
            );
            const focusable = getFocusableElements(element);

            (closeButton ?? arrayFirst(focusable) ?? element).focus();

            return () => {};
        },
        [isOpen, modalId]
    );

    const handleOverlayDismissClick = useCallback((): void => {
        if (!closeOnOverlayClick) {
            return;
        }

        if (!isTopModal(modalId)) {
            return;
        }

        onRequestClose();
    }, [
        closeOnOverlayClick,
        modalId,
        onRequestClose,
    ]);

    const handleCloseButtonClick = useCallback((): void => {
        handleCloseTopMost();
    }, [handleCloseTopMost]);

    if (!isOpen || !portalRoot) {
        return null;
    }

    const shellClassNames = arrayJoin(
        [
            "modal-shell",
            resolveModalShellAccentClass(accent),
            resolveModalShellSizeClass(size),
            resolveModalShellVariantClass(variant),
            shellClassName ?? "",
        ].filter(Boolean),
        " "
    );

    const overlayClassNames = arrayJoin(
        [
            "modal-overlay",
            "modal-overlay--frosted",
            resolveOverlayVariantClass(overlayVariant),
            overlayClassName ?? "",
        ].filter(Boolean),
        " "
    );

    const bodyClassNames = arrayJoin(
        [
            "modal-shell__body",
            isBodyScrollable ? "modal-shell__body-scrollable" : "",
        ].filter(Boolean),
        " "
    );

    return createPortal(
        <div className={overlayClassNames} data-testid={overlayTestId}>
            {closeOnOverlayClick ? (
                <button
                    aria-label="Close modal"
                    className="modal-overlay__dismiss"
                    onClick={handleOverlayDismissClick}
                    tabIndex={-1}
                    type="button"
                />
            ) : null}
            <dialog
                aria-describedby={ariaDescribedById}
                aria-labelledby={titleId}
                aria-modal="true"
                className={shellClassNames}
                data-testid={modalTestId}
                open
                ref={modalRef}
                role={role}
            >
                {renderModalHeader({
                    closeButtonAriaLabel,
                    closeButtonTestId,
                    closeIcon: closeIconElement,
                    headerBackground,
                    headerIcon,
                    onClose: handleCloseButtonClick,
                    showCloseButton,
                    subtitle,
                    title,
                    titleId,
                })}

                <div className={bodyClassNames}>{children}</div>

                {footer ? (
                    <div className="modal-shell__footer">{footer}</div>
                ) : null}
            </dialog>
        </div>,
        portalRoot
    );
};
