/**
 * Settings database row mapping utilities.
 * Provides consistent data transformation between database rows and Settings objects.
 */

import { logger } from "../../../utils/logger";

/**
 * Setting row type for database operations.
 */
export interface SettingRow {
    key: string;
    value: string;
}

/**
 * Convert a database row to a SettingRow object.
 *
 * @param row - Raw database row
 * @returns Mapped SettingRow object
 *
 * @remarks
 * Handles type conversion and ensures consistent data transformation
 * across all settings-related database operations.
 *
 * @public
 */
export function rowToSetting(row: Record<string, unknown>): SettingRow {
    try {
        // Handle key (required field)
        const key = row.key;
        if (!key || typeof key !== "string") {
            logger.warn("[SettingsMapper] Invalid or missing key in database row", { row });
            return {
                key: "",
                value: "",
            };
        }

        // Handle value (required field)
        const value = row.value;

        const setting: SettingRow = {
            key,
            value: value !== undefined && value !== null ? String(value) : "",
        };

        return setting;
    } catch (error) {
        logger.error("[SettingsMapper] Failed to map database row to setting", { row, error });
        throw error;
    }
}

/**
 * Convert multiple database rows to SettingRow objects.
 *
 * @param rows - Array of raw database rows
 * @returns Array of mapped SettingRow objects
 *
 * @public
 */
export function rowsToSettings(rows: Record<string, unknown>[]): SettingRow[] {
    return rows.map((row) => rowToSetting(row));
}

/**
 * Convert SettingRow array to a Record\<string, string\> object.
 *
 * @param settings - Array of SettingRow objects
 * @returns Record mapping keys to values
 *
 * @public
 */
export function settingsToRecord(settings: SettingRow[]): Record<string, string> {
    const result: Record<string, string> = {};

    for (const setting of settings) {
        // Only include valid string keys
        if (typeof setting.key === "string" && setting.key.length > 0) {
            result[setting.key] = setting.value;
        }
    }

    return result;
}

/**
 * Convert a single database row to a setting value.
 *
 * @param row - Raw database row
 * @returns Setting value as string or undefined if not found
 *
 * @public
 */
export function rowToSettingValue(row: Record<string, unknown> | undefined): string | undefined {
    if (!row?.value) {
        return undefined;
    }

    const value = String(row.value);
    return value.length > 0 ? value : undefined;
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
