/**
 * Site list component for the dashboard
 *
 * Displays a list of all configured sites as cards, or shows an empty state
 * when no sites have been added. Applies theme-aware styling with dividers.
 */

import { useSitesStore } from "../../../stores";
import { useTheme } from "../../../theme/useTheme";
import { SiteCard } from "../SiteCard";
import { EmptyState } from "./EmptyState";

/**
 * Main site list component that displays all monitored sites.
 *
 * Renders either a list of SiteCard components (one per site) with dividers,
 * or an EmptyState component when no sites are configured. Automatically
 * applies theme-appropriate styling.
 *
 * @returns JSX element containing the site list or empty state
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   return (
 *     <div>
 *       <Header />
 *       <SiteList />
 *     </div>
 *   );
 * }
 * ```
 */
export function SiteList() {
    const { sites } = useSitesStore();
    const { isDark } = useTheme();

    if (sites.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={`divider-y ${isDark ? "dark" : ""}`}>
            {sites.map((site) => (
                <SiteCard key={site.identifier} site={site} />
            ))}
        </div>
    );
}
