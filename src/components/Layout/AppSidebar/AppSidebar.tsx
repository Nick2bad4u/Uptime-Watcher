import type { Site, SiteStatus } from "@shared/types";
import type { IconType } from "react-icons";

// eslint-disable-next-line sonarjs/no-implicit-dependencies -- Uses configured Vite alias for shared asset resolution
import MascotLogo from "@assets/UptimeWatcherMascot.png";
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
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { AppIcons } from "../../../utils/icons";
import { Tooltip } from "../../common/Tooltip/Tooltip";
import { useSidebarLayout } from "../SidebarLayoutContext";
import "./AppSidebar.css";

const SIDEBAR_COLLAPSE_MEDIA_QUERY = "(max-width: 1280px)";

/**
 * Application sidebar containing global navigation and site quick-switching.
 *
 * @remarks
 * Presents a Slack/Discord-inspired navigation column with search, quick
 * actions, and per-site status indicators. The component relies on the global
 * stores for data and integrates with {@link SidebarLayoutProvider} so it can
 * collapse on compact layouts.
 */

const STATUS_ICON_MAP: Record<SiteStatus, IconType> = {
    degraded: AppIcons.status.warning,
    down: AppIcons.status.downFilled,
    mixed: AppIcons.status.warning,
    paused: AppIcons.status.pausedFilled,
    pending: AppIcons.status.pendingFilled,
    unknown: AppIcons.status.pendingFilled,
    up: AppIcons.status.upFilled,
};

/**
 * Maps a {@link SiteStatus} to a CSS modifier class.
 */
