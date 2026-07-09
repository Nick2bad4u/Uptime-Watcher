/**
 * Service layer for handling all site-related operations. Provides a clean
 * abstraction over electron API calls for site management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. All
 * backend communication is performed via IPC and follows strict typing.
 */

import type { Site } from "@shared/types";
import type { ZodIssueLike } from "@shared/utils/zodIssueFormatting";
import type { UnknownRecord } from "type-fest";
import type * as z from "zod";

import { ApplicationError, ensureError } from "@shared/utils/errorHandling";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import {
    validateSiteSnapshot,
    validateSiteSnapshots,
    validateSiteUpdate,
} from "@shared/validation/guards";
import { monitorIdSchema } from "@shared/validation/monitorFieldSchemas";
import { siteIdentifierSchema } from "@shared/validation/siteFieldSchemas";
import {
    arrayFirst,
    arrayJoin,
    isEmpty,
    isSafeInteger,
    objectKeys,
} from "ts-extras";

import { logger } from "./logger";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";
import { parseServiceBooleanResponse } from "./utils/validation";

type IpcServiceHelpers = ReturnType<typeof getIpcServiceHelpers>;

interface SiteUpdatePayload {
    readonly monitoring?: Site["monitoring"] | undefined;
    readonly monitors?: Site["monitors"] | undefined;
    readonly name?: Site["name"] | undefined;
}

