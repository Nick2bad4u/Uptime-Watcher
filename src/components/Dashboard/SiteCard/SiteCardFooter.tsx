/**
 * Site card footer component. Provides visual hint for card interaction and
 * navigation.
 */

import React from "react";

import ThemedText from "../../../theme/components/ThemedText";

/**
 * Footer section component for site cards with interactive hint text.
 *
 * Features:
 *
 * - Hover-triggered opacity animation for subtle user guidance
 * - Consistent styling with top border separator
 * - Static content optimized with React.memo
 * - Responsive design with themed text components
 *
 * @remarks
 * This component uses group-hover:opacity-100 which requires the parent
 * container to have the Tailwind 'group' class applied. The parent SiteCard
 * component provides this styling context.
 *
 * @example
 *
 * ```tsx
 * <SiteCardFooter />;
 * ```
 *
 * @returns JSX.Element containing the footer with interaction hint (no props
 *   required)
 */
export const SiteCardFooter: React.NamedExoticComponent<object> = React.memo(
    function SiteCardFooter() {
        return (
            <div className="mt-2 border-t pt-2">
                <ThemedText
                    className="text-center opacity-0 transition-opacity group-hover:opacity-100"
                    size="xs"
                    variant="tertiary"
                >
                    Click to view detailed statistics and settings
                </ThemedText>
            </div>
        );
    }
);
