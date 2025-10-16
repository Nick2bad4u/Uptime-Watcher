/**
 * Common helper functions for site operations to eliminate code duplication.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { UnknownRecord } from "type-fest";

import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";

import type { SiteOperationsDependencies } from "../types";

import { logger } from "../../../services/logger";
import { logStoreAction } from "../../utils";
import { createStoreErrorHandler } from "../../utils/storeErrorHandling";
import { updateMonitorInSite } from "./monitorOperations";

type OperationStage = "failure" | "pending" | "success";

/**
 * Stage-specific telemetry configuration for store operation logging.
 */
export interface OperationTelemetryConfig {
    /** Metadata merged into every log entry regardless of stage. */
    base?: UnknownRecord;
    /** Additional metadata for failure log entries only. */
    failure?: UnknownRecord;
    /** Additional metadata for pending log entries only. */
    pending?: UnknownRecord;
    /** Additional metadata for success log entries only. */
    success?: UnknownRecord;
}

type OperationTelemetryInput =
    | OperationTelemetryConfig
    | undefined
    | UnknownRecord;

interface NormalizedTelemetry {
    readonly base: UnknownRecord;
    readonly failure: UnknownRecord;
    readonly pending: UnknownRecord;
    readonly success: UnknownRecord;
}

export interface SiteOperationOptions {
    readonly syncAfter?: boolean;
    readonly telemetry?: OperationTelemetryInput;
}
const TELEMETRY_CONFIG_KEYS = [
    "base",
    "failure",
    "pending",
    "success",
] as const;

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isTelemetryConfig = (
    value: unknown
): value is OperationTelemetryConfig => {
    if (!isPlainRecord(value)) {
        return false;
    }

    return TELEMETRY_CONFIG_KEYS.some((key) => key in value);
};

const normalizeTelemetry = (
    input: OperationTelemetryInput
): NormalizedTelemetry => {
    if (!input) {
        return {
            base: {},
            failure: {},
            pending: {},
            success: {},
        } satisfies NormalizedTelemetry;
    }

    if (isTelemetryConfig(input)) {
        return {
            base: input.base ? { ...input.base } : {},
            failure: input.failure ? { ...input.failure } : {},
            pending: input.pending ? { ...input.pending } : {},
            success: input.success ? { ...input.success } : {},
        } satisfies NormalizedTelemetry;
    }

    return {
        base: { ...input },
        failure: {},
        pending: {},
        success: {},
    } satisfies NormalizedTelemetry;
};

const selectStageMetadata = (
    stage: OperationStage,
    telemetry: NormalizedTelemetry
): UnknownRecord => {
    if (stage === "failure") {
        return telemetry.failure;
    }

    if (stage === "success") {
        return telemetry.success;
    }

    return telemetry.pending;
};

const createTelemetryEmitter =
    (operationName: string, telemetry: NormalizedTelemetry) =>
    (stage: OperationStage, additional: UnknownRecord): void => {
        const payload: Record<string, unknown> = {
            ...telemetry.base,
            ...selectStageMetadata(stage, telemetry),
            ...additional,
        };

        if (stage === "success") {
            payload["success"] ??= true;
        } else if (stage === "failure") {
            payload["success"] = false;
        } else if ("success" in payload) {
            delete payload["success"];
        }

        logStoreAction("SitesStore", operationName, payload);
    };

const runSiteOperation = async <T>(
    operationName: string,
    operation: () => Promise<T>,
    deps: SiteOperationsDependencies,
    options?: SiteOperationOptions
): Promise<T> => {
    const { syncAfter = true, telemetry: telemetryInput } = options ?? {};
    const telemetry = normalizeTelemetry(telemetryInput);
    const emitTelemetry = createTelemetryEmitter(operationName, telemetry);
    let pendingEmitted = false;
    let failureEmitted = false;

    const ensurePendingEmission = (): void => {
        if (pendingEmitted) {
            return;
        }

        pendingEmitted = true;
        emitTelemetry("pending", { status: "pending" });
    };

    const emitFailure = (cause: unknown): void => {
        if (failureEmitted) {
            return;
        }

        failureEmitted = true;
        const normalizedError = ensureError(cause);
        emitTelemetry("failure", {
            error: normalizedError.message,
            status: "failure",
        });
    };

    ensurePendingEmission();

    try {
        return await withErrorHandling(
            async () => {
                ensurePendingEmission();

                try {
                    const result = await operation();
                    if (syncAfter) {
                        await deps.syncSites();
                    }
                    emitTelemetry("success", {
                        resultType: typeof result,
                        status: "success",
                    });
                    return result;
                } catch (error: unknown) {
                    emitFailure(error);
                    throw error;
                }
            },
            createStoreErrorHandler("sites-operations", operationName)
        );
    } catch (error: unknown) {
        emitFailure(error);
        throw error;
    }
};

