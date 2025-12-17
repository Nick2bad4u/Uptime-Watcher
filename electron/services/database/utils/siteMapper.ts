/**
 * Site database row mapping utilities.
 *
 * @remarks
 * Provides consistent data transformation between database rows and Site
 * objects with proper type safety and error handling.
 */

import type { SiteRow as DatabaseSiteRow } from "@shared/types/database";

import { isValidSiteRow as isValidDatabaseSiteRow } from "@shared/types/database";
import { ensureError } from "@shared/utils/errorHandling";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { safeStringify } from "@shared/utils/stringConversion";

import { logger } from "../../../utils/logger";

/**
 * Site type for basic operations (without monitors).
 *
 * @remarks
 * Represents a simplified site object used for database operations and mapping.
 * This interface excludes the monitors array to avoid circular dependencies and
 * focuses on core site properties.
 *
 * @public
 */
export interface SiteRow {
    /**
     * Unique identifier for the site (required). Must be a non-empty string
     * that serves as the primary key.
     */
    identifier: string;

    /**
     * Optional monitoring state for the site. When true, indicates the site is
     * actively being monitored.
     */
    monitoring?: boolean;

    /**
     * Optional human-readable name for the site. Used for display purposes in
     * the UI.
     */
    name?: string;
}

/**
 * Convert a database row to a Site object (without monitors).
 *
 * @remarks
 * Handles type conversion and ensures consistent data transformation across all
 * site-related database operations. Validates that the identifier is present
 * and valid before creating the site object.
 *
 * @param row - Raw database row to convert
 *
 * @returns Site object with validated fields
 *
 * @throws When the database row lacks a valid identifier
 *
 * @public
 */
export function rowToSite(row: DatabaseSiteRow): SiteRow {
    try {
        // Validate that we have a valid identifier
        if (!isValidDatabaseSiteRow(row)) {
            throw new Error("Invalid site row: missing or invalid identifier");
        }

        // Handle identifier (required field) - we know it's valid from
        // validation above
        const identifier = safeStringify(row.identifier);

        const site: SiteRow = {
            identifier,
        };

        // Handle optional name field
        if (row.name !== undefined) {
            site.name = safeStringify(row.name);
        }

        // Handle optional monitoring field
        if (row.monitoring !== undefined) {
            site.monitoring = Boolean(row.monitoring);
        }

        return site;
    } catch (error: unknown) {
        const normalizedError = ensureError(error);
        logger.error(LOG_TEMPLATES.errors.SITE_MAPPER_FAILED, normalizedError, {
            errorType: normalizedError.constructor.name,
            functionName: "rowToSite",
            row,
        });
        throw error;
    }
}

/**
 * Convert multiple database rows to Site objects.
 *
 * @remarks
 * Processes multiple database rows using the {@link rowToSite} function. Each
 * row is validated and converted independently. If any row fails validation,
 * the entire operation will fail.
 *
 * @param rows - Array of raw database rows
 *
 * @returns Array of mapped Site objects
 *
 * @throws When any database row lacks a valid identifier
 *
 * @public
 */
export function rowsToSites(rows: DatabaseSiteRow[]): SiteRow[] {
    return rows.map((row) => rowToSite(row));
}
