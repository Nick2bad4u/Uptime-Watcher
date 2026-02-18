/**
 * Inline interaction hint rendered alongside card controls.
 */

import { memo, type NamedExoticComponent } from "react";

import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Inline interaction hint shown near large card controls.
 *
 * @returns Memoized hint element encouraging users to open the detailed view.
 */
export const SiteCardFooter: NamedExoticComponent<object> = memo(
    function SiteCardFooterComponent() {
        return (
            <div
                className="site-card__inline-hint"
                data-testid="site-card-footer"
            >
                <ThemedText aria-hidden="true" size="xs" variant="tertiary">
                    Click to view detailed statistics and settings
                </ThemedText>
                <span className="sr-only">Click to expand</span>
            </div>
        );
    }
);
