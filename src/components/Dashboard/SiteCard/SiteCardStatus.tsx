import React from "react";

import { StatusBadge } from "../../common/StatusBadge";

interface SiteCardStatusProps {
    selectedMonitorId: string;
    status: "up" | "down" | "pending";
}

/**
 * Status section of the site card showing the current monitor status
 * Memoized to prevent unnecessary re-renders
 */
export const SiteCardStatus = React.memo(function SiteCardStatus({ selectedMonitorId, status }: SiteCardStatusProps) {
    return <StatusBadge label={`${selectedMonitorId.toUpperCase()} Status`} status={status} size="sm" />;
});
