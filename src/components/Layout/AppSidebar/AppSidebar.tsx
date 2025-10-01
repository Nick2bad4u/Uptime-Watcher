/**
 * Application sidebar containing global navigation and site quick-switching.
 *
 * @remarks
 * Presents a Slack/Discord-inspired navigation column with search, quick
 * actions, and per-site status indicators. The component relies on the global
 * stores for data and integrates with {@link SidebarLayoutProvider} so it can
 * collapse on compact layouts.
 */

import type { Site, SiteStatus } from "@shared/types";

import {
    getSiteDisplayStatus,
    getSiteStatusDescription,
} from "@shared/utils/siteStatus";
import {
    type ChangeEvent,
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { useSidebarLayout } from "../SidebarLayoutContext";
import "./AppSidebar.css";

/**
 * Maps a {@link SiteStatus} to a CSS modifier class.
 */
const STATUS_CLASS_MAP: Record<SiteStatus, string> = {
    degraded: "app-sidebar__item-status-dot--degraded",
    down: "app-sidebar__item-status-dot--down",
    mixed: "app-sidebar__item-status-dot--mixed",
    paused: "app-sidebar__item-status-dot--paused",
    pending: "app-sidebar__item-status-dot--pending",
    unknown: "app-sidebar__item-status-dot--unknown",
    up: "app-sidebar__item-status-dot--up",
};

/**
 * Props are sourced from stores, therefore the component exposes no explicit
 * properties.
 */
export const AppSidebar: NamedExoticComponent = memo(function AppSidebar() {
    const { isDark, toggleTheme } = useTheme();
    const { isSidebarOpen, toggleSidebar } = useSidebarLayout();
    const sites = useSitesStore(useCallback((state) => state.sites, []));

    const selectSite = useUIStore(useCallback((state) => state.selectSite, []));
    const selectedSiteId = useUIStore(
        useCallback((state) => state.selectedSiteId, [])
    );
    const setShowAddSiteModal = useUIStore(
        useCallback((state) => state.setShowAddSiteModal, [])
    );
    const setShowSettings = useUIStore(
        useCallback((state) => state.setShowSettings, [])
    );
    const setShowSiteDetails = useUIStore(
        useCallback((state) => state.setShowSiteDetails, [])
    );

    const [query, setQuery] = useState<string>("");

    const filteredSites = useMemo((): readonly Site[] => {
        if (query.trim().length === 0) {
            return sites;
        }

        const normalizedQuery = query.trim().toLowerCase();
        return sites.filter((site) =>
            site.name.toLowerCase().includes(normalizedQuery)
        );
    }, [query, sites]);

    // Automatically select the first site to keep the detail pane populated on
    // first render.
    useEffect(
        function selectInitialSite(): void {
            if (!selectedSiteId && filteredSites.length > 0) {
                selectSite(filteredSites[0]);
            }
        },
        [
            filteredSites,
            selectedSiteId,
            selectSite,
        ]
    );

    const handleSearchChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setQuery(event.target.value);
        },
        []
    );

    const handleAddSite = useCallback(() => {
        setShowAddSiteModal(true);
    }, [setShowAddSiteModal]);

    const handleOpenSettings = useCallback(() => {
        setShowSettings(true);
    }, [setShowSettings]);

    const handleSelectSite = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            const { dataset } = event.currentTarget;
            const { siteId } = dataset;
            if (!siteId) {
                return;
            }

            const siteToSelect = sites.find(
                (site) => site.identifier === siteId
            );
            if (!siteToSelect) {
                return;
            }

            selectSite(siteToSelect);
            setShowSiteDetails(false);
        },
        [
            selectSite,
            setShowSiteDetails,
            sites,
        ]
    );

    return (
        <aside
            aria-label="Site navigation"
            className={`app-sidebar ${isDark ? "app-sidebar--dark" : "app-sidebar--light"} ${
                isSidebarOpen ? "app-sidebar--open" : "app-sidebar--collapsed"
            }`}
        >
            <div className="app-sidebar__inner">
                <div className="app-sidebar__brand">
                    <button
                        aria-label="Collapse sidebar"
                        className="app-sidebar__brand-trigger"
                        onClick={toggleSidebar}
                        type="button"
                    >
                        ☰
                    </button>
                    <div>
                        <ThemedText
                            className="app-sidebar__brand-title"
                            size="md"
                            weight="semibold"
                        >
                            Uptime Watcher
                        </ThemedText>
                        <ThemedText
                            className="app-sidebar__brand-subtitle"
                            size="xs"
                            variant="secondary"
                        >
                            Command Center
                        </ThemedText>
                    </div>
                </div>

                <div className="app-sidebar__search" role="search">
                    <label
                        className="app-sidebar__search-label"
                        htmlFor="sidebar-search"
                    >
                        <span className="sr-only">Search monitored sites</span>
                        <input
                            autoComplete="off"
                            className="app-sidebar__search-input"
                            id="sidebar-search"
                            onChange={handleSearchChange}
                            placeholder="Search sites"
                            type="search"
                            value={query}
                        />
                    </label>
                </div>

                <nav aria-label="Monitored sites" className="app-sidebar__list">
                    {filteredSites.length === 0 ? (
                        <ThemedText
                            className="app-sidebar__empty"
                            size="sm"
                            variant="secondary"
                        >
                            No sites match your search.
                        </ThemedText>
                    ) : (
                        filteredSites.map((site) => {
                            const status = getSiteDisplayStatus(site);
                            const statusDescription =
                                getSiteStatusDescription(site);

                            const runningMonitors = site.monitors.filter(
                                (monitor) => monitor.monitoring
                            ).length;
                            const statusClass = STATUS_CLASS_MAP[status];

                            return (
                                <button
                                    className={`app-sidebar__item ${
                                        site.identifier === selectedSiteId
                                            ? "app-sidebar__item--active"
                                            : ""
                                    }`}
                                    data-site-id={site.identifier}
                                    key={site.identifier}
                                    onClick={handleSelectSite}
                                    title={statusDescription}
                                    type="button"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`app-sidebar__item-status-dot ${statusClass}`}
                                    />
                                    <span className="app-sidebar__item-content">
                                        <span className="app-sidebar__item-name">
                                            {site.name}
                                        </span>
                                        <span className="app-sidebar__item-meta">
                                            {runningMonitors}/
                                            {site.monitors.length} monitoring
                                        </span>
                                    </span>
                                </button>
                            );
                        })
                    )}
                </nav>

                <div className="app-sidebar__footer">
                    <ThemedButton
                        className="app-sidebar__footer-action"
                        onClick={handleAddSite}
                        size="sm"
                        variant="primary"
                    >
                        ➕ Add Site
                    </ThemedButton>
                    <div className="app-sidebar__footer-controls">
                        <ThemedButton
                            className="app-sidebar__footer-control"
                            onClick={handleOpenSettings}
                            size="sm"
                            variant="secondary"
                        >
                            ⚙️ Settings
                        </ThemedButton>
                        <ThemedButton
                            className="app-sidebar__footer-control"
                            onClick={toggleTheme}
                            size="sm"
                            variant="secondary"
                        >
                            {isDark ? "☀️ Light" : "🌙 Dark"}
                        </ThemedButton>
                    </div>
                </div>
            </div>
        </aside>
    );
});
