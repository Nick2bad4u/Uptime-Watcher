/**
 * Custom hook for managing selected site state across store boundaries.
 *
 * @remarks
 * Provides a clean interface for accessing the currently selected site by
 * coordinating between the UI store (which tracks selection) and the sites
 * store (which contains site data). This hook properly handles cross-store
 * dependencies without creating tight coupling between stores.
 *
 * The hook automatically updates when either the selected site ID changes or
 * when the sites data is updated, ensuring consistent state.
 *
 * @example
 *
 * ```typescript
 * function SiteDetailsComponent() {
 *   const selectedSite = useSelectedSite();
 *
 *   if (!selectedSite) {
 *     return <div>No site selected</div>;
 *   }
 *
 *   return <div>Site: {selectedSite.name}</div>;
 * }
 * ```
 *
 * @returns The currently selected site object, or undefined if no site is
 *   selected
 *
 * @public
 */

import type { Site } from "@shared/types";

import { useCallback, useMemo } from "react";

import { useSitesStore } from "../stores/sites/useSitesStore";
import { useUIStore } from "../stores/ui/useUiStore";

/**
 * Hook to get the currently selected site from coordinated store data.
 *
 * @remarks
 * This hook efficiently combines data from the UI store (selection state) and
 * sites store (site data) using useMemo to prevent unnecessary recalculations.
 * The memoization ensures the hook only recalculates when the selected site ID
 * or sites array actually changes.
 *
 * @returns The selected site object or undefined if no selection exists
 */
export function useSelectedSite(): Site | undefined {
    const selectedSiteId = useUIStore(
        useCallback((state) => state.selectedSiteId, [])
    );
    const sites = useSitesStore(useCallback((state) => state.sites, []));

    return useMemo((): Site | undefined => {
        if (!selectedSiteId) {
            return undefined;
        }
        return sites.find((site) => site.identifier === selectedSiteId);
    }, [selectedSiteId, sites]);
}