const STATUS_CLASS_MAP: Record<SiteStatus, string> = {
    degraded: "app-sidebar__item-status--degraded",
    down: "app-sidebar__item-status--down",
    mixed: "app-sidebar__item-status--mixed",
    paused: "app-sidebar__item-status--paused",
    pending: "app-sidebar__item-status--pending",
    unknown: "app-sidebar__item-status--unknown",
    up: "app-sidebar__item-status--up",
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
    const selectedSiteIdentifier = useUIStore(
        useCallback((state) => state.selectedSiteIdentifier, [])
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
    const setSelectedMonitorId = useSitesStore(
        useCallback((state) => state.setSelectedMonitorId, [])
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
            if (!selectedSiteIdentifier && filteredSites.length > 0) {
                selectSite(filteredSites[0]);
            }
        },
        [
            filteredSites,
            selectedSiteIdentifier,
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
            const { siteIdentifier } = dataset;
            if (!siteIdentifier) {
                return;
            }

            const siteToSelect = sites.find(
                (site) => site.identifier === siteIdentifier
            );
            if (!siteToSelect) {
                return;
            }

            selectSite(siteToSelect);

            const [primaryMonitor] = siteToSelect.monitors;
            if (primaryMonitor) {
                setSelectedMonitorId(
                    siteToSelect.identifier,
                    primaryMonitor.id
                );
            }

            setShowSiteDetails(true);

            if (
                typeof window !== "undefined" &&
                typeof window.matchMedia === "function" &&
                window.matchMedia(SIDEBAR_COLLAPSE_MEDIA_QUERY).matches &&
                isSidebarOpen
            ) {
                toggleSidebar();
            }

            // Scroll to the site card in the main content area
            requestAnimationFrame(() => {
                const cardElement = document.querySelector(
                    `[data-site-identifier="${siteIdentifier}"]`
                );
                if (cardElement) {
                    cardElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            });
        },
        [
            isSidebarOpen,
            selectSite,
            setSelectedMonitorId,
            setShowSiteDetails,
            sites,
            toggleSidebar,
        ]
    );

    const SidebarToggleIcon = isSidebarOpen
        ? AppIcons.ui.collapse
        : AppIcons.ui.expand;
    const AddIcon = AppIcons.actions.add;
    const SettingsIcon = AppIcons.settings.gear;
    const ThemeIcon = isDark ? AppIcons.theme.light : AppIcons.theme.dark;
    const themeButtonLabel = isDark
        ? "Switch to light mode"
        : "Switch to dark mode";
    const themeButtonText = isDark ? "Light Mode" : "Dark Mode";
    const sidebarToggleLabel = isSidebarOpen
        ? "Collapse sidebar"
        : "Expand sidebar";
    const sidebarToggleTooltip = isSidebarOpen
        ? "Collapse navigation sidebar"
        : "Expand navigation sidebar";

    return (
        <aside
            aria-label="Site navigation"
            className={`app-sidebar ${isDark ? "app-sidebar--dark" : "app-sidebar--light"} ${
                isSidebarOpen ? "app-sidebar--open" : "app-sidebar--collapsed"
            }`}
            data-testid="app-sidebar"
        >
            <div className="app-sidebar__inner">
                <div className="app-sidebar__brand">
                    <Tooltip content={sidebarToggleTooltip} position="bottom">
                        {(triggerProps) => (
                            <button
                                {...triggerProps}
                                aria-label={sidebarToggleLabel}
                                className="app-sidebar__brand-trigger"
                                data-testid="sidebar-toggle"
                                onClick={toggleSidebar}
                                type="button"
                            >
                                <SidebarToggleIcon size={18} />
                            </button>
                        )}
                    </Tooltip>
                    <div aria-hidden="true" className="app-sidebar__brand-logo">
                        <img
                            alt="Uptime Watcher mascot"
                            className="app-sidebar__brand-logo-image"
                            src={MascotLogo}
                        />
                    </div>
                    <div className="app-sidebar__brand-copy">
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
                            data-testid="sidebar-search-input"
                            id="sidebar-search"
                            onChange={handleSearchChange}
                            placeholder="Search sites"
                            type="search"
                            value={query}
                        />
                    </label>
                </div>

                <nav
                    aria-label="Monitored sites"
                    className="app-sidebar__list"
                    data-testid="sidebar-site-list"
                >
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
                            const StatusIcon = STATUS_ICON_MAP[status];

                            return (
                                <Tooltip
                                    content={statusDescription}
                                    key={site.identifier}
                                    position="right"
                                    wrapMode="block"
                                >
                                    {(triggerProps) => (
                                        <button
                                            {...triggerProps}
                                            className={`app-sidebar__item ${
                                                site.identifier ===
                                                selectedSiteIdentifier
                                                    ? "app-sidebar__item--active"
                                                    : ""
                                            }`}
                                            data-site-identifier={
                                                site.identifier
                                            }
                                            data-testid="sidebar-site-item"
                                            onClick={handleSelectSite}
                                            type="button"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`app-sidebar__item-status ${statusClass}`}
                                            >
                                                <StatusIcon className="app-sidebar__item-status-icon" />
                                            </span>
                                            <span className="app-sidebar__item-content">
                                                <span className="app-sidebar__item-name">
                                                    {site.name}
                                                </span>
                                                <span className="app-sidebar__item-meta">
                                                    {runningMonitors}/
                                                    {site.monitors.length}
                                                    {" · "}
                                                    monitoring
                                                </span>
                                            </span>
                                        </button>
                                    )}
                                </Tooltip>
                            );
                        })
                    )}
                </nav>

                <div
                    className="app-sidebar__footer"
                    data-testid="sidebar-footer-controls"
                >
                    <Tooltip
                        content="Add a new site"
                        position="right"
                        wrapMode="block"
                    >
                        {(triggerProps) => (
                            <button
                                {...triggerProps}
                                aria-label="Add new site"
                                className="app-sidebar__icon-button app-sidebar__icon-button--primary"
                                onClick={handleAddSite}
                                type="button"
                            >
                                <AddIcon size={18} />
                                <span className="sr-only">Add Site</span>
                            </button>
                        )}
                    </Tooltip>
                    <Tooltip
                        content="Open application settings"
                        position="right"
                    >
                        {(triggerProps) => (
                            <button
                                {...triggerProps}
                                aria-label="Open application settings"
                                className="app-sidebar__icon-button"
                                onClick={handleOpenSettings}
                                type="button"
                            >
                                <SettingsIcon size={18} />
                                <span className="sr-only">Settings</span>
                            </button>
                        )}
                    </Tooltip>
                    <Tooltip content={themeButtonLabel} position="right">
                        {(triggerProps) => (
                            <button
                                {...triggerProps}
                                aria-label={themeButtonLabel}
                                className="app-sidebar__icon-button"
                                onClick={toggleTheme}
                                type="button"
                            >
                                <ThemeIcon size={18} />
                                <span className="sr-only">
                                    {themeButtonText}
                                </span>
                            </button>
                        )}
                    </Tooltip>
                </div>
            </div>
        </aside>
    );
});
