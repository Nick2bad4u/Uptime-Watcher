import type { ParameterValueValidationResult } from "./parameterValidation";

import { IpcValidators } from "../IpcValidators";
import {
    validateDiagnosticsMetadata,
    validateDiagnosticsPayloadPreview,
} from "./diagnosticsValidation";
import { requireRecordParamValue } from "./recordValidation";
import {
    validateOptionalStringPayload,
    validateRequiredStringPayload,
} from "./stringPayloadValidation";

/**
 * Options for validating preload guard reports.
 *
 * @internal
 */
export interface GuardReportValidationOptions {
    /** Maximum allowed UTF-8 byte length for the channel identifier. */
    readonly maxChannelBytes: number;
    /** Maximum allowed UTF-8 byte length for the guard identifier. */
    readonly maxGuardBytes: number;
    /** Maximum allowed UTF-8 byte length for serialized metadata. */
    readonly maxMetadataBytes: number;
    /** Maximum allowed UTF-8 byte length for payload preview text. */
    readonly maxPayloadPreviewBytes: number;
    /** Maximum allowed UTF-8 byte length for the optional reason. */
    readonly maxReasonBytes: number;
}

/**
 * Validates a preload guard report payload.
 *
 * @param value - Candidate guard report payload.
 * @param options - Validation options for payload preview and metadata limits.
 *
 * @returns Validation errors (empty when valid).
 *
 * @internal
 */
export function validateGuardReportPayload(
    value: unknown,
    options: GuardReportValidationOptions
): ParameterValueValidationResult {
    const recordResult = requireRecordParamValue(value, "guardReport");
    if (!recordResult.ok) {
        return recordResult.error;
    }

    const { record } = recordResult;
    const timestampError = IpcValidators.requiredNumber(
        record["timestamp"],
        "timestamp"
    );
    const errors = [
        ...validateRequiredStringPayload(record["channel"], {
            maxBytes: options.maxChannelBytes,
            maxBytesMessage: `channel exceeds ${options.maxChannelBytes} bytes`,
            paramName: "channel",
        }),
        ...validateRequiredStringPayload(record["guard"], {
            maxBytes: options.maxGuardBytes,
            maxBytesMessage: `guard exceeds ${options.maxGuardBytes} bytes`,
            paramName: "guard",
        }),
        ...validateOptionalStringPayload(record["reason"], {
            maxBytes: options.maxReasonBytes,
            maxBytesMessage: `reason exceeds ${options.maxReasonBytes} bytes`,
            paramName: "reason",
        }),
        ...validateDiagnosticsPayloadPreview(record["payloadPreview"], {
            maxBytes: options.maxPayloadPreviewBytes,
        }),
        ...validateDiagnosticsMetadata(record["metadata"], {
            maxBytes: options.maxMetadataBytes,
        }),
        ...(timestampError ? [timestampError] : []),
    ];

    return errors.length > 0 ? errors : null;
}
