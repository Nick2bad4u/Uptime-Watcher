/**
 * Zustand store for managing in-app status alerts.
 *
 * @remarks
 * Keeps a bounded queue of recent monitor status alerts along with helper
 * actions for dismissal and bulk clearing. Designed to back the renderer toast
 * UI and decouple alert orchestration from React component lifecycles.
 */

import type { MonitorStatus } from "@shared/types";

import { create, type StoreApi, type UseBoundStore } from "zustand";


/** Maximum number of alerts retained in memory. */
export const MAX_ALERT_QUEUE_LENGTH = 20;

/** Maximum number of generic toasts retained in memory. */
export const MAX_TOAST_QUEUE_LENGTH = 20;

const DEFAULT_TOAST_TTL_MS = 5000;

/**
 * Generates monotonically increasing fallback counters without using top-level
 * mutable state.
 */
const nextFallbackAlertCounter = (() => {
    let counter = 0;
    return (): number => {
        counter += 1;
        return counter;
    };
})();

/**
 * Unique identifier generator that leverages the Web Crypto API when available,
 * falling back to a deterministic counter otherwise.
 */
const generateAlertId = (): string => {
    const cryptoObject = globalThis.crypto as
        | (Crypto & { randomUUID?: () => string })
        | undefined;
    if (cryptoObject?.randomUUID) {
        return cryptoObject.randomUUID();
    }

    if (cryptoObject?.getRandomValues) {
        const buffer = new Uint32Array(2);
        cryptoObject.getRandomValues(buffer);
        const first = buffer.at(0);
        const second = buffer.at(1);

        if (typeof first === "number" && typeof second === "number") {
            return `alert-${first.toString(36)}-${second.toString(36)}`;
        }
    }

    return `alert-${Date.now()}-${nextFallbackAlertCounter()}`;
};

/**
 * Normalized alert payload stored within the queue.
 *
 * @public
 */
export interface StatusAlert {
    /** Unique identifier for the alert. */
    readonly id: string;
    /** Identifier of the monitor that triggered the alert. */
    readonly monitorId: string;
    /** Display name of the monitor, falling back to type-specific labeling. */
    readonly monitorName: string;
    /** Optional previous status for comparison messaging. */
    readonly previousStatus?: MonitorStatus;
    /** Identifier of the site associated with the monitor. */
    readonly siteIdentifier: string;
    /** Display name of the source site. */
    readonly siteName: string;
    /** Monitor status after processing the update. */
    readonly status: MonitorStatus;
    /** Epoch milliseconds when the alert was recorded. */
    readonly timestamp: number;
}

/**
 * Toast variant.
 */
export type ToastVariant = "error" | "info" | "success";

/**
 * Generic, user-facing toast message.
 */
export interface AppToast {
    readonly createdAtEpochMs: number;
    readonly id: string;
    readonly message?: string;
    readonly title: string;
    readonly ttlMs: number;
    readonly variant: ToastVariant;
}

/** Input shape for enqueuing generic toasts. */
export interface AppToastInput {
    readonly message?: string;
    readonly title: string;
    readonly ttlMs?: number;
    readonly variant: ToastVariant;
}

/** Input shape for enqueuing alerts. */
export type StatusAlertInput = Omit<StatusAlert, "id" | "timestamp"> & {
    /**
     * Optional alert identifier. When omitted the store will generate a UUID.
     */
    readonly id?: string;
    /** Optional timestamp override in epoch milliseconds. */
    readonly timestamp?: number;
};

/**
 * Store contract for managing in-app alerts.
 */
export interface AlertStore {
    /** Ordered queue of active alerts (newest first). */
    readonly alerts: StatusAlert[];
    /** Removes all queued alerts. */
    readonly clearAlerts: () => void;
    /** Removes all queued toasts. */
    readonly clearToasts: () => void;
    /** Removes a specific alert by identifier. */
    readonly dismissAlert: (id: string) => void;
    /** Removes a specific toast by identifier. */
    readonly dismissToast: (id: string) => void;
    /**
     * Enqueues a new alert and trims the queue to {@link MAX_ALERT_QUEUE_LENGTH}
     * items.
     */
    readonly enqueueAlert: (input: StatusAlertInput) => StatusAlert;
    /** Enqueues a transient toast message. */
    readonly enqueueToast: (input: AppToastInput) => AppToast;
    /** Ordered queue of transient toasts (newest first). */
    readonly toasts: AppToast[];
}

/** Convenience type exposing the Zustand store hook. */
export type AlertStoreHook = UseBoundStore<StoreApi<AlertStore>>;



/**
 * Creates the Zustand hook responsible for alert queue state.
 *
 * @public
 */
export const useAlertStore: AlertStoreHook = create<AlertStore>()((set) => ({
    alerts: [],
    clearAlerts: (): void => {
        set({ alerts: [] });
    },
    clearToasts: (): void => {
        set({ toasts: [] });
    },
    dismissAlert: (id: string): void => {
        set((state) => ({
            alerts: state.alerts.filter((alert) => alert.id !== id),
        }));
    },
    dismissToast: (id: string): void => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },
    enqueueAlert: (input: StatusAlertInput): StatusAlert => {
        const normalizedTimestamp =
            typeof input.timestamp === "number" &&
            !Number.isNaN(input.timestamp)
                ? input.timestamp
                : Date.now();

        const alert: StatusAlert = {
            ...input,
            id: input.id ?? generateAlertId(),
            timestamp: normalizedTimestamp,
        } satisfies StatusAlert;

        set((state) => {
            const nextAlerts = [alert, ...state.alerts];
            if (nextAlerts.length > MAX_ALERT_QUEUE_LENGTH) {
                nextAlerts.length = MAX_ALERT_QUEUE_LENGTH;
            }
            return { alerts: nextAlerts };
        });

        return alert;
    },
    enqueueToast: (input: AppToastInput): AppToast => {
        const toastId = generateAlertId();
        const ttlMs =
            typeof input.ttlMs === "number" && input.ttlMs > 0
                ? input.ttlMs
                : DEFAULT_TOAST_TTL_MS;

        const baseToast = {
            createdAtEpochMs: Date.now(),
            id: toastId,
            title: input.title,
            ttlMs,
            variant: input.variant,
        } as const;

        const toast: AppToast =
            typeof input.message === "string"
                ? { ...baseToast, message: input.message }
                : baseToast;

        set((state) => {
            const nextToasts = [toast, ...state.toasts];
            if (nextToasts.length > MAX_TOAST_QUEUE_LENGTH) {
                nextToasts.length = MAX_TOAST_QUEUE_LENGTH;
            }
            return { toasts: nextToasts };
        });

        return toast;
    },

    toasts: [],
}));
