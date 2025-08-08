import { type JSX } from "react/jsx-runtime";

import { ThemedBox, ThemedText } from "../../../theme/components";

/**
 * Empty state component displayed when no sites are configured for monitoring.
 *
 * Shows a centered message with an icon to guide users towards adding their
 * first site. Uses themed components for consistent styling.
 *
 * @returns JSX.Element containing the empty state UI
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
export const EmptyState = (): JSX.Element => {
    return (
        <ThemedBox className="text-center" padding="xl" surface="base">
            {/* empty-state-icon class provides styling from src/theme/components.css */}
            <div className="empty-state-icon">🌐</div>
            <ThemedText className="mb-2" size="lg" weight="medium">
                No sites to monitor
            </ThemedText>
            <ThemedText variant="secondary">
                Add your first website to start monitoring its uptime.
            </ThemedText>
        </ThemedBox>
    );
};
