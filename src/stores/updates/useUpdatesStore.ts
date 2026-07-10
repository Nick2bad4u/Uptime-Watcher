/**
 * Updates store for managing app updates and notifications.
 *
 * @remarks
 * This store manages the complete update lifecycle for the Electron app,
 * including checking for updates, downloading updates, tracking progress, and
 * applying updates. It provides a centralized state management solution for
 * update-related UI components and handles communication with the Electron main
 * process for update operations.
 *
 * Update lifecycle state remains process-local because installation readiness
 * is owned by the current Electron main process.
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
import { ensureError } from "@shared/utils/errorHandling";
import { safeParsePercentage } from "@shared/utils/safeConversions";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { create, type StoreApi, type UseBoundStore } from "zustand";

import type { UpdateStatus } from "../types";
import type { UpdatesStore } from "./types";

import { EventsService } from "../../services/EventsService";
import { logger } from "../../services/logger";
import { SystemService } from "../../services/SystemService";
import { logStoreAction } from "../utils";
import { createRefCountedAsyncSubscription } from "../utils/refCountedAsyncSubscription";

const normalizeUpdateError = (error: string | undefined): string | undefined =>
    error === undefined ? undefined : getUserFacingErrorDetail(error);

/**
 * Zustand store for managing app updates and update lifecycle.
 *
 * @remarks
 * This store provides comprehensive update management functionality including
 * checking for updates, download progress tracking, and update installation
 * using process-local state synchronized with the Electron main process.
 *
 * @public
 */
export const useUpdatesStore: UseBoundStore<StoreApi<UpdatesStore>> =
    create<UpdatesStore>()((set, get) => {
        const updateStatusEventsSubscription =
            createRefCountedAsyncSubscription({
                maxSetupAttempts: 3,
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
                retryDelayMs: 250,
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
                    const updateError =
                        getUserFacingErrorDetail(normalizedError);

                    set({ updateError, updateStatus: "error" });
                    logStoreAction("UpdatesStore", "applyUpdate", {
                        error: updateError,
                        message: "Failed to trigger quit-and-install operation",
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
                const updateError = normalizeUpdateError(error);
                logStoreAction("UpdatesStore", "setUpdateError", {
                    error: updateError,
                });
                set({ updateError });
            },
            setUpdateProgress: (progress: number): void => {
                const updateProgress = safeParsePercentage(progress);
                logStoreAction("UpdatesStore", "setUpdateProgress", {
                    progress: updateProgress,
                });
                set({ updateProgress });
            },
            subscribeToUpdateStatusEvents: (): (() => void) =>
                updateStatusEventsSubscription.subscribe(),

            // State
            updateError: undefined,
            updateProgress: 0,
            updateStatus: "idle",
        };
    });