const { ensureInitialized, wrap } = ((): IpcServiceHelpers => {
    try {
        return getIpcServiceHelpers("SiteService", {
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
    } catch (error) {
        throw ensureError(error);
    }
})();

const logInvalidSnapshotAndThrow = (
    logMessage: string,
    error: z.ZodError<Site>,
    metadata: UnknownRecord,
    thrownMessage: string
): never => {
    const errorContext = {
        ...metadata,
        issues: error.issues,
    };
    const logContext = {
        ...errorContext,
        reason: logMessage,
    };

    logger.error("[SiteService] Invalid site snapshot", error, logContext);

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

const parseDeletedSiteCount = (value: unknown): number => {
    if (typeof value === "number" && isSafeInteger(value) && value >= 0) {
        return value;
    }

    throw new ApplicationError({
        code: "RENDERER_SERVICE_INVALID_PAYLOAD",
        details: {
            operation: "deleteAllSites",
            receivedType: typeof value,
            serviceName: "SiteService",
        },
        message: "[SiteService] deleteAllSites returned invalid deletion count",
    });
};

const formatValidationIssues = (issues: readonly ZodIssueLike[]): string =>
    arrayJoin(formatZodIssues(issues), ", ");

const parseSiteIdentifier = (operation: string, value: string): string => {
    const parsed = siteIdentifierSchema.safeParse(value);

    if (parsed.success) {
        return parsed.data;
    }

    throw new TypeError(
        `[SiteService] Invalid site identifier for ${operation}: ${formatValidationIssues(parsed.error.issues)}`
    );
};

const parseMonitorId = (operation: string, value: string): string => {
    const parsed = monitorIdSchema.safeParse(value);

    if (parsed.success) {
        return parsed.data;
    }

    throw new TypeError(
        `[SiteService] Invalid monitor ID for ${operation}: ${formatValidationIssues(parsed.error.issues)}`
    );
};

const parseSitePayload = (operation: string, value: Site): Site => {
    const parsed = validateSiteSnapshot(value);

    if (parsed.success) {
        return parsed.data;
    }

    throw new TypeError(
        `[SiteService] Invalid site payload for ${operation}: ${formatValidationIssues(parsed.error.issues)}`
    );
};

const omitUndefinedSiteUpdateFields = (
    updates: SiteUpdatePayload
): Partial<Site> => ({
    ...(updates.monitoring !== undefined && {
        monitoring: updates.monitoring,
    }),
    ...(updates.monitors !== undefined && { monitors: updates.monitors }),
    ...(updates.name !== undefined && { name: updates.name }),
});

const parseSiteUpdates = (
    operation: string,
    updates: Partial<Site>
): Partial<Site> => {
    if (isEmpty(objectKeys(updates))) {
        throw new TypeError(
            `[SiteService] Invalid site updates for ${operation}: updates must not be empty`
        );
    }

    const parsed = validateSiteUpdate(updates);

    if (parsed.success) {
        const normalizedUpdates = omitUndefinedSiteUpdateFields(parsed.data);

        if (isEmpty(objectKeys(normalizedUpdates))) {
            throw new TypeError(
                `[SiteService] Invalid site updates for ${operation}: updates must not be empty`
            );
        }

        return normalizedUpdates;
    }

    throw new TypeError(
        `[SiteService] Invalid site updates for ${operation}: ${formatValidationIssues(parsed.error.issues)}`
    );
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
        const parsedSite = parseSitePayload("addSite", site);
        const savedSite = await api.sites.addSite(parsedSite);
        const parseResult = validateSiteSnapshot(savedSite);

        if (parseResult.success) {
            return parseResult.data;
        }

        return logInvalidSnapshotAndThrow(
            "Invalid site snapshot returned after addSite",
            parseResult.error,
            {
                operation: "addSite",
                siteIdentifier: parsedSite.identifier,
            },
            `Site creation returned an invalid site snapshot for ${parsedSite.identifier}`
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
    deleteAllSites: wrap("deleteAllSites", async (api) =>
        parseDeletedSiteCount(await api.sites.deleteAllSites())
    ),

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

        if (validationResult.success) {
            return validationResult.data;
        }

        const { issues } = validationResult.error;
        const invalidIndices = [
            ...new Set(
                issues
                    .map((issue) => arrayFirst(issue.path))
                    .filter(
                        (value): value is number => typeof value === "number"
                    )
            ),
        ].toSorted((a, b) => a - b);

        if (isEmpty(issues)) {
            throw new ApplicationError({
                cause: validationResult.error,
                code: "RENDERER_SERVICE_INVALID_PAYLOAD",
                message:
                    "[SiteService] getSites returned invalid site snapshot data (Zod issues were empty)",
            });
        }

        const validationContext = {
            invalidIndices,
            issues,
        };

        logger.error(
            "[SiteService] Invalid site snapshot(s) returned during getSites",
            validationResult.error,
            validationContext
        );

        throw new ApplicationError({
            cause: validationResult.error,
            code: "RENDERER_SERVICE_INVALID_PAYLOAD",
            details: {
                invalidIndices,
                issues,
            },
            message: isEmpty(invalidIndices)
                ? "[SiteService] getSites returned invalid site snapshot data"
                : `[SiteService] getSites returned invalid site snapshot data (indices: ${arrayJoin(invalidIndices, ", ")})`,
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
            const parsedSiteIdentifier = parseSiteIdentifier(
                "removeMonitor",
                siteIdentifier
            );
            const parsedMonitorId = parseMonitorId("removeMonitor", monitorId);
            const savedSite = await api.sites.removeMonitor(
                parsedSiteIdentifier,
                parsedMonitorId
            );
            const parseResult = validateSiteSnapshot(savedSite);

            if (parseResult.success) {
                return parseResult.data;
            }

            return logInvalidSnapshotAndThrow(
                "Invalid site snapshot returned after monitor removal",
                parseResult.error,
                {
                    monitorId: parsedMonitorId,
                    operation: "removeMonitor",
                    siteIdentifier: parsedSiteIdentifier,
                },
                `Monitor removal returned an invalid site snapshot for ${parsedSiteIdentifier}/${parsedMonitorId}`
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
        const parsedIdentifier = parseSiteIdentifier("removeSite", identifier);
        const isRemoved = parseServiceBooleanResponse(
            "removeSite",
            await api.sites.removeSite(parsedIdentifier),
            {
                details: { identifier: parsedIdentifier },
                serviceName: "SiteService",
            }
        );

        if (!isRemoved) {
            throw new ApplicationError({
                code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
                details: {
                    identifier: parsedIdentifier,
                    operation: "removeSite",
                    serviceName: "SiteService",
                },
                message: `[SiteService] Site removal failed for site ${parsedIdentifier}: backend returned false`,
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
            const parsedIdentifier = parseSiteIdentifier(
                "updateSite",
                identifier
            );
            const parsedUpdates = parseSiteUpdates("updateSite", updates);
            const updatedSite = await api.sites.updateSite(
                parsedIdentifier,
                parsedUpdates
            );
            const parseResult = validateSiteSnapshot(updatedSite);

            if (parseResult.success) {
                return parseResult.data;
            }

            return logInvalidSnapshotAndThrow(
                "Invalid site snapshot returned after updateSite",
                parseResult.error,
                {
                    operation: "updateSite",
                    siteIdentifier: parsedIdentifier,
                    updates: parsedUpdates,
                },
                `Site update returned an invalid site snapshot for ${parsedIdentifier}`
            );
        }
    ),
};
