/**
 * Site list component for the dashboard
 *
 * Displays a list of all configured sites as cards, or shows an empty state
 * when no sites have been added. Applies theme-aware styling with dividers.
 */

import type { JSX } from "react/jsx-runtime";

import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useTheme } from "../../../theme/useTheme";
import { SiteCard } from "../SiteCard/SiteCard";
import { EmptyState } from "./EmptyState";

/**
 * Main site list component that displays all monitored sites.
 *
 * Renders either a list of SiteCard components (one per site) with dividers,
 * or an EmptyState component when no sites are configured. Automatically
 * applies theme-appropriate styling.
 *
 * @returns JSX.Element containing the site list or empty state
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
export function SiteList(): JSX.Element {
    const { sites } = useSitesStore();
    const { isDark } = useTheme();

    if (sites.length === 0) {
        return <EmptyState />;
    }

    // Construct className with proper conditional logic for dark mode
    const containerClassName = `divider-y${isDark ? " dark" : ""}`;

    return (
        <div className={containerClassName}>
            {sites.map((site) => (
                // Note: site.identifier is guaranteed to be unique as per Site interface
                <SiteCard key={site.identifier} site={site} />
            ))}
        </div>
    );
}
