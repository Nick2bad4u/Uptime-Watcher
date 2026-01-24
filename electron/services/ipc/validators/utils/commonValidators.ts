import { isJsonByteBudgetExceeded } from "@shared/utils/jsonByteBudget";
import { getUtfByteLength } from "@shared/utils/utfByteLength";

import type { IpcParameterValidator } from "../../types";

import { IpcValidators } from "../../utils";
import {
    createParamValidator,
    type ParameterValueValidationResult,
    toValidationResult,
} from "./parameterValidation";
import { isRequiredRecordError, requireRecordParam } from "./recordValidation";

/** Maximum byte budget accepted for clipboard payloads transported over IPC. */
const MAX_CLIPBOARD_TEXT_BYTES: number = 5 * 1024 * 1024;

/**
 * Creates a validator for handlers expecting no parameters.
 */
export function createNoParamsValidator(): IpcParameterValidator {
    return createParamValidator(0);
}

/**
 * Creates validators for handlers expecting a single number parameter.
 */
export function createSingleNumberValidator(
    paramName: string
): IpcParameterValidator {
    return createParamValidator(1, [
        (value): ParameterValueValidationResult =>
            toValidationResult(IpcValidators.requiredNumber(value, paramName)),
    ]);
}

/**
 * Creates validators for handlers expecting a single string parameter.
 */
export function createSingleStringValidator(
    paramName: string
): IpcParameterValidator {
    return createParamValidator(1, [
        (value): ParameterValueValidationResult =>
            toValidationResult(IpcValidators.requiredString(value, paramName)),
    ]);
}

/**
 * Creates validators for handlers expecting two string parameters.
 */
export function createTwoStringValidator(
    firstParamName: string,
    secondParamName: string
): IpcParameterValidator {
    return createParamValidator(2, [
        (value): ParameterValueValidationResult =>
            toValidationResult(
                IpcValidators.requiredString(value, firstParamName)
            ),
        (value): ParameterValueValidationResult =>
            toValidationResult(
                IpcValidators.requiredString(value, secondParamName)
            ),
    ]);
}

/**
 * Creates validators for string + object parameter pairs.
 */
export function createStringObjectValidator(
    stringParamName: string,
    objectParamName: string
): IpcParameterValidator {
    return createParamValidator(2, [
        (value): ParameterValueValidationResult =>
            toValidationResult(
                IpcValidators.requiredString(value, stringParamName)
            ),
        (value): ParameterValueValidationResult =>
            toValidationResult(
                IpcValidators.requiredObject(value, objectParamName)
            ),
    ]);
}

/**
 * Creates validators for handlers with a validated first parameter and an
 * unvalidated second parameter.
 */
export function createStringWithUnvalidatedSecondValidator(
    firstParamName: string
): IpcParameterValidator {
    return createParamValidator(2, [
        (value): ParameterValueValidationResult =>
            toValidationResult(
                IpcValidators.requiredString(value, firstParamName)
            ),
        (): ParameterValueValidationResult => null,
    ]);
}

/**
 * Creates validators for handlers expecting a string parameter and a record
 * payload that must fit within a strict JSON byte budget.
 */
export function createStringWithBudgetedObjectValidator(
    stringParamName: string,
    objectParamName: string,
    maxBytes: number
): IpcParameterValidator {
    return createParamValidator(2, [
        (value): ParameterValueValidationResult =>
            toValidationResult(
                IpcValidators.requiredString(value, stringParamName)
            ),
        (value): ParameterValueValidationResult => {
            const recordResult = requireRecordParam(value, objectParamName);
            if (isRequiredRecordError(recordResult)) {
                return recordResult.error;
            }

            if (isJsonByteBudgetExceeded(recordResult.record, maxBytes)) {
                return toValidationResult(
                    `${objectParamName} must not exceed ${maxBytes} bytes`
                );
            }

            return null;
        },
    ]);
}

/**
 * Creates validators for handlers expecting a validated external URL.
 */
export function createSingleExternalOpenUrlValidator(
    paramName: string
): IpcParameterValidator {
    return createParamValidator(1, [
        (value): ParameterValueValidationResult =>
            toValidationResult(
                IpcValidators.requiredExternalOpenUrl(value, paramName)
            ),
    ]);
}

/**
 * Creates validators for clipboard write handlers.
 */
export function createClipboardTextValidator(): IpcParameterValidator {
    return createParamValidator(1, [
        (value): ParameterValueValidationResult => {
            const error = IpcValidators.requiredString(value, "text");
            if (error) {
                return toValidationResult(error);
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- validated above
            const text = value as string;
            if (getUtfByteLength(text) > MAX_CLIPBOARD_TEXT_BYTES) {
                return toValidationResult(
                    `text must not exceed ${MAX_CLIPBOARD_TEXT_BYTES} bytes`
                );
            }

            return null;
        },
    ]);
}
