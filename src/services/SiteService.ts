/**
 * Service layer for handling all site-related operations. Provides a clean
 * abstraction over electron API calls for site management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. All
 * backend communication is performed via IPC and follows strict typing.
 */

import type { Site } from "@shared/types";
import type { UnknownRecord } from "type-fest";
import type * as z from "zod";

import { ApplicationError } from "@shared/utils/errorHandling";
import {
    validateSiteSnapshot,
    validateSiteSnapshots,
} from "@shared/validation/guards";

import { logger } from "./logger";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

// eslint-disable-next-line ex/no-unhandled -- Module-level initialization should fail fast when preload wiring is invalid.
const { ensureInitialized, wrap } = getIpcServiceHelpers("SiteService", {
    bridgeContracts: [
        {
            domain: "sites",
            methods: [
                "addSite",
                "deleteAllSites",
                "getSites",
                "removeMonitor",
                "removeSite",
                "updateSite",
            ],
        },
    ],
});

const logInvalidSnapshotAndThrow = (
    logMessage: string,
    error: z.ZodError<Site>,
    metadata: UnknownRecord,
    thrownMessage: string
): never => {
    logger.error(`[SiteService] ${logMessage}`, error, {
        ...metadata,
        issues: error.issues,
    });

    throw new ApplicationError({
        cause: error,
        code: "RENDERER_SERVICE_INVALID_PAYLOAD",
        details: {
            ...metadata,
            issues: error.issues,
        },
        message: `[SiteService] ${thrownMessage}`,
    });
};

/**
 * Renderer-side contract for site operations routed through the preload bridge.
 */
interface SiteServiceContract {
    readonly addSite: (site: Site) => Promise<Site>;
    readonly deleteAllSites: () => Promise<number>;
    readonly getSites: () => Promise<Site[]>;
    readonly initialize: () => Promise<void>;
    readonly removeMonitor: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<Site>;
    readonly removeSite: (identifier: string) => Promise<boolean>;
    readonly updateSite: (
        identifier: string,
        updates: Partial<Site>
    ) => Promise<Site>;
}

/**
 * Service for managing site operations through Electron IPC.
 *
 * @remarks
 * Provides a comprehensive interface for site management operations including
 * CRUD operations, data synchronization, and backup functionality with
 * automatic service initialization and type-safe IPC communication.
 *
 * @public
 */
