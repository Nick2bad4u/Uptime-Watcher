import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import {
    validateAppNotificationRequest,
    validateNotificationPreferenceUpdate,
} from "@shared/validation/notifications";

import type { ParameterValueValidationResult } from "./parameterValidation";

import { requireRecordParamValue } from "./recordValidation";

/**
 * Validates notification preferences payloads.
 *
 * @param value - Candidate preferences payload.
 *
 * @returns Validation errors (empty when valid).
 *
 * @internal
 */
export function validateNotificationPreferencesPayload(
    value: unknown
): ParameterValueValidationResult {
    const recordResult = requireRecordParamValue(value, "preferences");
    if (!recordResult.ok) {
        return recordResult.error;
    }

    const validationResult = validateNotificationPreferenceUpdate(
        recordResult.record
    );
    return validationResult.success
        ? null
        : formatZodIssues(validationResult.error.issues);
}

/**
 * Validates notify-app-event payloads.
 *
 * @param value - Candidate notification request payload.
 *
 * @returns Validation errors (empty when valid).
 *
 * @internal
 */
export function validateNotifyAppEventPayload(
    value: unknown
): ParameterValueValidationResult {
    const recordResult = requireRecordParamValue(value, "request");
    if (!recordResult.ok) {
        return recordResult.error;
    }

    const validationResult = validateAppNotificationRequest(
        recordResult.record
    );
    return validationResult.success
        ? null
        : formatZodIssues(validationResult.error.issues);
}
