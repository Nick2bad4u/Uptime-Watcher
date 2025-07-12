/**
 * Custom hook for managing selected site state.
 * Properly handles cross-store dependencies without tight coupling.
 */

import { useMemo } from "react";

import type { Site } from "../types";

import { useSitesStore, useUIStore } from "../stores";

/**
 * Hook to get the currently selected site from the UI store and sites store.
 * This properly handles the cross-store dependency without creating tight coupling.
 */
export function useSelectedSite(): Site | undefined {
    const selectedSiteId = useUIStore((state) => state.selectedSiteId);
    const sites = useSitesStore((state) => state.sites);

    return useMemo((): Site | undefined => {
        if (!selectedSiteId) {
            return undefined;
        }
        return sites.find((site) => site.identifier === selectedSiteId) ?? undefined;
    }, [selectedSiteId, sites]);
}
