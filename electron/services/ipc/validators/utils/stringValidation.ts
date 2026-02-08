import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { getUtfByteLength } from "@shared/utils/utfByteLength";

import { IpcValidators } from "../IpcValidators";

/**
 * Rules for validating string safety constraints.
 *
 * @internal
 */
export interface StringSafetyValidationRules {
    /** Optional ASCII control character guard. */
    readonly forbidControlChars?: {
        readonly message: string;
    };
    /** Optional byte-length constraint. */
    readonly maxBytes?: {
        readonly limit: number;
        readonly message: string;
    };
}

/**
 * Collects validation errors for common string safety constraints.
 *
 * @param value - String value to validate.
 * @param rules - Validation rules describing limits and error messages.
 *
 * @returns Array of error messages (empty when valid).
 *
 * @internal
 */
export function collectStringSafetyErrors(
    value: string,
    rules: StringSafetyValidationRules
): string[] {
    const errors: string[] = [];

    if (rules.maxBytes && getUtfByteLength(value) > rules.maxBytes.limit) {
        errors.push(rules.maxBytes.message);
    }

    if (rules.forbidControlChars && hasAsciiControlCharacters(value)) {
        errors.push(rules.forbidControlChars.message);
    }

    return errors;
}

/**
 * Result returned by {@link requireStringParamValue}.
 */
export type StringParamValueResult =
    | { readonly error: readonly string[]; readonly ok: false }
    | { readonly ok: true; readonly value: string };

/**
 * Ensures an IPC parameter is a string and returns the normalized value.
 */
export function requireStringParamValue(
    value: unknown,
    paramName: string
): StringParamValueResult {
    const requiredError = IpcValidators.requiredString(value, paramName);
    if (requiredError) {
        return { error: [requiredError], ok: false };
    }

    if (typeof value !== "string") {
        return { error: [`${paramName} must be a string`], ok: false };
    }

    return { ok: true, value };
}
