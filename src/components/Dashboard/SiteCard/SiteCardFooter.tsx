/**
 * Site card footer component.
 * Provides visual hint for card interaction and navigation.
 */

import React from "react";

import { ThemedText } from "../../../theme/components";

/**
 * Footer section component for site cards with interactive hint text.
 *
 * Features:
 * - Hover-triggered opacity animation for subtle user guidance
 * - Consistent styling with top border separator
 * - Static content optimized with React.memo
 * - Responsive design with themed text components
 *
 * @returns JSX element containing the footer with interaction hint
 *
 * @example
 * ```tsx
 * <SiteCardFooter />
 * ```
 */
export const SiteCardFooter = React.memo(function SiteCardFooter() {
    return (
        <div className="pt-2 mt-2 border-t">
            <ThemedText
                className="text-center transition-opacity opacity-0 group-hover:opacity-100"
                size="xs"
                variant="tertiary"
            >
                Click to view detailed statistics and settings
            </ThemedText>
        </div>
    );
});
