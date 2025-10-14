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
 *                 <SiteCard key={site.identifier} site={site} />
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

import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons } from "../../../utils/icons";
import { SurfaceContainer } from "../../shared/SurfaceContainer";

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
export const EmptyState = (): JSX.Element => {
    const MonitorIcon = AppIcons.metrics.monitor;

    return (
        <SurfaceContainer
            className="text-center"
            data-testid="empty-state"
            padding="xl"
        >
            {/* empty-state-icon class provides styling from src/theme/components.css */}
            <div className="empty-state-icon">
                <MonitorIcon className="empty-state-icon__symbol" size={56} />
            </div>
            <ThemedText className="mb-2" size="lg" weight="medium">
                No sites are being monitored
            </ThemedText>
            <ThemedText variant="secondary">
                Add your first website to start monitoring its uptime.
            </ThemedText>
        </SurfaceContainer>
    );
};
