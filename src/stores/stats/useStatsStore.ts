/**
 * Stats store for managing application statistics and computed metrics.
 * Handles uptime/downtime calculations and performance metrics.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { StatsStore } from "./types";

import { useSitesStore } from "../sites/useSitesStore";
import { logStoreAction } from "../utils";

export const useStatsStore = create<StatsStore>()(
    persist(
        (set) => ({
            // Actions
            computeStats: () => {
                logStoreAction("StatsStore", "computeStats");

                const sitesStore = useSitesStore.getState();
                const sites = sitesStore.sites;

                // Calculate stats from site data
                const stats = { totalDowntime: 0, totalUptime: 0 };
                for (const site of sites) {
                    for (const monitor of site.monitors) {
                        for (const entry of monitor.history) {
                            if (entry.status === "up") {
                                stats.totalUptime += entry.responseTime || 0;
                            } else if (entry.status === "down") {
                                stats.totalDowntime += entry.responseTime || 0;
                            }
                        }
                    }
                }

                set(stats);
            },
            resetStats: () => {
                logStoreAction("StatsStore", "resetStats");
                set({ totalDowntime: 0, totalUptime: 0 });
            },
            setTotalDowntime: (downtime: number) => {
                logStoreAction("StatsStore", "setTotalDowntime", { downtime });
                set({ totalDowntime: downtime });
            },
            setTotalUptime: (uptime: number) => {
                logStoreAction("StatsStore", "setTotalUptime", { uptime });
                set({ totalUptime: uptime });
            },
            // State
            totalDowntime: 0,
            totalUptime: 0,
        }),
        {
            name: "uptime-watcher-stats",
            partialize: (state) => ({
                totalDowntime: state.totalDowntime,
                totalUptime: state.totalUptime,
            }),
        }
    )
);
