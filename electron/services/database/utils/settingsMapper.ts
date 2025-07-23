/**
 * Settings database row mapping utilities.
 * Provides consistent data transformation between database rows and Settings objects.
 */

import { safeStringify } from "../../../../shared/utils/stringConversion";
import { logger } from "../../../utils/logger";

/**
 * Setting row type for database operations.
 */
export interface SettingRow {
    key: string;
    value: string;
}

/**
 * Validate that a row contains the minimum required fields for a setting.
 *
 * @param row - Database row to validate
 * @returns True if row is valid
 *
 * @public
 */
export function isValidSettingRow(row: Record<string, unknown>): boolean {
    return row.key !== undefined && row.key !== null && typeof row.key === "string" && row.key.length > 0;
}

/**
 * Convert multiple database rows to SettingRow objects.
 *
 * @param rows - Array of raw database rows
 * @returns Array of mapped SettingRow objects
 *
 * @remarks
 * Filters out invalid rows using isValidSettingRow before mapping to prevent
 * creation of settings with empty keys or invalid data.
 *
 * @public
 */
export function rowsToSettings(rows: Record<string, unknown>[]): SettingRow[] {
    return rows.filter((row) => isValidSettingRow(row)).map((row) => rowToSetting(row));
}

/**
 * Convert a database row to a SettingRow object.
 *
 * @param row - Raw database row
 * @returns Mapped SettingRow object
 *
 * @throws {@link Error} When row has invalid key
 *
 * @remarks
 * Handles type conversion and ensures consistent data transformation
 * across all settings-related database operations. Uses precise type checking
 * instead of loose falsy checks for better type safety.
 *
 * @public
 */
export function rowToSetting(row: Record<string, unknown>): SettingRow {
    try {
        // Handle key (required field) with precise type checking
        const key = row.key;
        if (key == null || typeof key !== "string" || key.length === 0) {
            throw new Error(`[SettingsMapper] Invalid setting key: ${key}`);
        }

        // Handle value (required field)
        const value = row.value;

        const setting: SettingRow = {
            key,
            value: value !== undefined && value !== null ? safeStringify(value) : "",
        };

        return setting;
    } catch (error) {
        logger.error("[SettingsMapper] Failed to map database row to setting", { error, row });
        throw error;
    }
}

/**
 * Convert a single database row to a setting value.
 *
 * @param row - Raw database row
 * @returns Setting value as string or undefined if not found
 *
 * @remarks
 * **Falsy Value Handling**: Preserves all falsy values except null/undefined.
 * Empty strings, 0, and false are converted to their string representations.
 * Only null and undefined values return undefined.
 *
 * @public
 */
export function rowToSettingValue(row: Record<string, unknown> | undefined): string | undefined {
    if (row?.value == null) {
        return undefined;
    }

    const value = safeStringify(row.value);
    return value;
}

/**
 * Convert SettingRow array to a Record object mapping keys to values.
 *
 * @param settings - Array of SettingRow objects
 * @returns Record mapping keys to values
 *
 * @remarks
 * Uses isValidSettingRow for consistent validation logic.
 * Only includes settings that pass validation to ensure data integrity.
 *
 * @public
 */
export function settingsToRecord(settings: SettingRow[]): Record<string, string> {
    const result: Record<string, string> = {};

    for (const setting of settings) {
        // Reuse existing validation logic for consistency
        if (isValidSettingRow(setting as unknown as Record<string, unknown>)) {
            result[setting.key] = setting.value;
        }
    }

    return result;
}
