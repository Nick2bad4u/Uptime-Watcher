/**
 * Frontend hook for integrating with unified state management system.
 *
 * @remarks
 * This hook bridges the gap between frontend Zustand stores and the
 * backend state synchronization service, providing real-time updates
 * and consistent state across all application layers.
 */

import { useCallback, useEffect } from "react";

import { Site } from "../types";

/**
 * Configuration for state synchronization hook.
 *
 * @public
 */
export interface StateSyncHookConfig {
    /** Function to update sites in frontend store */
    setSites: (sites: Site[]) => void;
    /** Function to get current sites from frontend store */
    getSites: () => Site[];
    /** Optional callback for sync events */
    onSync?: (action: "update" | "delete" | "bulk-sync", siteIdentifier?: string) => void;
}

/**
 * Hook for integrating frontend store with backend state synchronization.
 *
 * @param config - Configuration for state synchronization
 * @returns Sync control functions
 *
 * @example
 * ```tsx
 * const { enableSync, disableSync, manualSync } = useStateSynchronization({
 *   setSites: useSitesStore.getState().setSites,
 *   getSites: useSitesStore.getState().getSites,
 *   onSync: (action, id) => console.log(`Sync: ${action}`, id)
 * });
 * ```
 *
 * @public
 */
export function useStateSynchronization(config: StateSyncHookConfig) {
    const { setSites, getSites, onSync } = config;

    /**
     * Handle backend state updates.
     */
    const handleBackendSync = useCallback(
        (sites: Site[]) => {
            const currentSites = getSites();

            // Only update if sites have actually changed to avoid unnecessary re-renders
            if (JSON.stringify(currentSites) !== JSON.stringify(sites)) {
                setSites(sites);
            }
        },
        [setSites, getSites]
    );

    /**
     * Listen for state synchronization events from backend.
     */
    useEffect(() => {
        // Setup IPC listener for state changes
        const electronAPI = window.electronAPI as unknown as {
            stateSync?: {
                onStateSyncEvent?: (
                    callback: (event: {
                        action: "update" | "delete" | "bulk-sync";
                        siteIdentifier?: string;
                        sites?: Site[];
                    }) => void
                ) => () => void;
            };
        };

        if (electronAPI.stateSync?.onStateSyncEvent) {
            const cleanup = electronAPI.stateSync.onStateSyncEvent((event) => {
                if (event.sites) {
                    handleBackendSync(event.sites);
                }

                if (onSync) {
                    onSync(event.action, event.siteIdentifier);
                }
            });

            return cleanup;
        }

        return () => {
            // No cleanup needed if no listener was set up
        };
    }, [handleBackendSync, onSync]);

    /**
     * Force synchronization from backend.
     */
    const forceSyncFromBackend = useCallback(async () => {
        try {
            const electronAPI = window.electronAPI as unknown as {
                stateSync?: {
                    requestFullSync?: () => Promise<{ success: boolean }>;
                };
            };

            if (electronAPI.stateSync?.requestFullSync) {
                await electronAPI.stateSync.requestFullSync();
                // The sync event will be received via the onStateSyncEvent listener
            }
        } catch (error) {
            console.error("Failed to sync from backend:", error);
        }
    }, []);

    /**
     * Check if frontend state is synchronized with backend.
     */
    const isSynchronized = useCallback(async () => {
        try {
            // Note: This method would need to be added to the electronAPI interface
            const electronAPI = window.electronAPI as unknown as {
                isStateSynchronized?: () => Promise<boolean>;
            };

            if (electronAPI.isStateSynchronized) {
                return await electronAPI.isStateSynchronized();
            }
            return true; // Assume synchronized if no backend integration
        } catch (error) {
            console.error("Failed to check sync status:", error);
            return false;
        }
    }, []);

    return {
        /** Force synchronization from backend */
        forceSyncFromBackend,
        /** Check if state is synchronized */
        isSynchronized,
        /** Manual sync handler for direct use */
        handleBackendSync,
    };
}

/**
 * Simple alias for basic state synchronization functionality.
 */
export function useBasicStateSynchronization(config: StateSyncHookConfig) {
    return useStateSynchronization(config);
}
