/**
 * Site list component for the dashboard
 *
 * Displays a list of all configured sites as cards, or shows an empty state
 * when no sites have been added. Applies theme-aware styling with dividers.
 */

import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo } from "react";

import type { SiteListLayoutMode } from "../../../stores/ui/types";

import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { SiteCard } from "../SiteCard/SiteCard";
import { SiteCompactCard } from "../SiteCard/SiteCompactCard";
import { EmptyState } from "./EmptyState";
import { SiteListLayoutSelector } from "./SiteListLayoutSelector";
import { SiteTableView } from "./SiteTableView";
import "./SiteList.css";

type UiStoreState = ReturnType<typeof useUIStore.getState>;

const selectSiteListLayout = (state: UiStoreState): SiteListLayoutMode =>
    state.siteListLayout;

const selectSetSiteListLayout = (
    state: UiStoreState
): UiStoreState["setSiteListLayout"] => state.setSiteListLayout;

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

    const gridClassName = useMemo(() => {
        const classes = ["site-grid"];
        if (layout === "card-compact") {
            classes.push("site-grid--compact");
        }
        if (isDark) {
            classes.push("site-grid--dark");
        }
        return classes.join(" ");
    }, [isDark, layout]);

    return (
        <div className="site-list">
            <div className="site-list__toolbar">
                <div className="site-list__toolbar-title">
                    <ThemedText size="lg" weight="semibold">
                        Sites
                    </ThemedText>
                    <ThemedText size="xs" variant="tertiary">
                        Tracking {sites.length} site
                        {sites.length === 1 ? "" : "s"}
                    </ThemedText>
                </div>
                <SiteListLayoutSelector
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
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
                            <SiteCard key={site.identifier} site={site} />
                        )
                    )}
                </div>
            )}
        </div>
    );
};
