/**
 * Updates store for managing application updates and notifications.
 * Handles update status, error states, and update operations.
 */

import { create } from "zustand";

import type { UpdateStatus } from "../types";
import type { UpdatesStore } from "./types";

import { logStoreAction } from "../utils";

export const useUpdatesStore = create<UpdatesStore>((set) => ({
    // Actions
    applyUpdate: () => {
        logStoreAction("UpdatesStore", "applyUpdate");
        window.electronAPI.system.quitAndInstall?.();
    },
    clearUpdateError: () => {
        logStoreAction("UpdatesStore", "clearUpdateError");
        set({ updateError: undefined });
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
    // State
    updateError: undefined,
    updateInfo: undefined,
    updateProgress: 0,
    updateStatus: "idle",
}));
