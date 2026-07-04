import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type StoreKey = "alerts" | "error" | "sites" | "ui" | "updates";

const logger = {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
};

const storeSubscriptions: Record<StoreKey, ReturnType<typeof vi.fn>> = {
    alerts: vi.fn(),
    error: vi.fn(),
    sites: vi.fn(),
    ui: vi.fn(),
    updates: vi.fn(),
};

const subscriptionReturns: Record<StoreKey, unknown> = {
    alerts: undefined,
    error: undefined,
    sites: undefined,
    ui: undefined,
    updates: undefined,
};

const createCountRefs = () => ({
    alertsUpdateCountRef: { current: 0 },
    errorUpdateCountRef: { current: 0 },
    sitesUpdateCountRef: { current: 0 },
    uiUpdateCountRef: { current: 0 },
    updatesUpdateCountRef: { current: 0 },
});

const installStoreMocks = (): void => {
    for (const key of Object.keys(storeSubscriptions) as StoreKey[]) {
        storeSubscriptions[key].mockReturnValue(subscriptionReturns[key]);
    }

    vi.doMock("@shared/utils/environment", () => ({
        isDevelopment: () => false,
    }));
    vi.doMock("../../../services/logger", () => ({ logger }));
    vi.doMock("../../../stores/alerts/useAlertStore", () => ({
        useAlertStore: { subscribe: storeSubscriptions.alerts },
    }));
    vi.doMock("../../../stores/error/useErrorStore", () => ({
        useErrorStore: { subscribe: storeSubscriptions.error },
    }));
    vi.doMock("../../../stores/sites/useSitesStore", () => ({
        useSitesStore: { subscribe: storeSubscriptions.sites },
    }));
    vi.doMock("../../../stores/ui/useUiStore", () => ({
        useUIStore: { subscribe: storeSubscriptions.ui },
    }));
    vi.doMock("../../../stores/updates/useUpdatesStore", () => ({
        useUpdatesStore: { subscribe: storeSubscriptions.updates },
    }));
};

describe("debugStoreSubscriptions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();

        for (const key of Object.keys(subscriptionReturns) as StoreKey[]) {
            subscriptionReturns[key] = (): void => {};
        }
    });

    afterEach(() => {
        vi.doUnmock("@shared/utils/environment");
        vi.doUnmock("../../../services/logger");
        vi.doUnmock("../../../stores/alerts/useAlertStore");
        vi.doUnmock("../../../stores/error/useErrorStore");
        vi.doUnmock("../../../stores/sites/useSitesStore");
        vi.doUnmock("../../../stores/ui/useUiStore");
        vi.doUnmock("../../../stores/updates/useUpdatesStore");
    });

    it("does not invoke accessor-backed unsubscribe properties", async () => {
        let unsubscribeAccesses = 0;
        const accessorBackedSubscription = {};
        Object.defineProperty(accessorBackedSubscription, "unsubscribe", {
            configurable: true,
            enumerable: true,
            get: () => {
                unsubscribeAccesses += 1;
                throw new Error("Unexpected unsubscribe getter access");
            },
        });
        subscriptionReturns.sites = accessorBackedSubscription;
        installStoreMocks();

        const { subscribeToDebugStores } =
            await import("../../../app/debug/debugStoreSubscriptions");
        const refs = { subscriptionsRef: { current: [] } };

        subscribeToDebugStores({
            countRefs: createCountRefs(),
            refs,
        });

        expect(unsubscribeAccesses).toBe(0);
        expect(refs.subscriptionsRef.current).toHaveLength(4);
        expect(logger.warn).toHaveBeenCalledWith(
            "[App:debug] store subscribe did not return a callable unsubscribe",
            {
                storeIdentifier: "sites",
                type: "object",
            }
        );
    });

    it("registers own data unsubscribe containers for cleanup", async () => {
        const unsubscribe = vi.fn();
        subscriptionReturns.sites = { unsubscribe };
        installStoreMocks();

        const { cleanupDebugStoreSubscriptions, subscribeToDebugStores } =
            await import("../../../app/debug/debugStoreSubscriptions");
        const refs = { subscriptionsRef: { current: [] } };

        subscribeToDebugStores({
            countRefs: createCountRefs(),
            refs,
        });
        cleanupDebugStoreSubscriptions({ refs });

        expect(unsubscribe).toHaveBeenCalledTimes(1);
        expect(refs.subscriptionsRef.current).toEqual([]);
    });
});
