/**
 * Site operations module. Handles CRUD operations for sites and monitor
 * management.
 *
 * Uses centralized error store for consistent error handling across the
 * application.
 *
 * @packageDocumentation
 */

import type { Monitor, MonitorType, Site } from "@shared/types";
import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestorePayload,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";
import type { UnknownRecord } from "type-fest";

import { DEFAULT_SITE_NAME } from "@shared/constants/sites";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { ensureError } from "@shared/utils/errorHandling";

import type { BaseSiteOperations } from "./baseTypes";
import type { SiteOperationsDependencies } from "./types";

import { logger } from "../../services/logger";
import { handleSQLiteBackupDownload } from "./utils/fileDownload";
import { normalizeMonitor } from "./utils/monitorOperations";
import {
    applySavedSiteToStore,
    getSiteByIdentifier,
    updateMonitorAndSave,
    withSiteOperation,
    withSiteOperationReturning,
} from "./utils/operationHelpers";

type MonitorNumericField = "checkInterval" | "retryAttempts" | "timeout";
type MonitorNumericUpdateOperationName =
    | "updateMonitorRetryAttempts"
    | "updateMonitorTimeout"
    | "updateSiteCheckInterval";

const updateMonitorNumericField = async (args: {
    deps: SiteOperationsDependencies;
    field: MonitorNumericField;
    monitorId: string;
    operationName: MonitorNumericUpdateOperationName;
    siteIdentifier: string;
    telemetry: UnknownRecord;
    value: number | undefined;
}): Promise<void> => {
    const { deps, field, monitorId, operationName, siteIdentifier, telemetry, value } =
        args;

    await withSiteOperation(
        operationName,
        async () => {
            const updates: Partial<Monitor> = {};
            if (value !== undefined) {
                updates[field] = value;
            }

            await updateMonitorAndSave(siteIdentifier, monitorId, updates, deps);
        },
        deps,
        {
            syncAfter: false,
            telemetry,
        }
    );
};

type BackupMetadata = SerializedDatabaseBackupResult["metadata"];
interface ResultWithBackupMetadata {
    readonly metadata: BackupMetadata;
}

const runSqliteBackupOperationReturning = async <T extends ResultWithBackupMetadata>(args: {
    clearMetadataOnFailure: boolean;
    deps: SiteOperationsDependencies;
    errorLogMessage: string;
    operation: () => Promise<T>;
}): Promise<T> => {
    const { clearMetadataOnFailure, deps, errorLogMessage, operation } = args;

    try {
        const result = await operation();
        deps.setLastBackupMetadata(result.metadata);
        return result;
    } catch (error: unknown) {
        if (clearMetadataOnFailure) {
            deps.setLastBackupMetadata(undefined);
        }

        const resolvedError = ensureError(error);
        logger.error(errorLogMessage, resolvedError);
        throw resolvedError;
    }
};

const downloadSqliteBackupAction = (
    deps: SiteOperationsDependencies
): Promise<SerializedDatabaseBackupResult> =>
    withSiteOperationReturning(
        "downloadSqliteBackup",
        () =>
            runSqliteBackupOperationReturning({
                clearMetadataOnFailure: true,
                deps,
                errorLogMessage: "Failed to download SQLite backup:",
                operation: () =>
                    // eslint-disable-next-line ex/no-unhandled -- The call is awaited and normalized by runSqliteBackupOperationReturning.
                    handleSQLiteBackupDownload(() =>
                        deps.services.data.downloadSqliteBackup()
                    ),
            }),
        deps,
        {
            syncAfter: false,
            telemetry: {
                success: {
                    message: "SQLite backup download completed",
                },
            },
        }
    );

const saveSqliteBackupAction = (
    deps: SiteOperationsDependencies
): Promise<SerializedDatabaseBackupSaveResult> =>
    withSiteOperationReturning(
        "saveSqliteBackup",
        async () => {
            try {
                const result = await deps.services.data.saveSqliteBackup();

                if (!result.canceled) {
                    deps.setLastBackupMetadata(result.metadata);
                }

                return result;
            } catch (error: unknown) {
                deps.setLastBackupMetadata(undefined);
                const resolvedError = ensureError(error);
                logger.error("Failed to save SQLite backup:", resolvedError);
                throw resolvedError;
            }
        },
        deps,
        {
            syncAfter: false,
            telemetry: {
                success: {
                    message: "SQLite backup save completed",
                },
            },
        }
    );

