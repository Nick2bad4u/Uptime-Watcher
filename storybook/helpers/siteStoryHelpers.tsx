import type { Monitor, Site } from "@shared/types";
import type { Decorator } from "@storybook/react";

import { useEffect, useMemo, useRef } from "react";
import { action } from "storybook/actions";

import { useSitesStore } from "../../src/stores/sites/useSitesStore";
import { useUIStore } from "../../src/stores/ui/useUiStore";

const DEFAULT_HISTORY_LENGTH = 6;
const RESPONSE_INCREMENT = 25;
const CHECK_INTERVAL_MS = 60_000;
const TIMEOUT_MS = 10_000;

const createHistory = (baseResponse: number): Monitor["history"] => {
    const now = Date.now();

    return Array.from({ length: DEFAULT_HISTORY_LENGTH }, (_, index) => ({
        responseTime: baseResponse + index * RESPONSE_INCREMENT,
        status: index % 3 === 0 ? "degraded" : "up",
        timestamp: now - index * CHECK_INTERVAL_MS,
    }));
};

export const createMockMonitor = (
    overrides: Partial<Monitor> = {}
): Monitor => {
    const baseId = overrides.id ?? "monitor-http";

    return {
        checkInterval: overrides.checkInterval ?? CHECK_INTERVAL_MS,
        history:
            overrides.history ?? createHistory(overrides.responseTime ?? 120),
        id: baseId,
        monitoring: overrides.monitoring ?? true,
        responseTime: overrides.responseTime ?? 120,
        retryAttempts: overrides.retryAttempts ?? 0,
        status: overrides.status ?? "up",
        timeout: overrides.timeout ?? TIMEOUT_MS,
        type: overrides.type ?? "http",
        ...overrides,
    } satisfies Monitor;
};

export const createMockSite = (overrides: Partial<Site> = {}): Site => {
    const identifier = overrides.identifier ?? "site-uptime";
    const monitors =
        overrides.monitors ??
        ([
            createMockMonitor({
                id: `${identifier}-http`,
                responseTime: 110,
                status: "up",
                url: "https://status.example.com",
            }),
            createMockMonitor({
                id: `${identifier}-ping`,
                monitoring: false,
                responseTime: 240,
                status: "degraded",
                type: "ping",
            }),
        ] satisfies Monitor[]);

    return {
        identifier,
        monitoring: overrides.monitoring ?? true,
        monitors,
        name: overrides.name ?? "Uptime Watcher",
    } satisfies Site;
};

const captureSitesState = (): ReturnType<typeof useSitesStore.getState> => {
    const state = useSitesStore.getState();

    return {
        ...state,
        selectedMonitorIds: { ...state.selectedMonitorIds },
        sites: Array.from(state.sites),
    } as ReturnType<typeof useSitesStore.getState>;
};

const captureUiState = (): ReturnType<typeof useUIStore.getState> => {
    const state = useUIStore.getState();

    return {
        ...state,
        siteTableColumnWidths: { ...state.siteTableColumnWidths },
    } as ReturnType<typeof useUIStore.getState>;
};

export const setupSiteStoryEnvironment = (
    sites: readonly Site[]
): (() => void) => {
    const snapshotSites = captureSitesState();
    const snapshotUI = captureUiState();

    const selectedMonitorIds = Object.fromEntries(
        sites.map((site) => [site.identifier, site.monitors[0]?.id ?? ""])
    );

    useSitesStore.setState({
        checkSiteNow: (siteId: string, monitorId: string) => {
            action("sites/checkSiteNow")({ monitorId, siteId });
            return Promise.resolve();
        },
        selectedMonitorIds,
        selectedSiteId: sites[0]?.identifier,
        setSelectedMonitorId: (siteId: string, monitorId: string) => {
            action("sites/setSelectedMonitorId")({ monitorId, siteId });
            useSitesStore.setState((state) => ({
                selectedMonitorIds: {
                    ...state.selectedMonitorIds,
                    [siteId]: monitorId,
                },
            }));
        },
        sites: Array.from(sites),
        startSiteMonitoring: (siteId: string) => {
            action("sites/startSiteMonitoring")(siteId);
            return Promise.resolve();
        },
        startSiteMonitorMonitoring: (siteId: string, monitorId: string) => {
            action("sites/startSiteMonitorMonitoring")({ monitorId, siteId });
            return Promise.resolve();
        },
        stopSiteMonitoring: (siteId: string) => {
            action("sites/stopSiteMonitoring")(siteId);
            return Promise.resolve();
        },
        stopSiteMonitorMonitoring: (siteId: string, monitorId: string) => {
            action("sites/stopSiteMonitorMonitoring")({ monitorId, siteId });
            return Promise.resolve();
        },
    });

    useUIStore.setState({
        selectedSiteId: sites[0]?.identifier,
        selectSite: (site) => {
            action("ui/selectSite")(site?.identifier ?? null);
            useUIStore.setState({ selectedSiteId: site?.identifier });
        },
        setShowSiteDetails: (show) => {
            action("ui/setShowSiteDetails")(show);
            useUIStore.setState({ showSiteDetails: show });
        },
        siteTableColumnWidths: snapshotUI.siteTableColumnWidths,
    });

    return () => {
        useSitesStore.setState(() => snapshotSites, true);
        useUIStore.setState(() => snapshotUI, true);
    };
};

export const createSiteDecorator = (
    getSites: (context: { args: Record<string, unknown> }) => readonly Site[]
): Decorator => {
    function decorateSiteStore(
        StoryComponent: Parameters<Decorator>[0],
        context: Parameters<Decorator>[1]
    ): ReturnType<Decorator> {
        const cleanupRef = useRef<(() => void) | null>(null);
        const sites = useMemo(() => getSites(context), [context]);

        useEffect(
            function syncSiteEnvironment(): () => void {
                if (sites.length === 0) {
                    return () => {};
                }

                cleanupRef.current = setupSiteStoryEnvironment(sites);

                return () => {
                    cleanupRef.current?.();
                    cleanupRef.current = null;
                };
            },
            [sites]
        );

        return <StoryComponent />;
    }

    return decorateSiteStore;
};
