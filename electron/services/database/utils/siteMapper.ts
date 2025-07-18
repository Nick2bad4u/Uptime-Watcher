/**
 * Site database row mapping utilities.
 * Provides consistent data transformation between database rows and Site objects.
 */

import { safeStringify } from "../../../../shared/utils/stringConversion";
import { logger } from "../../../utils/logger";

/**
 * Site type for basic operations (without monitors).
 */
export interface SiteRow {
    identifier: string;
    monitoring?: boolean;
    name?: string;
}

/**
 * Validate that a row contains the minimum required fields for a site.
 *
 * @param row - Database row to validate
 * @returns True if row is valid
 *
 * @public
 */
export function isValidSiteRow(row: Record<string, unknown>): boolean {
    return row.identifier !== undefined && row.identifier !== null;
}

/**
 * Convert multiple database rows to Site objects.
 *
 * @param rows - Array of raw database rows
 * @returns Array of mapped Site objects
 *
 * @public
 */
export function rowsToSites(rows: Record<string, unknown>[]): SiteRow[] {
    return rows.map((row) => rowToSite(row));
}

/**
 * Convert a database row to a Site object (without monitors).
 *
 * @param row - Raw database row
 * @returns Mapped Site object
 *
 * @remarks
 * Handles type conversion and ensures consistent data transformation
 * across all site-related database operations.
 *
 * @public
 */
export function rowToSite(row: Record<string, unknown>): SiteRow {
    try {
        // Handle identifier (required field)
        const identifier = row.identifier;

        const site: SiteRow = {
            identifier: identifier ? safeStringify(identifier) : "",
        };

        // Handle optional name field
        if (row.name !== undefined && row.name !== null) {
            site.name = safeStringify(row.name);
        }

        // Handle optional monitoring field
        if (row.monitoring !== undefined && row.monitoring !== null) {
            site.monitoring = Boolean(row.monitoring);
        }

        return site;
    } catch (error) {
        logger.error("[SiteMapper] Failed to map database row to site", { error, row });
        throw error;
    }
}
