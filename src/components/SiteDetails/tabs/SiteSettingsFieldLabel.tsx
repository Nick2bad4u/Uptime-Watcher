import type { ReactElement, ReactNode } from "react";

import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Standard label used for the fields in {@link src/components/SiteDetails/tabs/SettingsTab#SettingsTab}.
 */
export const SiteSettingsFieldLabel = ({
    children,
}: {
    readonly children: ReactNode;
}): ReactElement => (
    <ThemedText
        className="site-settings-field__label"
        size="sm"
        variant="secondary"
        weight="medium"
    >
        {children}
    </ThemedText>
);
