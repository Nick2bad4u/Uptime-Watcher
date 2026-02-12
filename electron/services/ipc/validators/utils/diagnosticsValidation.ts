import { getUtfByteLength } from "@shared/utils/utfByteLength";

import { requireRecordParamValue } from "./recordValidation";
import { validateOptionalStringPayload } from "./stringPayloadValidation";

/**
 * Options for validating payload preview data in diagnostics reports.
 *
 * @internal
 */
export interface DiagnosticsPayloadPreviewOptions {
    /** Maximum allowed UTF-8 byte length for the preview. */
    readonly maxBytes: number;
    /** Field name used in error messages. */
    readonly paramName?: string;
}

/**
 * Options for validating metadata data in diagnostics reports.
 *
 * @internal
 */
export interface DiagnosticsMetadataOptions {
    /** Maximum allowed UTF-8 byte length for serialized metadata. */
    readonly maxBytes: number;
    /** Field name used in error messages. */
    readonly paramName?: string;
}

/**
 * Validates an optional diagnostics payload preview value.
 *
 * @param value - Candidate payload preview.
 * @param options - Validation options.
 *
 * @returns Validation errors (empty when valid).
 *
 * @internal
 */
export function validateDiagnosticsPayloadPreview(
    value: unknown,
    options: DiagnosticsPayloadPreviewOptions
): string[] {
    const paramName = options.paramName ?? "payloadPreview";
    return validateOptionalStringPayload(value, {
        maxBytes: options.maxBytes,
        maxBytesMessage: `${paramName} exceeds ${options.maxBytes} bytes`,
        paramName,
    });
}

/**
 * Validates diagnostics metadata payloads.
 *
 * @param value - Candidate metadata payload.
 * @param options - Validation options.
 *
 * @returns Validation errors (empty when valid).
 *
 * @internal
 */
export function validateDiagnosticsMetadata(
    value: unknown,
    options: DiagnosticsMetadataOptions
): string[] {
    if (value === undefined) {
        return [];
    }

    const paramName = options.paramName ?? "metadata";
    const recordResult = requireRecordParamValue(value, paramName);
    if (recordResult.ok === false) {
        return [...recordResult.error];
    }

    try {
        const serialized = JSON.stringify(recordResult.record);
        if (!serialized || getUtfByteLength(serialized) > options.maxBytes) {
            return [`${paramName} exceeds ${options.maxBytes} bytes`];
        }
    } catch {
        return [`${paramName} must be serializable`];
    }

    return [];
}
