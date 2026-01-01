/**
 * Updates store for managing application updates and notifications.
 *
 * @remarks
 * This store manages the complete update lifecycle for the Electron
 * application, including checking for updates, downloading updates, tracking
 * progress, and applying updates. It provides a centralized state management
 * solution for update-related UI components and handles communication with the
 * Electron main process for update operations.
 *
 * The store persists update information and status across sessions to provide
 * continuity in the update process, while maintaining error states and progress
 * information in memory for the current session.
 *
 * @example
 *
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

import type { UpdateStatusEventData } from "@shared/types/events";
import type { Merge } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, type PersistOptions } from "zustand/middleware";

import type { UpdateStatus } from "../types";
import type { UpdateInfo, UpdatesStore } from "./types";

import { EventsService } from "../../services/EventsService";
import { logger } from "../../services/logger";
import { SystemService } from "../../services/SystemService";
import { createPersistConfig, logStoreAction } from "../utils";

/**
 * Interface for the updates store with persistence capabilities.
 */
type UpdatesStoreWithPersist = UseBoundStore<
    Merge<
        Omit<StoreApi<UpdatesStore>, "persist">,
        {
            persist: {
                clearStorage: () => void;
                getOptions: () => Partial<
                    PersistOptions<
                        UpdatesStore,
                        {
                            updateInfo: undefined | UpdateInfo;
                            updateStatus: UpdateStatus;
                        }
                    >
                >;
                hasHydrated: () => boolean;
                onFinishHydration: (
                    fn: (state: UpdatesStore) => void
                ) => () => void;
                onHydrate: (fn: (state: UpdatesStore) => void) => () => void;
                rehydrate: () => Promise<void> | void;
                setOptions: (
                    options: Partial<
                        PersistOptions<
                            UpdatesStore,
                            {
                                updateInfo: undefined | UpdateInfo;
                                updateStatus: UpdateStatus;
                            }
                        >
                    >
                ) => void;
            };
        }
    >
>;

const UPDATES_PERSIST_CONFIG = createPersistConfig<
    UpdatesStore,
    {
        updateInfo: undefined | UpdateInfo;
        updateStatus: UpdateStatus;
    }
>("updates", (state) => ({
    updateInfo: state.updateInfo,
    updateStatus: state.updateStatus,
}));

/**
 * Zustand store for managing application updates and update lifecycle.
 *
 * @remarks
 * This store provides comprehensive update management functionality including
 * checking for updates, download progress tracking, and update installation
 * with persistence for update status across application sessions.
 *
 * @public
 */
export const useUpdatesStore: UpdatesStoreWithPersist = create<UpdatesStore>()(
    persist(
        (set, get) => ({
            // Actions
            applyUpdate: async (): Promise<void> => {
                set({ updateError: undefined });
                logStoreAction("UpdatesStore", "applyUpdate", {
                    message: "Attempting to apply downloaded update",
                    success: true,
                });

                try {
                    await SystemService.quitAndInstall();

                    logStoreAction("UpdatesStore", "applyUpdate", {
                        message: "Quit and install triggered successfully",
                        success: true,
                    });
                } catch (error: unknown) {
                    const normalizedError = ensureError(error);

                    set({ updateError: normalizedError.message });
                    logStoreAction("UpdatesStore", "applyUpdate", {
                        error: normalizedError.message,
                        message: "Failed to trigger quit-and-install operation",
                        success: false,
                    });
                }
            },
            applyUpdateStatus: (status: UpdateStatus): void => {
                logStoreAction("UpdatesStore", "applyUpdateStatus", { status });
                set({ updateStatus: status });
            },
            clearUpdateError: (): void => {
                set({ updateError: undefined });
                logStoreAction("UpdatesStore", "clearUpdateError", {
                    message: "Update error cleared",
                    success: true,
                });
            },
            setUpdateError: (error: string | undefined): void => {
                logStoreAction("UpdatesStore", "setUpdateError", { error });
                set({ updateError: error });
            },
            setUpdateInfo: (info): void => {
                logStoreAction("UpdatesStore", "setUpdateInfo", { info });
                set({ updateInfo: info });
            },

            setUpdateProgress: (progress: number): void => {
                logStoreAction("UpdatesStore", "setUpdateProgress", {
                    progress,
                });
                set({ updateProgress: progress });
            },

            subscribeToUpdateStatusEvents: (): (() => void) => {
                let disposed = false;
                let cleanup: (() => void) | null = null;
                let cleanupExecuted = false;

                const subscriptionPromise = (async (): Promise<
                    (() => void) | undefined
                > => {
                    try {
                        const serviceCleanup = await EventsService.onUpdateStatus(
                            ({ error, status }: UpdateStatusEventData) => {
                                // Read the latest actions to avoid stale
                                // closures if tests replace store methods.
                                const store = get();
                                store.applyUpdateStatus(status);
                                store.setUpdateError(error);
                            }
                        );

                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- disposed may flip while awaiting subscription.
                        if (disposed) {
                            serviceCleanup();
                            return serviceCleanup;
                        }

                        cleanup = serviceCleanup;
                        return serviceCleanup;
                    } catch (error: unknown) {
                        logger.error(
                            "[UpdatesStore] Failed to subscribe to update status events",
                            ensureError(error)
                        );
                        return undefined;
                    }
                })();

                return (): void => {
                    disposed = true;

                    if (cleanupExecuted) {
                        return;
                    }

                    cleanupExecuted = true;

                    if (cleanup) {
                        try {
                            cleanup();
                        } catch (error: unknown) {
                            logger.error(
                                "[UpdatesStore] Failed to cleanup update status subscription",
                                ensureError(error)
                            );
                        } finally {
                            cleanup = null;
                        }

                        return;
                    }

                    void (async (): Promise<void> => {
                        try {
                            const deferredCleanup = await subscriptionPromise;
                            if (typeof deferredCleanup === "function") {
                                deferredCleanup();
                            }
                        } catch (error: unknown) {
                            logger.error(
                                "[UpdatesStore] Failed to cleanup deferred update status subscription",
                                ensureError(error)
                            );
                        }
                    })();
                };
            },
            updateError: undefined,
            updateInfo: undefined,
            updateProgress: 0,
            // State
            updateStatus: "idle",
        }),
        {
            ...UPDATES_PERSIST_CONFIG,
            // Re-state required fields explicitly for exactOptionalPropertyTypes.
            name: UPDATES_PERSIST_CONFIG.name,
        }
    )
);