const restoreSqliteBackupAction = (
    deps: SiteOperationsDependencies,
    payload: SerializedDatabaseRestorePayload
): Promise<SerializedDatabaseRestoreResult> =>
    withSiteOperationReturning(
        "restoreSqliteBackup",
        () =>
            runSqliteBackupOperationReturning({
                clearMetadataOnFailure: false,
                deps,
                errorLogMessage: "Failed to restore SQLite backup:",
                operation: () =>

                    deps.services.data.restoreSqliteBackup(payload),
            }),
        deps,
        {
            telemetry: {
                success: {
                    message: "SQLite backup restore completed",
                },
            },
        }
    );

const normalizeMonitorOrThrow = (
    monitor: Partial<Monitor>,
    contextMessage: string
): Monitor => {
    try {
        return normalizeMonitor(monitor);
    } catch (error) {
        const safeError = ensureError(error);
        logger.error(contextMessage, safeError);
        throw new Error(
            `Monitor normalization failed: ${safeError.message}`,
            { cause: error }
        );
    }
};

/**
 * Site operations actions exposed by the sites store.
 *
 * @public
 */
export interface SiteOperationsActions extends BaseSiteOperations {
    /** Initialize sites data from backend */
    initializeSites: () => Promise<{
        /** Descriptive message about the initialization result */
        message: string;
        /** Number of sites successfully loaded from backend */
        sitesLoaded: number;
        /** Whether the initialization operation completed successfully */
        success: boolean;
    }>;
    /** Modify an existing site */
    modifySite: (identifier: string, updates: Partial<Site>) => Promise<void>;
}

/**
 * Creates site operations actions for managing CRUD operations.
 *
 * @remarks
 * Factory function that creates actions for site management operations
 * including creation, modification, deletion, and monitor management. All
 * operations include proper error handling and logging.
 *
 * @param deps - Dependencies required for site operations.
 *
 * @returns Object containing all site operation action functions.
 *
 * @public
 */
