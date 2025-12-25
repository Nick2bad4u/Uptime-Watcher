import type { ReactNode } from "react";
/**
 * Shared card layout used by the cloud sync maintenance UI.
 *
 * @remarks
 * This component exists to avoid duplicating the same card header + container
 * markup across multiple sync maintenance entry points.
 */
import type { JSX } from "react/jsx-runtime";

import { ThemedText } from "../../../theme/components/ThemedText";

export const SyncMaintenanceCard = (props: {
    readonly children: ReactNode;
    readonly description: ReactNode;
}): JSX.Element => {
    const { children, description } = props;

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
                <ThemedText size="sm" variant="secondary" weight="medium">
                    Sync Maintenance
                </ThemedText>
            </div>

            <ThemedText size="sm" variant="tertiary">
                {description}
            </ThemedText>

            {children}
        </div>
    );
};
