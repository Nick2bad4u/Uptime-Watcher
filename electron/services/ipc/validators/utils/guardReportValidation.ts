import type { ParameterValueValidationResult } from "./parameterValidation";

import { IpcValidators } from "../IpcValidators";
import {
    validateDiagnosticsMetadata,
    validateDiagnosticsPayloadPreview,
} from "./diagnosticsValidation";
import { requireRecordParamValue } from "./recordValidation";

/**
 * Options for validating preload guard reports.
 *
 * @internal
 */
export interface GuardReportValidationOptions {
    /** Maximum allowed UTF-8 byte length for serialized metadata. */
    readonly maxMetadataBytes: number;
    /** Maximum allowed UTF-8 byte length for payload preview text. */
    readonly maxPayloadPreviewBytes: number;
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
    if (recordResult.ok === false) {
        return recordResult.error;
    }

    const { record } = recordResult;
    const channelError = IpcValidators.requiredString(
        record["channel"],
        "channel"
    );

    const guardError = IpcValidators.requiredString(record["guard"], "guard");

    const reasonError = IpcValidators.optionalString(
        record["reason"],
        "reason"
    );

    const timestampError = IpcValidators.requiredNumber(
        record["timestamp"],
        "timestamp"
    );
    const errors = [
        ...(channelError ? [channelError] : []),
        ...(guardError ? [guardError] : []),
        ...(reasonError ? [reasonError] : []),
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