export const createSiteOperationsActions = (
    deps: SiteOperationsDependencies
): SiteOperationsActions => ({
    addMonitorToSite: async (siteIdentifier, monitor): Promise<void> => {
        const savedSite = await withSiteOperationReturning(
            "addMonitorToSite",
            async () => {
                const site = getSiteByIdentifier(siteIdentifier, deps);

                const normalizedMonitor = normalizeMonitorOrThrow(
                    monitor,
                    "Failed to normalize monitor before adding to site"
                );

                const updatedMonitors = [...site.monitors, normalizedMonitor];

                return deps.services.site.updateSite(siteIdentifier, {
                    monitors: updatedMonitors,
                });
            },
            deps,
            {
                syncAfter: false,
                telemetry: { monitor, siteIdentifier },
            }
        );

        applySavedSiteToStore(savedSite, deps);
    },
    createSite: async (siteData): Promise<void> => {
        await withSiteOperation(
            "createSite",
            async () => {
                // Default to HTTP monitor if none provided
                const monitors: Monitor[] = (
                    siteData.monitors && siteData.monitors.length > 0
                        ? siteData.monitors
                        : [
                              {
                                  history: [],
                                  id: crypto.randomUUID(),
                                  monitoring: true,
                                  status: "pending" as const,
                                  type: "http" as MonitorType,
                              },
                          ]
                ).map((monitor) =>
                    normalizeMonitorOrThrow(
                        monitor,
                        "Failed to normalize monitor during site creation"
                    )
                );

                // Construct a complete Site object
                const completeSite: Site = {
                    identifier: siteData.identifier,
                    monitoring: siteData.monitoring ?? true, // Default to monitoring enabled
                    monitors,
                    name: siteData.name ?? DEFAULT_SITE_NAME,
                };

                // Preload now returns extracted data directly
                const newSite = await deps.services.site.addSite(completeSite);

                applySavedSiteToStore(newSite, deps);
            },
            deps,
            {
                syncAfter: false,
                telemetry: { siteData },
            } // Don't sync after as we're adding directly to deps
        );
    },
    deleteSite: async (identifier: string): Promise<void> => {
        await withSiteOperation(
            "deleteSite",
            async () => {
                const removed = await deps.services.site.removeSite(identifier);
                if (!removed) {
                    throw new Error(
                        `Site removal failed for ${identifier}: Backend returned false`
                    );
                }
                deps.removeSite(identifier);
            },
            deps,
            {
                syncAfter: false,
                telemetry: { identifier },
            } // Don't sync after as we're removing directly from deps
        );
    },
    downloadSqliteBackup: async (): Promise<SerializedDatabaseBackupResult> =>
        downloadSqliteBackupAction(deps),
    initializeSites: async (): Promise<{
        message: string;
        sitesLoaded: number;
        success: boolean;
    }> =>
        withSiteOperationReturning(
            "initializeSites",
            async () => {
                await deps.syncSites();
                const synchronizedSites = deps.getSites();

                return {
                    message: `Synchronized ${synchronizedSites.length} sites from backend`,
                    sitesLoaded: synchronizedSites.length,
                    success: true,
                };
            },
            deps,
            {
                syncAfter: false,
                telemetry: {
                    success: {
                        message:
                            "Renderer site initialization completed via state sync pipeline",
                    },
                },
            }
        ),
    modifySite: async (
        identifier: string,
        updates: Partial<Site>
    ): Promise<void> => {
        const savedSite = await withSiteOperationReturning(
            "modifySite",
            async () => deps.services.site.updateSite(identifier, updates),
            deps,
            {
                syncAfter: false,
                telemetry: { identifier, updates },
            }
        );

        // Persist the backend snapshot via the canonical helper so duplicate
        // identifier detection, logging, and future invariants remain
        // centralized in a single place.
        applySavedSiteToStore(savedSite, deps);
    },
    removeMonitorFromSite: async (siteIdentifier, monitorId): Promise<void> => {
        await withSiteOperation(
            "removeMonitorFromSite",
            async () => {
                const site = getSiteByIdentifier(siteIdentifier, deps);

                if (site.monitors.length <= 1) {
                    throw new Error(ERROR_CATALOG.monitors.CANNOT_REMOVE_LAST);
                }

                const savedSite = await deps.services.site.removeMonitor(
                    siteIdentifier,
                    monitorId
                );

                applySavedSiteToStore(savedSite, deps);
            },
            deps,
            {
                syncAfter: false,
                telemetry: { monitorId, siteIdentifier },
            }
        );
    },
    restoreSqliteBackup: async (
        payload: SerializedDatabaseRestorePayload
    ): Promise<SerializedDatabaseRestoreResult> =>
        restoreSqliteBackupAction(deps, payload),
    saveSqliteBackup: async (): Promise<SerializedDatabaseBackupSaveResult> =>
        saveSqliteBackupAction(deps),
    updateMonitorRetryAttempts: async (
        siteIdentifier: string,
        monitorId: string,
        retryAttempts: number | undefined
    ): Promise<void> => {
        await updateMonitorNumericField({
            deps,
            field: "retryAttempts",
            monitorId,
            operationName: "updateMonitorRetryAttempts",
            siteIdentifier,
            telemetry: { monitorId, retryAttempts, siteIdentifier },
            value: retryAttempts,
        });
    },
    updateMonitorTimeout: async (
        siteIdentifier: string,
        monitorId: string,
        timeout: number | undefined
    ): Promise<void> => {
        await updateMonitorNumericField({
            deps,
            field: "timeout",
            monitorId,
            operationName: "updateMonitorTimeout",
            siteIdentifier,
            telemetry: { monitorId, siteIdentifier, timeout },
            value: timeout,
        });
    },
    updateSiteCheckInterval: async (
        siteIdentifier: string,
        monitorId: string,
        interval: number
    ): Promise<void> => {
        await updateMonitorNumericField({
            deps,
            field: "checkInterval",
            monitorId,
            operationName: "updateSiteCheckInterval",
            siteIdentifier,
            telemetry: { interval, monitorId, siteIdentifier },
            value: interval,
        });
    },
});
