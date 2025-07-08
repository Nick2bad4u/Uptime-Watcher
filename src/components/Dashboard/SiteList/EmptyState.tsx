/**
 * Empty state component for the site list dashboard
 *
 * Displays a friendly message and icon when no sites have been added yet,
 * encouraging users to add their first website to monitor.
 */

import { ThemedBox, ThemedText } from "../../../theme";

/**
 * Empty state component displayed when no sites are configured for monitoring.
 *
 * Shows a centered message with an icon to guide users towards adding their
 * first site. Uses themed components for consistent styling.
 *
 * @returns JSX element containing the empty state UI
 *
 * @example
 * ```tsx
 * function SiteList({ sites }) {
 *   if (sites.length === 0) {
 *     return <EmptyState />;
 *   }
 *   // Render site list items
 *   return <div>{sites.map(site => <SiteCard key={site.id} site={site} />)}</div>;
 * }
 * ```
 */
export function EmptyState() {
    return (
        <ThemedBox surface="base" padding="xl" className="text-center">
            <div className="empty-state-icon">🌐</div>
            <ThemedText size="lg" weight="medium" className="mb-2">
                No sites to monitor
            </ThemedText>
            <ThemedText variant="secondary">Add your first website to start monitoring its uptime.</ThemedText>
        </ThemedBox>
    );
}
