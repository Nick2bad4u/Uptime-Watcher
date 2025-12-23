import type { EscapeKeyModalConfig } from "@shared/utils/modalHandlers";
import type { JSX } from "react/jsx-runtime";

import { useEscapeKeyModalHandler } from "@shared/utils/modalHandlers";
import {
    type MouseEvent as ReactMouseEvent,
    type ReactNode,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
} from "react";
import { createPortal } from "react-dom";

import { AppIcons } from "../../../utils/icons";
import {
    acquireBlockingModal,
    allocateModalId,
    isTopModal,
    popModal,
    pushModal,
    releaseBlockingModal,
} from "./modalStack";

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

    /**
     * If true, the application root (#root) is set to inert/aria-hidden while
     * this modal is open.
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

    /** If true, the close (X) button is shown in the header. */
    readonly showCloseButton?: boolean;

    /**
     * Controls the modal shell width.
     *
     * @defaultValue "md"
     */
    readonly size?: ModalSize;

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

    return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute("aria-hidden")
    );
}

/**
 * Shared, accessible modal dialog.
 *
 * @remarks
 * - Renders in a portal to `document.body`.
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
    closeOnOverlayClick = true,
    escapePriority = 100,
    footer,
    isBlocking = true,
    isBodyScrollable = true,
    isOpen,
    modalTestId,
    onRequestClose,
    overlayTestId,
    overlayVariant = "confirm",
    role = "dialog",
    showCloseButton = true,
    size = "md",
    title,
    variant = "default",
}: ModalProperties): JSX.Element | null => {
    const modalId = useMemo(() => allocateModalId(), []);
    const titleId = useId();

    const portalRoot = useMemo<HTMLElement | null>(() => {
        if (typeof document === "undefined") {
            return null;
        }

        return document.body;
    }, []);

    const modalRef = useRef<HTMLDialogElement | null>(null);
    const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

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

            previouslyFocusedElementRef.current =
                document.activeElement instanceof HTMLElement
                    ? document.activeElement
                    : null;

            return () => {
                popModal(modalId);

                if (isBlocking) {
                    releaseBlockingModal();
                }

                const element = previouslyFocusedElementRef.current;
                if (element?.isConnected) {
                    queueMicrotask(() => {
                        element.focus();
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
                if (focusable.length === 0) {
                    event.preventDefault();
                    modalElement.focus();
                    return;
                }

                const [first] = focusable;
                const last = focusable.at(-1);
                if (!first || !last) {
                    return;
                }

                const active = document.activeElement;

                if (
                    !(active instanceof HTMLElement) ||
                    !modalElement.contains(active)
                ) {
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

            document.addEventListener("keydown", handleKeyDownCapture, true);

            return () => {
                document.removeEventListener(
                    "keydown",
                    handleKeyDownCapture,
                    true
                );
            };
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

            (closeButton ?? focusable[0] ?? element).focus();

            return () => {};
        },
        [isOpen, modalId]
    );

    const handleOverlayClick = useCallback(
        (event: ReactMouseEvent<HTMLDivElement>): void => {
            if (!closeOnOverlayClick) {
                return;
            }

            if (!isTopModal(modalId)) {
                return;
            }

            if (event.target === event.currentTarget) {
                onRequestClose();
            }
        },
        [
            closeOnOverlayClick,
            modalId,
            onRequestClose,
        ]
    );

    const handleCloseButtonClick = useCallback((): void => {
        handleCloseTopMost();
    }, [handleCloseTopMost]);

    if (!isOpen || !portalRoot) {
        return null;
    }

    const CloseIcon = AppIcons.ui.close;

    const shellClassNames = [
        "modal-shell",
        resolveModalShellAccentClass(accent),
        resolveModalShellSizeClass(size),
        resolveModalShellVariantClass(variant),
    ]
        .filter(Boolean)
        .join(" ");

    const overlayClassNames = [
        "modal-overlay",
        "modal-overlay--frosted",
        resolveOverlayVariantClass(overlayVariant),
    ]
        .filter(Boolean)
        .join(" ");

    const bodyClassNames = [
        "modal-shell__body",
        isBodyScrollable ? "modal-shell__body-scrollable" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return createPortal(
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- Overlay click-to-close is optional and Escape is handled.
        <div
            className={overlayClassNames}
            data-testid={overlayTestId}
            onClick={handleOverlayClick}
        >
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
                <div className="modal-shell__header">
                    <div className="modal-shell__header-content">
                        <div className="modal-shell__title-group">
                            <h3 className="modal-shell__title" id={titleId}>
                                {title}
                            </h3>
                        </div>
                        {showCloseButton ? (
                            <div className="modal-shell__actions">
                                <button
                                    aria-label={closeButtonAriaLabel}
                                    className="modal-shell__close"
                                    onClick={handleCloseButtonClick}
                                    type="button"
                                >
                                    <CloseIcon size={18} />
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className={bodyClassNames}>{children}</div>

                {footer ? (
                    <div className="modal-shell__footer">{footer}</div>
                ) : null}
            </dialog>
        </div>,
        portalRoot
    );
};
