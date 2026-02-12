import { getUtfByteLength } from "@shared/utils/utfByteLength";

import { IpcValidators } from "../IpcValidators";

/**
 * Options for validating a required string payload with a byte budget.
 *
 * @internal
 */
export interface StringPayloadValidationOptions {
    /** Maximum allowed UTF-8 byte length for the payload. */
    readonly maxBytes: number;
    /** Error message when the payload exceeds the byte budget. */
    readonly maxBytesMessage: string;
    /** The IPC parameter name used in error messages. */
    readonly paramName: string;
    /** Optional override for the "must be a string" error message. */
    readonly stringTypeMessage?: string;
}

/**
 * Options for validating an optional string payload with a byte budget.
 *
 * @internal
 */
export interface OptionalStringPayloadValidationOptions {
    /** Maximum allowed UTF-8 byte length for the payload. */
    readonly maxBytes: number;
    /** Error message when the payload exceeds the byte budget. */
    readonly maxBytesMessage: string;
    /** The IPC parameter name used in error messages. */
    readonly paramName: string;
}

/**
 * Validates a required string payload against a byte budget.
 *
 * @param value - Candidate payload value.
 * @param options - Validation options.
 *
 * @returns Validation errors (empty when valid).
 *
 * @internal
 */
export function validateRequiredStringPayload(
    value: unknown,
    options: StringPayloadValidationOptions
): string[] {
    const requiredError = IpcValidators.requiredString(
        value,
        options.paramName
    );
    if (requiredError) {
        return [requiredError];
    }

    if (typeof value !== "string") {
        // Defensive: requiredString already enforces this.
        return [
            options.stringTypeMessage ??
                `${options.paramName} must be a string`,
        ];
    }

    if (getUtfByteLength(value) > options.maxBytes) {
        return [options.maxBytesMessage];
    }

    return [];
}

/**
 * Validates an optional string payload against a byte budget.
 *
 * @param value - Candidate payload value.
 * @param options - Validation options.
 *
 * @returns Validation errors (empty when valid).
 *
 * @internal
 */
export function validateOptionalStringPayload(
    value: unknown,
    options: OptionalStringPayloadValidationOptions
): string[] {
    const optionalError = IpcValidators.optionalString(value, options.paramName);
    if (optionalError) {
        return [optionalError];
    }

    if (typeof value === "string" && getUtfByteLength(value) > options.maxBytes) {
        return [options.maxBytesMessage];
    }

    return [];
}
