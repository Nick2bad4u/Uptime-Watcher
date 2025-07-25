/**
 * Updates store for managing application updates and notifications.
 *
 * @remarks
 * This store manages the complete update lifecycle for the Electron application,
 * including checking for updates, downloading updates, tracking progress, and
 * applying updates. It provides a centralized state management solution for
 * update-related UI components and handles communication with the Electron
 * main process for update operations.
 *
 * The store persists update information and status across sessions to provide
 * continuity in the update process, while maintaining error states and progress
 * information in memory for the current session.
 *
 * @example
 * ```typescript
 * import { useUpdatesStore } from './stores/updates/useUpdatesStore';
 *
 * function UpdateNotification() {
 *   const { updateStatus, updateInfo, applyUpdate } = useUpdatesStore();
 *
 *   if (updateStatus === 'downloaded' && updateInfo) {
 *     return (
 *       <div>
 *         Update {updateInfo.version} ready!
 *         <button onClick={applyUpdate}>Install & Restart</button>
 *       </div>
 *     );
 *   }
 *
 *   return null;
 * }
 * ```
 *
 * @public
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
            updateStatus: "idle",
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
