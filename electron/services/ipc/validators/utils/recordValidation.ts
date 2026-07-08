import type { UnknownRecord } from "type-fest";

import {
    createNullPrototypeObject,
    defineOwnEnumerableDataProperties,
} from "@shared/utils/objectSafety";
import { isPlainRecord } from "@shared/utils/typeHelpers";
import { objectHasOwn } from "ts-extras";

import type { ParameterValueValidationResult } from "./parameterValidation";

import { toValidationResult } from "./parameterValidation";

type RequiredRecordResult =
    | { readonly error: ParameterValueValidationResult; readonly ok: false }
    | { readonly ok: true; readonly record: UnknownRecord };

/**
 * Type guard for the failure branch of {@link RequiredRecordResult}.
 */
const isRequiredRecordError = (
    result: RequiredRecordResult
): result is Extract<RequiredRecordResult, { readonly ok: false }> =>
    !result.ok;

/**
 * Result returned by {@link requireRecordParamValue}.
 *
 * @internal
 */
export type RecordParamValueResult =
    | { readonly error: readonly string[]; readonly ok: false }
    | { readonly ok: true; readonly record: UnknownRecord };

const FORBIDDEN_RECORD_KEYS = new Set<string>([
    "__proto__",
    "constructor",
    "prototype",
]);

function copyOwnEnumerableDataRecord(
    record: UnknownRecord
): UnknownRecord | undefined {
    try {
        const safeRecord = createNullPrototypeObject<UnknownRecord>();
        defineOwnEnumerableDataProperties(safeRecord, record);
        return safeRecord;
    } catch {
        return undefined;
    }
}

/**
 * Returns errors for keys that are frequently abused for prototype pollution.
 */
function getForbiddenRecordKeyErrors(
    record: UnknownRecord,
    paramName: string
): string[] {
    const errors: string[] = [];

    for (const key of FORBIDDEN_RECORD_KEYS) {
        if (objectHasOwn(record, key)) {
            errors.push(`${paramName} must not include reserved key '${key}'`);
        }
    }

    return errors;
}

/**
 * Ensures an IPC parameter is a record-like object and rejects reserved keys.
 */
function requireRecordParam(
    value: unknown,
    paramName: string
): RequiredRecordResult {
    if (!isPlainRecord(value)) {
        return {
            error: toValidationResult(`${paramName} must be a valid object`),
            ok: false,
        };
    }

    const forbiddenKeyErrors = getForbiddenRecordKeyErrors(value, paramName);
    if (forbiddenKeyErrors.length > 0) {
        return { error: forbiddenKeyErrors, ok: false };
    }

    const record = copyOwnEnumerableDataRecord(value);
    if (!record) {
        return {
            error: toValidationResult(`${paramName} must be a valid object`),
            ok: false,
        };
    }

    return { ok: true, record };
}

/**
 * Returns a record when valid, or an error array when invalid.
 *
 * @remarks
 * This helper provides a compact alternative to the common `requireRecordParam`
 *
 * - `isRequiredRecordError` pattern in IPC validators.
 *
 * @param value - Candidate record value.
 * @param paramName - Parameter name used in error messages.
 *
 * @returns The normalized record or an array of validation errors.
 *
 * @internal
 */
export function requireRecordParamValue(
    value: unknown,
    paramName: string
): RecordParamValueResult {
    const result = requireRecordParam(value, paramName);

    if (isRequiredRecordError(result)) {
        return {
            error: result.error ?? [`${paramName} must be a valid object`],
            ok: false,
        };
    }

    return { ok: true, record: result.record };
}