export const SiteService: SiteServiceContract = {
    /**
     * Adds a new site to the backend.
     *
     * @example
     *
     * ```typescript
     * const newSite = await SiteService.addSite({
     *     name: "Example",
     *     url: "https://example.com",
     * });
     * ```
     *
     * @param site - The site object to add.
     *
     * @returns The newly created site object as returned by the backend.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    addSite: wrap("addSite", async (api, site: Site) => {
        const savedSite = await api.sites.addSite(site);
        const parseResult = validateSiteSnapshot(savedSite);

        if (parseResult.success) {
            return parseResult.data;
        }

        return logInvalidSnapshotAndThrow(
            "Invalid site snapshot returned after addSite",
            parseResult.error,
            {
                operation: "addSite",
                siteIdentifier: site.identifier,
            },
            `Site creation returned an invalid site snapshot for ${site.identifier}`
        );
    }),

    /**
     * Deletes all sites from the backend.
     *
     * @remarks
     * This is a destructive operation. Callers should usually prefer importing
     * or restoring a backup over wiping all sites.
     *
     * @returns The number of sites removed.
     */
    deleteAllSites: wrap("deleteAllSites", async (api) => api.sites.deleteAllSites()),

    /**
     * Retrieves all sites from the backend.
     *
     * @example
     *
     * ```typescript
     * const sites = await SiteService.getSites();
     * ```
     *
     * @returns An array of site objects.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    getSites: wrap("getSites", async (api) => {
        const rawSites = await api.sites.getSites();
        const validationResult = validateSiteSnapshots(rawSites);

        if (validationResult.status === "success") {
            return validationResult.data;
        }

        const [firstIssue] = validationResult.errors;

        if (!firstIssue) {
            throw new ApplicationError({
                code: "RENDERER_SERVICE_INVALID_PAYLOAD",
                message:
                    "[SiteService] getSites returned invalid site snapshot data (validation errors were empty)",
            });
        }

        const invalidIndices = validationResult.errors.map(
            ({ index }) => index
        );

        logger.error(
            "[SiteService] Invalid site snapshot(s) returned during getSites",
            firstIssue.error,
            {
                invalidIndices,
                issues: validationResult.errors.map(({ error, index }) => ({
                    index,
                    issues: error.issues,
                })),
            }
        );

        throw new ApplicationError({
            cause: firstIssue.error,
            code: "RENDERER_SERVICE_INVALID_PAYLOAD",
            details: {
                invalidIndices,
                issues: validationResult.errors.map(({ error, index }) => ({
                    index,
                    issues: error.issues,
                })),
            },
            message: `[SiteService] getSites returned invalid site snapshot data (indices: ${invalidIndices.join(", ")})`,
        });
    }),

    /**
     * Ensures the electron API is available before making backend calls.
     *
     * @remarks
     * This method should be called before any backend operation.
     *
     * @returns A promise that resolves when the electron API is ready.
     *
     * @throws If the electron API is not available.
     */
    initialize: ensureInitialized,

    /**
     * Removes a monitor from a site.
     *
     * @example
     *
     * ```typescript
     * const updatedSite = await SiteService.removeMonitor(
     *     "site123",
     *     "monitor456"
     * );
     * ```
     *
     * @param siteIdentifier - The identifier of the site.
     * @param monitorId - The identifier of the monitor to remove.
     *
     * @returns A promise resolving to the updated {@link Site} record for the
     *   specified site.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    removeMonitor: wrap(
        "removeMonitor",
        async (api, siteIdentifier: string, monitorId: string) => {
            const savedSite = await api.sites.removeMonitor(
                siteIdentifier,
                monitorId
            );
            const parseResult = validateSiteSnapshot(savedSite);

            if (parseResult.success) {
                return parseResult.data;
            }

            return logInvalidSnapshotAndThrow(
                "Invalid site snapshot returned after monitor removal",
                parseResult.error,
                {
                    monitorId,
                    operation: "removeMonitor",
                    siteIdentifier,
                },
                `Monitor removal returned an invalid site snapshot for ${siteIdentifier}/${monitorId}`
            );
        }
    ),

    /**
     * Removes a site from the backend.
     *
     * @example
     *
     * ```typescript
     * await SiteService.removeSite("site123");
     * ```
     *
     * @param identifier - The identifier of the site to remove.
     *
     * @returns A promise resolving to true when the site is removed.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    removeSite: wrap("removeSite", async (api, identifier: string) => {
        const removed = await api.sites.removeSite(identifier);

        if (!removed) {
            throw new ApplicationError({
                code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
                details: {
                    identifier,
                    operation: "removeSite",
                    serviceName: "SiteService",
                },
                message: `[SiteService] Site removal failed for site ${identifier}: backend returned false`,
            });
        }

        return true;
    }),

    /**
     * Updates an existing site with the provided changes.
     *
     * @example
     *
     * ```typescript
     * await SiteService.updateSite("site123", { name: "New Name" });
     * ```
     *
     * @param identifier - The identifier of the site to update.
     * @param updates - Partial site object containing fields to update.
     *
     * @returns The updated {@link Site} instance returned by the backend.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    updateSite: wrap(
        "updateSite",
        async (api, identifier: string, updates: Partial<Site>) => {
            const updatedSite = await api.sites.updateSite(identifier, updates);
            const parseResult = validateSiteSnapshot(updatedSite);

            if (parseResult.success) {
                return parseResult.data;
            }

            return logInvalidSnapshotAndThrow(
                "Invalid site snapshot returned after updateSite",
                parseResult.error,
                {
                    operation: "updateSite",
                    siteIdentifier: identifier,
                    updates,
                },
                `Site update returned an invalid site snapshot for ${identifier}`
            );
        }
    ),
};
