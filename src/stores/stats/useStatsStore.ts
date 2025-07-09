/**
 * Stats store for managing application statistics and computed metrics.
 * Handles uptime/downtime calculations and performance metrics.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Site } from "../../types";
import type { StatsStore } from "./types";

import { logStoreAction } from "../utils";

export const useStatsStore = create<StatsStore>()(
    persist(
        (set) => ({
            // Actions
            computeStats: (sites?: Site[]) => {
                // Accept sites as parameter to avoid cross-store dependency
                // If not provided, return early - components should pass the sites data
                if (!sites) {
                    logStoreAction("StatsStore", "computeStats", {
                        message: "No sites provided for computation",
                        sitesCount: 0,
                    });
                    return;
                }

                // Calculate stats from site data
                const stats = { totalDowntime: 0, totalUptime: 0 };
                for (const site of sites) {
                    for (const monitor of site.monitors) {
                        for (const entry of monitor.history) {
                            if (entry.status === "up") {
                                stats.totalUptime += entry.responseTime;
                            } else if (entry.status === "down") {
                                stats.totalDowntime += entry.responseTime;
                            }
                        }
                    }
                }

                set(stats);
                logStoreAction("StatsStore", "computeStats", {
                    message: "Statistics computed from site data",
                    sitesCount: sites.length,
                    totalDowntime: stats.totalDowntime,
                    totalUptime: stats.totalUptime,
                });
            },
            resetStats: () => {
                set({ totalDowntime: 0, totalUptime: 0 });
                logStoreAction("StatsStore", "resetStats", {
                    message: "Statistics reset",
                    success: true,
                });
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
