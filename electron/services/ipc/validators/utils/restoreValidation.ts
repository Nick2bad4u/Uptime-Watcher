import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";

import { IpcValidators } from "../IpcValidators";
import { collectStringSafetyErrors } from "./stringValidation";

/**
 * Options for restore buffer validation.
 *
 * @internal
 */
export interface RestoreBufferValidationOptions {
    /** Label for the payload field used in error messages. */
    readonly fieldName?: string;
    /** Maximum allowed byte size for the restore payload. */
    readonly maxBytes: number;
}

/**
 * Options for restore file name validation.
 *
 * @internal
 */
export interface RestoreFileNameValidationOptions {
    /** Maximum allowed UTF-8 byte length for the file name. */
    readonly maxBytes: number;
    /** Field name used in error messages. */
    readonly paramName?: string;
}

/**
 * Validates an IPC restore payload buffer candidate.
 *
 * @param candidate - Candidate buffer value.
 * @param options - Validation options for the payload.
 *
 * @returns Validation errors (empty when valid).
 *
 * @internal
 */
export function validateRestoreBufferCandidate(
    candidate: unknown,
    options: RestoreBufferValidationOptions
): string[] {
    const fieldName = options.fieldName ?? "payload.buffer";

    if (!(candidate instanceof ArrayBuffer)) {
        return [`${fieldName} must be an ArrayBuffer`];
    }

    if (candidate.byteLength === 0) {
        return [`${fieldName} must not be empty`];
    }

    if (candidate.byteLength > options.maxBytes) {
        return [
            `${fieldName} exceeds maximum allowed ${options.maxBytes} bytes`,
        ];
    }

    return [];
}

/**
 * Validates a restore file name candidate.
 *
 * @param candidate - Candidate file name value.
 * @param options - Validation options for the file name.
 *
 * @returns Validation errors (empty when valid).
 *
 * @internal
 */
export function validateRestoreFileNameCandidate(
    candidate: unknown,
    options: RestoreFileNameValidationOptions
): string[] {
    const paramName = options.paramName ?? "fileName";

    const requiredError = IpcValidators.requiredString(candidate, paramName);
    if (requiredError) {
        return [requiredError];
    }

    if (typeof candidate !== "string") {
        // Defensive: requiredString already enforces this.
        return [`${paramName} must be a string`];
    }

    const rawFileName = candidate;
    const fileName = rawFileName.trim();
    if (fileName.length === 0) {
        return [`${paramName} must not be blank`];
    }

    const errors: string[] = [];

    if (rawFileName !== fileName) {
        errors.push(
            `${paramName} must not have leading or trailing whitespace`
        );
    }

    errors.push(
        ...collectStringSafetyErrors(fileName, {
            forbidControlChars: {
                message: `${paramName} must not contain control characters`,
            },
            maxBytes: {
                limit: options.maxBytes,
                message: `${paramName} must not exceed ${options.maxBytes} bytes`,
            },
        })
    );

    if (fileName === "." || fileName === "..") {
        errors.push(`${paramName} must be a valid file name`);
    }

    // `fileName` is intended for UI/logging only; it should be a base name, not
    // a path.
    if (normalizePathSeparatorsToPosix(fileName).includes("/")) {
        errors.push(`${paramName} must not contain path separators`);
    }

    return errors;
}
