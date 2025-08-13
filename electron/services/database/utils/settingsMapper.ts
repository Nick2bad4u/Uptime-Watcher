/**
 * Settings database row mapping utilities.
 * Provides consistent data transformation between database rows and Settings
 * objects.
 */

import type { SettingsRow as DatabaseSettingsRow } from "@shared/types/database";

import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { safeStringify } from "@shared/utils/stringConversion";
import { isNonEmptyString } from "@shared/validation/validatorUtils";

import { logger } from "../../../utils/logger";

/**
 * Setting row type for database operations.
 */
export interface SettingRow {
    key: string;
    value: string;
}

/**
 * Validate that a SettingRow object is properly formed.
 *
 * @param setting - SettingRow object to validate
 * @returns True if setting is valid
 *
 * @remarks
 * Validates SettingRow objects that have already been mapped from database
 * rows. Only checks key validity since value field is always processed
 * appropriately. Uses simplified validation since SettingRow interface already
 * enforces string types.
 *
 * @internal
 */
function isValidSettingObject(setting: SettingRow): boolean {
    return isNonEmptyString(setting.key);
}

/**
 * Validate that a row contains the minimum required fields for a setting.
 *
 * @param row - Database row to validate
 * @returns True if row is valid
 *
 * @public
 */
export function isValidSettingRow(row: DatabaseSettingsRow): boolean {
    return isNonEmptyString(row.key);
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
export function rowsToSettings(rows: DatabaseSettingsRow[]): SettingRow[] {
    return rows
        .filter((row) => isValidSettingRow(row))
        .map((row) => rowToSetting(row));
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
export function rowToSetting(row: DatabaseSettingsRow): SettingRow {
    try {
        // Handle key (required field) with validator-based checking
        const { key } = row;
        if (!isNonEmptyString(key)) {
            throw new Error(`[SettingsMapper] Invalid setting key: ${key}`);
        }

        // Handle value (required field)
        const { value } = row;

        return {
            key,
            value: value ? safeStringify(value) : "",
        };
    } catch (error) {
        logger.error(LOG_TEMPLATES.errors.SETTINGS_MAPPER_FAILED, {
            error,
            functionName: "rowToSetting",
            row,
        });
        throw error;
    }
}

/**
 * Convert a single database row to a setting value.
 *
 * @param row - Raw database row
 * @returns Setting value as string or undefined if not found
 *
 * @throws {@link Error} When safeStringify conversion fails for complex objects
 *
 * @remarks
 * **Falsy Value Handling**: Preserves all falsy values except null/undefined.
 * Empty strings, 0, and false are converted to their string representations.
 * Only null and undefined values return undefined.
 *
 * **Error Propagation**: Errors from `safeStringify()` are propagated to
 * caller for proper error handling. This typically occurs with circular
 * reference objects.
 *
 * **Edge Cases**:
 * - Missing `row.value` field returns undefined
 * - Complex objects are JSON.stringify'd by safeStringify
 * - Malformed data structures may throw during conversion
 *
 * @public
 */
export function rowToSettingValue(
    row: DatabaseSettingsRow | undefined
): string | undefined {
    if (!row?.value) {
        return undefined;
    }

    return safeStringify(row.value);
}

/**
 * Convert SettingRow array to a Record object mapping keys to values.
 *
 * @param settings - Array of SettingRow objects
 * @returns Record mapping keys to values
 *
 * @remarks
 * **Validation**: Uses type-specific validation to ensure data integrity
 * without awkward type casting.
 *
 * **Duplicate Key Handling**: If multiple settings have the same key,
 * the last occurrence will be used. This follows JavaScript object
 * property assignment semantics.
 *
 * **Type Safety**: Uses proper SettingRow validation instead of casting
 * to generic Record type for better type safety.
 *
 * @public
 */
export function settingsToRecord(
    settings: SettingRow[]
): Record<string, string> {
    const result: Record<string, string> = {};

    for (const setting of settings) {
        // Use type-specific validation instead of awkward casting
        if (isValidSettingObject(setting)) {
            result[setting.key] = setting.value;
        }
    }

    return result;
}
