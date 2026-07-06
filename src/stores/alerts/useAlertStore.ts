/**
 * Zustand store for managing in-app status alerts.
 *
 * @remarks
 * Keeps a bounded queue of recent monitor status alerts along with helper
 * actions for dismissal and bulk clearing. Designed to back the renderer toast
 * UI and decouple alert orchestration from React component lifecycles.
 */

import type { MonitorStatus } from "@shared/types";
import type { Except } from "type-fest";

import {
    getCallableDataProperty,
    getOwnPropertyValue,
} from "@shared/utils/errorPropertyAccess";
import { normalizeUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { create, type StoreApi, type UseBoundStore } from "zustand";

/** Maximum number of alerts retained in memory. */
export const MAX_ALERT_QUEUE_LENGTH = 20;

/** Maximum number of generic toasts retained in memory. */
export const MAX_TOAST_QUEUE_LENGTH = 20;

const DEFAULT_TOAST_TTL_MS = 5000;

const isFiniteNonNegativeNumber = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0;

const isFinitePositiveNumber = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value > 0;

const normalizeAlertDisplayText = (value: string, fallback: string): string =>
    normalizeUserFacingErrorDetail(value) ?? fallback;

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

interface AlertCrypto {
    readonly getRandomValues?: (buffer: Uint32Array) => Uint32Array;
    readonly randomUUID?: () => string;
}

type AlertGetRandomValues = NonNullable<AlertCrypto["getRandomValues"]>;

type AlertRandomUuid = NonNullable<AlertCrypto["randomUUID"]>;

const isAlertCrypto = (value: unknown): value is AlertCrypto =>
    typeof value === "object" && value !== null;

const isAlertGetRandomValues = (
    value: unknown
): value is AlertGetRandomValues => typeof value === "function";

const isAlertRandomUuid = (value: unknown): value is AlertRandomUuid =>
    typeof value === "function";

const getAlertCrypto = (): AlertCrypto | undefined => {
    const property = getOwnPropertyValue(globalThis, "crypto");
    const cryptoCandidate = property.found ? property.value : undefined;
    return isAlertCrypto(cryptoCandidate) ? cryptoCandidate : undefined;
};

const getAlertRandomUuid = (
    cryptoObject: AlertCrypto | undefined
): AlertRandomUuid | undefined => {
    if (!cryptoObject) {
        return undefined;
    }

    const candidate = getCallableDataProperty(cryptoObject, "randomUUID");
    return isAlertRandomUuid(candidate) ? candidate : undefined;
};

const getAlertGetRandomValues = (
    cryptoObject: AlertCrypto | undefined
): AlertGetRandomValues | undefined => {
    if (!cryptoObject) {
        return undefined;
    }

    const candidate = getCallableDataProperty(cryptoObject, "getRandomValues");
    return isAlertGetRandomValues(candidate) ? candidate : undefined;
};

/**
 * Unique identifier generator that leverages the Web Crypto API when available,
 * falling back to a deterministic counter otherwise.
 */
const generateAlertId = (): string => {
    const cryptoObject = getAlertCrypto();
    const randomUUID = getAlertRandomUuid(cryptoObject);
    if (randomUUID) {
        try {
            const candidate = randomUUID.call(cryptoObject);
            if (candidate.trim().length > 0) {
                return candidate;
            }
        } catch {
            // Fall through to getRandomValues or the deterministic fallback.
        }
    }

    const getRandomValues = getAlertGetRandomValues(cryptoObject);
    if (getRandomValues) {
        const buffer = new Uint32Array(2);
        try {
            getRandomValues.call(cryptoObject, buffer);
        } catch {
            return `alert-${Date.now()}-${nextFallbackAlertCounter()}`;
        }
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
export type StatusAlertInput = Except<StatusAlert, "id" | "timestamp"> & {
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
        const normalizedTimestamp = isFiniteNonNegativeNumber(input.timestamp)
            ? input.timestamp
            : Date.now();

        const alert: StatusAlert = {
            ...input,
            id: input.id ?? generateAlertId(),
            monitorId: normalizeAlertDisplayText(
                input.monitorId,
                "unknown-monitor"
            ),
            monitorName: normalizeAlertDisplayText(
                input.monitorName,
                "Unknown Monitor"
            ),
            siteIdentifier: normalizeAlertDisplayText(
                input.siteIdentifier,
                "unknown-site"
            ),
            siteName: normalizeAlertDisplayText(input.siteName, "Unknown Site"),
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
        const ttlMs = isFinitePositiveNumber(input.ttlMs)
            ? input.ttlMs
            : DEFAULT_TOAST_TTL_MS;

        const baseToast = {
            createdAtEpochMs: Date.now(),
            id: toastId,
            title: input.title,
            ttlMs,
            variant: input.variant,
        } as const;

        const normalizedMessage =
            typeof input.message === "string"
                ? normalizeUserFacingErrorDetail(input.message)
                : undefined;

        const toast: AppToast =
            typeof normalizedMessage === "string"
                ? { ...baseToast, message: normalizedMessage }
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
