import type { ValueOf } from "type-fest";

import { type JSX, useCallback, useEffect, useMemo } from "react";
import { objectHasOwn } from "ts-extras";

import type { AppToast } from "../../stores/alerts/useAlertStore";

import { AppIcons } from "../../utils/icons";
import { formatToastTimestamp } from "./toastTimestamp";

const TOAST_TONE = {
    error: "negative",
    info: "info",
    success: "positive",
} as const;

type ToastTone = ValueOf<typeof TOAST_TONE>;

const CloseIcon = AppIcons.ui.close;

/**
 * Properties for the {@link AppToastToast} component.
 */
export interface AppToastToastProperties {
    readonly onDismiss: (toastId: string) => void;
    readonly toast: AppToast;
}

/**
 * Renders a generic (non-monitor) toast notification using the same toaster UI
 * as status alerts.
 */
export const AppToastToast = (props: AppToastToastProperties): JSX.Element => {
    const { onDismiss, toast } = props;

    const handleDismiss = useCallback((): void => {
        onDismiss(toast.id);
    }, [onDismiss, toast.id]);

    useEffect(
        function autoDismissToast(): () => void {
            const timeout = globalThis.setTimeout(() => {
                onDismiss(toast.id);
            }, toast.ttlMs);

            return function cleanupAutoDismiss(): void {
                globalThis.clearTimeout(timeout);
            };
        },
        [
            onDismiss,
            toast.id,
            toast.ttlMs,
        ]
    );

    const tone: ToastTone = objectHasOwn(TOAST_TONE, toast.variant)
        ? TOAST_TONE[toast.variant]
        : TOAST_TONE.info;

    const { dateTime, label } = useMemo(
        () => formatToastTimestamp(toast.createdAtEpochMs),
        [toast.createdAtEpochMs]
    );

    return (
        <button
            aria-label={toast.title}
            className={`status-alert status-alert--tone-${tone}`}
            data-alert-id={toast.id}
            data-testid={`app-toast-${toast.id}`}
            onClick={handleDismiss}
            type="button"
        >
            <div className="status-alert__content">
                <header className="status-alert__header">
                    <span className="status-alert__title">{toast.title}</span>
                    <time
                        aria-hidden="true"
                        className="status-alert__timestamp"
                        dateTime={dateTime}
                    >
                        {label}
                    </time>
                </header>
                {toast.message ? (
                    <p className="status-alert__message">{toast.message}</p>
                ) : null}
            </div>
            <span aria-hidden="true" className="status-alert__dismissIcon">
                <CloseIcon aria-hidden="true" size={16} />
            </span>
        </button>
    );
};
