/**
 * Development-only store subscription diagnostics extracted from `App.tsx`.
 */

import type { UnknownRecord } from "type-fest";

import { isDevelopment } from "@shared/utils/environment";
import { ensureError } from "@shared/utils/errorHandling";

import { logger } from "../../services/logger";
import { useAlertStore } from "../../stores/alerts/useAlertStore";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { useUIStore } from "../../stores/ui/useUiStore";
import { useUpdatesStore } from "../../stores/updates/useUpdatesStore";

/**
 * Structural ref type (compatible with `useRef`) without depending on
 * deprecated React types.
 */
export interface MutableRef<T> {
    current: T;
}

/** Update counters used for development logging. */
export interface DebugStoreCountRefs {
    alertsUpdateCountRef: MutableRef<number>;
    errorUpdateCountRef: MutableRef<number>;
    sitesUpdateCountRef: MutableRef<number>;
    uiUpdateCountRef: MutableRef<number>;
    updatesUpdateCountRef: MutableRef<number>;
}

/** Ref container storing active debug-store unsubscribe callbacks. */
export interface DebugStoreSubscriptionRefs {
    subscriptionsRef: MutableRef<Array<() => void>>;
}

const isCleanupFunction = (candidate: unknown): candidate is () => void =>
    typeof candidate === "function";

const isUnsubscribeContainer = (
    candidate: unknown
): candidate is UnknownRecord & { unsubscribe: () => void } => {
    if (candidate === null || typeof candidate !== "object") {
        return false;
    }

    const unsubscribe: unknown = Reflect.get(candidate, "unsubscribe");
    return typeof unsubscribe === "function";
};

const registerSubscription = (args: {
    nextSubscriptions: Array<() => void>;
    storeIdentifier: string;
    unsubscribeCandidate: unknown;
}): void => {
    if (isCleanupFunction(args.unsubscribeCandidate)) {
        args.nextSubscriptions.push(args.unsubscribeCandidate);
        return;
    }

    if (isUnsubscribeContainer(args.unsubscribeCandidate)) {
        const unsubscribeContainer = args.unsubscribeCandidate;
        args.nextSubscriptions.push(() => {
            unsubscribeContainer.unsubscribe();
        });
        return;
    }

    logger.warn(
        "[App:debug] store subscribe did not return a callable unsubscribe",
        {
            storeIdentifier: args.storeIdentifier,
            type: typeof args.unsubscribeCandidate,
        }
    );
};

/**
 * Subscribe to multiple Zustand stores and log update events.
 */
export function subscribeToDebugStores(args: {
    countRefs: DebugStoreCountRefs;
    refs: DebugStoreSubscriptionRefs;
}): void {
    const nextSubscriptions: Array<() => void> = [];

    const sitesUnsubscribe = useSitesStore.subscribe((state) => {
        if (!isDevelopment()) {
            return;
        }
        args.countRefs.sitesUpdateCountRef.current += 1;
        logger.info("[App:debug] sites store update", {
            count: args.countRefs.sitesUpdateCountRef.current,
            siteCount: state.sites.length,
        });
    });

    registerSubscription({
        nextSubscriptions,
        storeIdentifier: "sites",
        unsubscribeCandidate: sitesUnsubscribe,
    });

    const uiUnsubscribe = useUIStore.subscribe((state) => {
        if (!isDevelopment()) {
            return;
        }
        args.countRefs.uiUpdateCountRef.current += 1;
        logger.info("[App:debug] ui store update", {
            count: args.countRefs.uiUpdateCountRef.current,
            showAddSiteModal: state.showAddSiteModal,
            showSettings: state.showSettings,
            showSiteDetails: state.showSiteDetails,
        });
    });

    registerSubscription({
        nextSubscriptions,
        storeIdentifier: "ui",
        unsubscribeCandidate: uiUnsubscribe,
    });

    const errorUnsubscribe = useErrorStore.subscribe((state) => {
        if (!isDevelopment()) {
            return;
        }
        args.countRefs.errorUpdateCountRef.current += 1;
        logger.info("[App:debug] error store update", {
            count: args.countRefs.errorUpdateCountRef.current,
            isLoading: state.isLoading,
            lastError: state.lastError,
        });
    });

    registerSubscription({
        nextSubscriptions,
        storeIdentifier: "error",
        unsubscribeCandidate: errorUnsubscribe,
    });

    const updatesUnsubscribe = useUpdatesStore.subscribe((state) => {
        if (!isDevelopment()) {
            return;
        }
        args.countRefs.updatesUpdateCountRef.current += 1;
        logger.info("[App:debug] updates store update", {
            count: args.countRefs.updatesUpdateCountRef.current,
            updateError: state.updateError,
            updateStatus: state.updateStatus,
        });
    });

    registerSubscription({
        nextSubscriptions,
        storeIdentifier: "updates",
        unsubscribeCandidate: updatesUnsubscribe,
    });

    const alertsUnsubscribe = useAlertStore.subscribe((state) => {
        if (!isDevelopment()) {
            return;
        }
        args.countRefs.alertsUpdateCountRef.current += 1;
        logger.info("[App:debug] alerts store update", {
            alertCount: state.alerts.length,
            count: args.countRefs.alertsUpdateCountRef.current,
        });
    });

    registerSubscription({
        nextSubscriptions,
        storeIdentifier: "alerts",
        unsubscribeCandidate: alertsUnsubscribe,
    });

    args.refs.subscriptionsRef.current = nextSubscriptions;
}

/**
 * Unsubscribe from any debug subscriptions.
 */
export function cleanupDebugStoreSubscriptions(args: {
    refs: DebugStoreSubscriptionRefs;
}): void {
    args.refs.subscriptionsRef.current.forEach((unsubscribe, index) => {
        if (typeof unsubscribe !== "function") {
            logger.warn(
                "[App:debug] encountered a non-function during debug subscription cleanup",
                { index, type: typeof unsubscribe }
            );
            return;
        }

        try {
            unsubscribe();
        } catch (error) {
            logger.error(
                "[App:debug] failed to unsubscribe from store",
                ensureError(error)
            );
        }
    });

    args.refs.subscriptionsRef.current = [];
}