/**
 * Gets a site by identifier and validates it exists. Common pattern used across
 * multiple site operations.
 *
 * @param siteIdentifier - The site identifier.
 * @param deps - Site operation dependencies.
 *
 * @returns The found site.
 *
 * @throws Error if site is not found.
 *
 * @public
 */
export const getSiteByIdentifier = (
    siteIdentifier: string,
    deps: SiteOperationsDependencies
): Site => {
    const sites = deps.getSites() as Array<null | Site | undefined>;
    const site = sites.find((s) => s?.identifier === siteIdentifier);
    if (!site) {
        throw new Error(ERROR_CATALOG.sites.NOT_FOUND as string);
    }
    return site;
};

/**
 * Applies a backend-sourced site snapshot to the local store state.
 *
 * @param savedSite - Site instance returned by the backend after a mutation.
 * @param deps - Site operation dependencies used to read and write store state.
 */
export const applySavedSiteToStore = (
    savedSite: Site,
    deps: SiteOperationsDependencies
): void => {
    const currentSites = deps.getSites();
    const hasExistingSite = currentSites.some(
        (existingSite) => existingSite.identifier === savedSite.identifier
    );

    const nextSites = hasExistingSite
        ? currentSites.map((existingSite) =>
              existingSite.identifier === savedSite.identifier
                  ? savedSite
                  : existingSite
          )
        : [...currentSites, savedSite];

    deps.setSites(nextSites);
};

/**
 * Updates a monitor within a site and saves it. Common pattern for monitor
 * update operations.
 *
 * @param siteIdentifier - The site identifier.
 * @param monitorId - The monitor identifier.
 * @param updates - Monitor updates to apply.
 * @param deps - Site operation dependencies.
 *
 * @returns Promise that resolves when the monitor update completes.
 *
 * @public
 */
export const updateMonitorAndSave = async (
    siteIdentifier: string,
    monitorId: string,
    updates: Partial<Site["monitors"][0]>,
    deps: SiteOperationsDependencies
): Promise<void> => {
    try {
        const site = getSiteByIdentifier(siteIdentifier, deps);
        const updatedSite = updateMonitorInSite(site, monitorId, updates);
        const savedSite = await deps.services.site.updateSite(siteIdentifier, {
            monitors: updatedSite.monitors,
        });

        applySavedSiteToStore(savedSite, deps);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes(ERROR_CATALOG.sites.NOT_FOUND as string)
        ) {
            logger.error(
                `Failed to find site with identifier ${siteIdentifier}:`,
                error
            );
            throw new Error(`Site not found: ${siteIdentifier}`, {
                cause: error,
            });
        }
        // Re-throw other errors
        throw error;
    }
};

/**
 * Wraps a site operation with consistent logging, error handling, and optional
 * sync. Eliminates duplication of the common pattern used across all site
 * operations.
 *
 * @param operationName - Name of the operation for logging and error handling.
 * @param operation - The async operation to execute.
 * @param deps - Site operation dependencies.
 * @param options - Optional execution settings including telemetry metadata and
 *   sync toggle.
 *
 * @returns Promise that resolves when operation and optional sync complete.
 *
 * @public
 */
export const withSiteOperation = async (
    operationName: string,
    operation: () => Promise<void>,
    deps: SiteOperationsDependencies,
    options?: SiteOperationOptions
): Promise<void> => {
    await runSiteOperation(operationName, operation, deps, options);
};

/**
 * Wraps a site operation with consistent logging, error handling, and optional
 * sync. This version supports operations that return a value.
 *
 * @param operationName - Name of the operation for logging and error handling.
 * @param operation - The async operation to execute that returns a value.
 * @param deps - Site operation dependencies.
 * @param options - Optional execution settings including telemetry metadata and
 *   sync toggle.
 *
 * @returns Promise that resolves to the operation result.
 *
 * @public
 */
export const withSiteOperationReturning = async <T>(
    operationName: string,
    operation: () => Promise<T>,
    deps: SiteOperationsDependencies,
    options?: SiteOperationOptions
): Promise<T> => runSiteOperation(operationName, operation, deps, options);
