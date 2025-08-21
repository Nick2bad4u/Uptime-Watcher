/**
 * Empty state component displayed when no sites are configured for monitoring.
 *
 * @remarks
 * This component serves as a friendly guide for users who have just installed
 * the application or cleared all their sites. It provides clear visual feedback
 * about the empty state and implicitly suggests the next action.
 *
 * Features:
 *
 * - Centered layout with icon and descriptive text
 * - Uses themed components for consistent styling
 * - Responsive design that works across different screen sizes
 * - Clear call-to-action messaging to guide user workflow
 *
 * @example
 *
 * ```tsx
 * function SiteList({ sites }) {
 *     if (sites.length === 0) {
 *         return <EmptyState />;
 *     }
 *     // Render site list items
 *     return (
 *         <div>
 *             {sites.map((site) => (
 *                 <SiteCard key={site.id} site={site} />
 *             ))}
 *         </div>
 *     );
 * }
 * ```
 *
 * @returns JSX.Element containing the empty state UI
 *
 * @public
 */

import type { JSX } from "react/jsx-runtime";

import ThemedBox from "../../../theme/components/ThemedBox";
import ThemedText from "../../../theme/components/ThemedText";

/**
 * Empty state component for displaying when no sites are configured.
 *
 * @remarks
 * Renders a user-friendly empty state with visual indicators and messaging to
 * guide users when no sites are available for monitoring.
 *
 * @returns JSX element containing the empty state interface
 *
 * @public
 */
export const EmptyState = (): JSX.Element => (
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
