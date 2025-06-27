import React from "react";

import { ThemedText } from "../../../theme/components";

/**
 * Footer section of the site card with click hint
 * Memoized since it's a static component
 */
export const SiteCardFooter = React.memo(function SiteCardFooter() {
    return (
        <div className="pt-2 mt-2 border-t">
            <ThemedText
                size="xs"
                variant="tertiary"
                className="text-center transition-opacity opacity-0 group-hover:opacity-100"
            >
                Click to view detailed statistics and settings
            </ThemedText>
        </div>
    );
});
