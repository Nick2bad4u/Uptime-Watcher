/**
 * Shared utilities for coordinated site deletion operations.
 *
 * @remarks
 * Consolidates the repository-level logic required to remove a site and all
 * related monitors inside a single transaction. Consumers provide
 * transaction-scoped adapters and optionally preloaded monitor data to avoid
 * redundant lookups when additional logging is required.
 */

import type { Site } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";

import type { MonitorRepositoryTransactionAdapter } from "./MonitorRepository";
import type { SiteRepositoryTransactionAdapter } from "./SiteRepository";

/**
 * Options for performing an atomic site deletion using transaction adapters.
 *
 * @public
 */
export interface SiteDeletionOperationOptions {
    /** Identifier of the site to remove. */
    identifier: string;
    /** Transaction-scoped monitor repository adapter. */
    monitorAdapter: MonitorRepositoryTransactionAdapter;
    /**
     * Optional monitors already fetched by the caller. When provided, the
     * helper reuses the list instead of performing an additional lookup.
     */
    preloadedMonitors?: Site["monitors"];
    /** Transaction-scoped site repository adapter. */
    siteAdapter: SiteRepositoryTransactionAdapter;
}

/**
 * Result metadata produced after removing a site within a transaction.
 *
 * @public
 */
export interface SiteDeletionOperationResult {
    /** Total number of monitors removed as part of the deletion. */
    monitorCount: number;
    /** Indicates whether the site record was deleted successfully. */
    siteDeleted: boolean;
}

/**
 * Error thrown when a transactional site deletion fails.
 *
 * @public
 */
export class SiteDeletionError extends Error {
    /** Stage of the deletion flow that triggered the failure. */
    public readonly stage: "monitors" | "site";

    public constructor(
        stage: "monitors" | "site",
        identifier: string,
        options: { cause?: unknown } = {}
    ) {
        const normalizedCause =
            options.cause === undefined
                ? undefined
                : ensureError(options.cause);
        const causeMessage =
            normalizedCause?.message ?? "Unknown site deletion cause";
        const message =
            stage === "monitors"
                ? `Failed to delete monitors for site ${identifier}: ${causeMessage}`
                : `Failed to delete site ${identifier}`;

        super(message, {
            cause: normalizedCause,
        });
        this.name = "SiteDeletionError";
        this.stage = stage;
    }
}

/**
 * Removes a site and its monitors using transaction-scoped repository adapters.
 *
 * @remarks
 * Encapsulates the canonical repository operations for site deletion so that
 * higher level services (for example, `SiteManager` and `SiteWriterService`)
 * share the same implementation. This prevents divergent logic that could
 * introduce nested transaction attempts or inconsistent cache behavior.
 *
 * @param options - Context required to execute the deletion.
 *
 * @returns Metadata describing the outcome of the deletion.
 */
export function deleteSiteWithAdapters(
    options: SiteDeletionOperationOptions
): SiteDeletionOperationResult {
    const { identifier, monitorAdapter, preloadedMonitors, siteAdapter } =
        options;

    const monitors =
        preloadedMonitors ?? monitorAdapter.findBySiteIdentifier(identifier);

    try {
        monitorAdapter.deleteBySiteIdentifier(identifier);
    } catch (error) {
        // eslint-disable-next-line ex/use-error-cause -- SiteDeletionError normalizes the provided cause internally.
        throw new SiteDeletionError("monitors", identifier, { cause: error });
    }
    const siteDeleted = siteAdapter.delete(identifier);

    return {
        monitorCount: monitors.length,
        siteDeleted,
    } satisfies SiteDeletionOperationResult;
}
