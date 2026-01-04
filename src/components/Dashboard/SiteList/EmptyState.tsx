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
        <SurfaceContainer className="w-full" padding="xl">
            <div
                className="flex min-h-56 flex-col items-center justify-center"
                data-testid="empty-state"
            >
                <div className="flex items-center justify-center">
                    <MonitorIcon
                        aria-hidden="true"
                        className="h-14 w-14 opacity-70"
                        data-testid="empty-state-monitor-icon"
                    />
                </div>

                <div className="mt-5 space-y-2 text-center">
                    <ThemedText
                        align="center"
                        as="h3"
                        size="lg"
                        variant="primary"
                        weight="semibold"
                    >
                        No sites are being monitored
                    </ThemedText>

                    <ThemedText align="center" as="p" size="base" variant="secondary">
                        Add your first website to start monitoring its uptime.
                    </ThemedText>
                </div>
            </div>
        </SurfaceContainer>
    );
};
