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
 *   const { updateStatus, applyUpdate } = useUpdatesStore();
 *
 *   if (updateStatus === 'downloaded') {
 *     return (
 *       <div>
 *         Update ready!
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
import type { Merge, Promisable } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, type PersistOptions } from "zustand/middleware";

import type { UpdateStatus } from "../types";
import type { UpdatesStore } from "./types";

import { EventsService } from "../../services/EventsService";
import { logger } from "../../services/logger";
import { SystemService } from "../../services/SystemService";
import { createPersistConfig, logStoreAction } from "../utils";
import { createRefCountedAsyncSubscription } from "../utils/refCountedAsyncSubscription";

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
                            updateStatus: UpdateStatus;
                        }
                    >
                >;
                hasHydrated: () => boolean;
                onFinishHydration: (
                    fn: (state: UpdatesStore) => void
                ) => () => void;
                onHydrate: (fn: (state: UpdatesStore) => void) => () => void;
                rehydrate: () => Promisable<void>;
                setOptions: (
                    options: Partial<
                        PersistOptions<
                            UpdatesStore,
                            {
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
        updateStatus: UpdateStatus;
    }
>("updates", (state) => ({
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
        (set, get) => {
            const updateStatusEventsSubscription =
                createRefCountedAsyncSubscription({
                    onCleanupError: (error) => {
                        logger.error(
                            "[UpdatesStore] Failed to cleanup update status subscription",
                            error
                        );
                    },
                    onSetupError: (error) => {
                        const resolved = ensureError(error);
                        logger.error(
                            "[UpdatesStore] Failed to subscribe to update status events",
                            resolved
                        );
                        get().setUpdateError(resolved.message);
                    },
                    start: () =>
                        EventsService.onUpdateStatus(
                            ({ error, status }: UpdateStatusEventData) => {
                                // Read the latest actions to avoid stale
                                // closures if tests replace store methods.
                                const store = get();
                                store.applyUpdateStatus(status);
                                store.setUpdateError(error);
                            }
                        ),
                });

            return {
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
                            message:
                                "Failed to trigger quit-and-install operation",
                            success: false,
                        });
                    }
                },
                applyUpdateStatus: (status: UpdateStatus): void => {
                    logStoreAction("UpdatesStore", "applyUpdateStatus", {
                        status,
                    });
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
                    logStoreAction("UpdatesStore", "setUpdateError", {
                        error,
                    });
                    set({ updateError: error });
                },
                setUpdateProgress: (progress: number): void => {
                    logStoreAction("UpdatesStore", "setUpdateProgress", {
                        progress,
                    });
                    set({ updateProgress: progress });
                },
                subscribeToUpdateStatusEvents: (): (() => void) =>
                    updateStatusEventsSubscription.subscribe(),

                // State
                updateError: undefined,
                updateProgress: 0,
                updateStatus: "idle",
            };
        },
        {
            ...UPDATES_PERSIST_CONFIG,
            // Re-state required fields explicitly for exactOptionalPropertyTypes.
            name: UPDATES_PERSIST_CONFIG.name,
        }
    )
);
