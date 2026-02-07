import { isRecord } from "@shared/utils/typeHelpers";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import {
    validateAppNotificationRequest,
    validateNotificationPreferenceUpdate,
} from "@shared/validation/notifications";

import type { ParameterValueValidationResult } from "./parameterValidation";

import { IpcValidators } from "../IpcValidators";
import { toValidationResult } from "./parameterValidation";
import { getForbiddenRecordKeyErrors } from "./recordValidation";

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
    const objectError = IpcValidators.requiredObject(value, "preferences");
    if (objectError) {
        return toValidationResult(objectError);
    }

    if (!isRecord(value)) {
        return toValidationResult(
            "Notification preferences payload must be an object"
        );
    }

    const forbiddenKeyErrors = getForbiddenRecordKeyErrors(
        value,
        "preferences"
    );
    if (forbiddenKeyErrors.length > 0) {
        return forbiddenKeyErrors;
    }

    const validationResult = validateNotificationPreferenceUpdate(value);
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
    const objectError = IpcValidators.requiredObject(value, "request");
    if (objectError) {
        return toValidationResult(objectError);
    }

    if (isRecord(value)) {
        const forbiddenKeyErrors = getForbiddenRecordKeyErrors(
            value,
            "request"
        );
        if (forbiddenKeyErrors.length > 0) {
            return forbiddenKeyErrors;
        }
    }

    const validationResult = validateAppNotificationRequest(value);
    return validationResult.success
        ? null
        : formatZodIssues(validationResult.error.issues);
}
