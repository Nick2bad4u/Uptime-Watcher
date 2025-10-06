/**
 * Site list component for the dashboard
 *
 * Displays a list of all configured sites as cards, or shows an empty state
 * when no sites have been added. Applies theme-aware styling with dividers.
 */

import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo } from "react";

import type {
    SiteCardPresentation,
    SiteListLayoutMode,
} from "../../../stores/ui/types";

import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { AppIcons } from "../../../utils/icons";
import { SiteCard } from "../SiteCard/SiteCard";
import { SiteCompactCard } from "../SiteCard/SiteCompactCard";
import { EmptyState } from "./EmptyState";
import { SiteListLayoutSelector } from "./SiteListLayoutSelector";
import { SiteTableView } from "./SiteTableView";
import "./SiteList.css";

const SitesIcon = AppIcons.metrics.monitor;

type UiStoreState = ReturnType<typeof useUIStore.getState>;

const selectSiteListLayout = (state: UiStoreState): SiteListLayoutMode =>
    state.siteListLayout;

const selectSetSiteListLayout = (
    state: UiStoreState
): UiStoreState["setSiteListLayout"] => state.setSiteListLayout;

const selectSiteCardPresentation = (
    state: UiStoreState
): SiteCardPresentation => state.siteCardPresentation;

const selectSetSiteCardPresentation = (
    state: UiStoreState
): UiStoreState["setSiteCardPresentation"] => state.setSiteCardPresentation;

/**
 * Main site list component that displays all monitored sites.
 *
 * Renders either a list of SiteCard components (one per site) with dividers, or
 * an EmptyState component when no sites are configured. Automatically applies
 * theme-appropriate styling.
 *
 * @example
 *
 * ```tsx
 * function Dashboard() {
 *     return (
 *         <div>
 *             <Header />
 *             <SiteList />
 *         </div>
 *     );
 * }
 * ```
 *
 * @returns JSX.Element containing the site list or empty state
 */
export const SiteList = (): JSX.Element => {
    const { sites } = useSitesStore();
    const layout = useUIStore(selectSiteListLayout);
    const setLayout = useUIStore(selectSetSiteListLayout);
    const cardPresentation = useUIStore(selectSiteCardPresentation);
    const setCardPresentation = useUIStore(selectSetSiteCardPresentation);
    const { isDark } = useTheme();
    if (sites.length === 0) {
        return <EmptyState />;
    }

    const handleLayoutChange = useCallback(
        (mode: SiteListLayoutMode) => {
            setLayout(mode);
        },
        [setLayout]
    );

    const handlePresentationChange = useCallback(
        (presentation: SiteCardPresentation) => {
            setCardPresentation(presentation);
        },
        [setCardPresentation]
    );

    const gridClassName = useMemo(() => {
        const classes = ["site-grid"];
        if (layout === "card-compact") {
            classes.push("site-grid--compact");
        }
        if (layout === "card-large" && cardPresentation === "stacked") {
            classes.push("site-grid--stacked");
        }
        if (layout === "card-large" && cardPresentation === "grid") {
            classes.push("site-grid--balanced");
        }
        if (isDark) {
            classes.push("site-grid--dark");
        }
        return classes.join(" ");
    }, [
        cardPresentation,
        isDark,
        layout,
    ]);

    return (
        <div className="site-list">
            <div className="site-list__toolbar">
                <div className="site-list__toolbar-title">
                    <ThemedText size="lg" weight="semibold">
                        <span className="site-list__toolbar-heading">
                            <SitesIcon
                                aria-hidden="true"
                                className="site-list__toolbar-icon"
                                size={18}
                            />
                            Sites
                        </span>
                    </ThemedText>
                    <ThemedText size="xs" variant="tertiary">
                        Tracking {sites.length} site
                        {sites.length === 1 ? "" : "s"}
                    </ThemedText>
                </div>
                <SiteListLayoutSelector
                    cardPresentation={cardPresentation}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    onPresentationChange={handlePresentationChange}
                />
            </div>

            {layout === "list" ? (
                <SiteTableView sites={sites} />
            ) : (
                <div className={gridClassName}>
                    {sites.map((site) =>
                        layout === "card-compact" ? (
                            <SiteCompactCard
                                key={site.identifier}
                                site={site}
                            />
                        ) : (
                            <SiteCard
                                key={site.identifier}
                                presentation={cardPresentation}
                                site={site}
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
};
