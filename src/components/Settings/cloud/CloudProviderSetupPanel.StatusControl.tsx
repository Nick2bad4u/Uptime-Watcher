import type { JSX } from "react/jsx-runtime";

import type { CloudProviderSetupPanelConnectionSiteStatus } from "./CloudProviderSetupPanel.model";

import { StatusIndicator } from "../../../theme/components/StatusIndicator";
import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Props for {@link CloudProviderSetupPanelStatusControl}.
 */
export interface CloudProviderSetupPanelStatusControlProperties {
    readonly providerLabel: string;
    readonly status: CloudProviderSetupPanelConnectionSiteStatus;
}

/**
 * Status row showing the indicator + active provider label.
 */
export const CloudProviderSetupPanelStatusControl = ({
    providerLabel,
    status,
}: CloudProviderSetupPanelStatusControlProperties): JSX.Element => (
    <div className="flex items-center gap-3">
        <StatusIndicator showText status={status} />
        <ThemedText size="sm" variant="secondary">
            {providerLabel}
        </ThemedText>
    </div>
);
