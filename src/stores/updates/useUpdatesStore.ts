/**
 * Updates store for managing application updates and notifications.
 * Handles update status, error states, and update operations.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UpdateStatus } from "../types";
import type { UpdatesStore } from "./types";

import { logStoreAction } from "../utils";

export const useUpdatesStore = create<UpdatesStore>()(
    persist(
        (set) => ({
            // Actions
            applyUpdate: () => {
                window.electronAPI.system.quitAndInstall();
                logStoreAction("UpdatesStore", "applyUpdate", {
                    message: "Applying update and restarting application",
                    success: true,
                });
            },
            clearUpdateError: () => {
                set({ updateError: undefined });
                logStoreAction("UpdatesStore", "clearUpdateError", {
                    message: "Update error cleared",
                    success: true,
                });
            },
            setUpdateError: (error: string | undefined) => {
                logStoreAction("UpdatesStore", "setUpdateError", { error });
                set({ updateError: error });
            },
            setUpdateInfo: (info) => {
                logStoreAction("UpdatesStore", "setUpdateInfo", { info });
                set({ updateInfo: info });
            },

            setUpdateProgress: (progress: number) => {
                logStoreAction("UpdatesStore", "setUpdateProgress", { progress });
                set({ updateProgress: progress });
            },
            setUpdateStatus: (status: UpdateStatus) => {
                logStoreAction("UpdatesStore", "setUpdateStatus", { status });
                set({ updateStatus: status });
            },
            updateError: undefined,
            updateInfo: undefined,
            updateProgress: 0,
            // State
            updateStatus: "idle" as UpdateStatus,
        }),
        {
            name: "uptime-watcher-updates",
            partialize: (state) => ({
                updateInfo: state.updateInfo,
                updateStatus: state.updateStatus,
            }),
        }
    )
);
