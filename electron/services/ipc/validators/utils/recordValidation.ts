import type { UnknownRecord } from "type-fest";

import { isRecord } from "@shared/utils/typeHelpers";

import type { ParameterValueValidationResult } from "./parameterValidation";

import { toValidationResult } from "./parameterValidation";

type RequiredRecordResult =
    | { readonly error: ParameterValueValidationResult; readonly ok: false }
    | { readonly ok: true; readonly record: UnknownRecord };

/**
 * Type guard for the failure branch of {@link RequiredRecordResult}.
 */
export const isRequiredRecordError = (
    result: RequiredRecordResult
): result is Extract<RequiredRecordResult, { readonly ok: false }> =>
    !result.ok;

const FORBIDDEN_RECORD_KEYS = new Set<string>([
    "__proto__",
    "constructor",
    "prototype",
]);

/**
 * Returns errors for keys that are frequently abused for prototype pollution.
 */
export function getForbiddenRecordKeyErrors(
    record: UnknownRecord,
    paramName: string
): string[] {
    const errors: string[] = [];

    for (const key of FORBIDDEN_RECORD_KEYS) {
        if (Object.hasOwn(record, key)) {
            errors.push(`${paramName} must not include reserved key '${key}'`);
        }
    }

    return errors;
}

/**
 * Ensures an IPC parameter is a record-like object and rejects reserved keys.
 */
export function requireRecordParam(
    value: unknown,
    paramName: string
): RequiredRecordResult {
    if (!isRecord(value)) {
        return {
            error: toValidationResult(`${paramName} must be a valid object`),
            ok: false,
        };
    }

    const forbiddenKeyErrors = getForbiddenRecordKeyErrors(value, paramName);
    if (forbiddenKeyErrors.length > 0) {
        return { error: forbiddenKeyErrors, ok: false };
    }

    return { ok: true, record: value };
}
