import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import {
    validateSiteSnapshot,
    validateSiteUpdate,
} from "@shared/validation/guards";
import { monitorIdSchema } from "@shared/validation/monitorFieldSchemas";
import { siteIdentifierSchema } from "@shared/validation/siteFieldSchemas";

import type { IpcParameterValidator } from "../../types";
import type { ParameterValueValidationResult } from "./parameterValidation";

import {
    createParamValidator,
} from "./parameterValidation";
import { requireRecordParamValue } from "./recordValidation";
import { requireStringParamValue } from "./stringValidation";

const validateSiteIdentifierCandidate = (
    value: unknown,
    paramName: string
): ParameterValueValidationResult => {
    const requiredString = requireStringParamValue(value, paramName);
    if (requiredString.ok === false) {
        return requiredString.error;
    }

    const parsed = siteIdentifierSchema.safeParse(requiredString.value);
    if (parsed.success) {
        return null;
    }

    return formatZodIssues(parsed.error.issues);
};

const validateMonitorIdCandidate = (
    value: unknown,
    paramName: string
): ParameterValueValidationResult => {
    const requiredString = requireStringParamValue(value, paramName);
    if (requiredString.ok === false) {
        return requiredString.error;
    }

    const parsed = monitorIdSchema.safeParse(requiredString.value);
    return parsed.success ? null : formatZodIssues(parsed.error.issues);
};

/**
 * Creates an IPC validator for a single site identifier parameter.
 *
 * @param paramName - Parameter name used in error messages.
 *
 * @returns IPC validator for a single site identifier.
 *
 * @internal
 */
export function createSiteIdentifierValidator(
    paramName: string
): IpcParameterValidator {
    return createParamValidator(1, [
        (value): ParameterValueValidationResult =>
            validateSiteIdentifierCandidate(value, paramName),
    ]);
}

/**
 * Creates an IPC validator for site identifier + monitor ID pairs.
 *
 * @param siteParamName - Parameter name for the site identifier.
 * @param monitorParamName - Parameter name for the monitor ID.
 *
 * @returns IPC validator for site identifier + monitor ID.
 *
 * @internal
 */
export function createSiteIdentifierAndMonitorIdValidator(
    siteParamName: string,
    monitorParamName: string
): IpcParameterValidator {
    return createParamValidator(2, [
        (value): ParameterValueValidationResult =>
            validateSiteIdentifierCandidate(value, siteParamName),
        (value): ParameterValueValidationResult =>
            validateMonitorIdCandidate(value, monitorParamName),
    ]);
}

/**
 * Creates an IPC validator for full site payloads.
 *
 * @returns IPC validator for site snapshot payloads.
 *
 * @internal
 */
export function createSitePayloadValidator(): IpcParameterValidator {
    return createParamValidator(
        1,
        [
            (siteCandidate): ParameterValueValidationResult => {
                const result = validateSiteSnapshot(siteCandidate);
                return result.success
                    ? null
                    : formatZodIssues(result.error.issues);
            },
        ],
        { stopOnCountMismatch: true }
    );
}

/**
 * Creates an IPC validator for site update payloads.
 *
 * @returns IPC validator for site update payloads.
 *
 * @internal
 */
export function createSiteUpdatePayloadValidator(): IpcParameterValidator {
    return createParamValidator(2, [
        (identifierCandidate): ParameterValueValidationResult =>
            validateSiteIdentifierCandidate(identifierCandidate, "identifier"),
        (updatesCandidate): ParameterValueValidationResult => {
            const recordResult = requireRecordParamValue(
                updatesCandidate,
                "updates"
            );
            if (recordResult.ok === false) {
                return recordResult.error;
            }

            const { record } = recordResult;
            const errors: string[] = [];

            if (Object.keys(record).length === 0) {
                errors.push("updates must not be empty");
            }

            const validationResult = validateSiteUpdate(record);
            if (!validationResult.success) {
                errors.push(...formatZodIssues(validationResult.error.issues));
            }

            return errors.length > 0 ? errors : null;
        },
    ]);
}
