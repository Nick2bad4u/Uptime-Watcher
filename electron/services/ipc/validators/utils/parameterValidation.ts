import type { IpcParameterValidator } from "../../types";

/**
 * Result type for validating a single IPC parameter.
 *
 * @remarks
 * -
 *
 * `null` means validation passed.
 *
 * - A string array means validation failed; each string is a user-facing error.
 */
export type ParameterValueValidationResult = null | readonly string[];

/**
 * Validates a single parameter value.
 */
export type ParameterValueValidator = (
    value: unknown
) => ParameterValueValidationResult;

/**
 * Normalizes validator output into a consistent
 * {@link ParameterValueValidationResult}.
 */
export function toValidationResult(
    error: ParameterValueValidationResult | string
): ParameterValueValidationResult {
    if (error === null) {
        return null;
    }

    return typeof error === "string" ? [error] : error;
}

/**
 * Options for {@link createParamValidator}.
 */
export interface CreateParamValidatorOptions {
    /**
     * When true, do not run per-parameter validators when the parameter count
     * is invalid.
     */
    readonly stopOnCountMismatch?: boolean;
}

/**
 * Creates an IPC parameter validator that checks the parameter count and then
 * delegates to per-parameter validators.
 */
export function createParamValidator(
    expectedCount: number,
    validators: readonly ParameterValueValidator[] = [],
    options: CreateParamValidatorOptions = {}
): IpcParameterValidator {
    let countMessage = "No parameters expected";

    if (expectedCount !== 0) {
        const suffix = expectedCount === 1 ? "" : "s";
        countMessage = `Expected exactly ${expectedCount} parameter${suffix}`;
    }

    return (params: readonly unknown[]): null | string[] => {
        const errors: string[] = [];
        const { length: paramsLength } = params;

        if (paramsLength !== expectedCount) {
            errors.push(countMessage);

            if (options.stopOnCountMismatch) {
                return errors;
            }
        }

        validators.forEach((validate, index) => {
            const [paramValue] = params.slice(index, index + 1);
            const error = validate(paramValue);
            if (!error) {
                return;
            }

            errors.push(...error);
        });

        return errors.length > 0 ? errors : null;
    };
}
