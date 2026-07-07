import type { Promisable } from "type-fest";

import { withUtilityErrorHandling } from "@shared/utils/errorHandling";

/**
 * Executes a monitor validation helper with standardized error handling.
 *
 * @typeParam TResult - Result produced by the validation operation.
 */
export async function runMonitorValidationOperation<TResult>(
    description: string,
    fallback: TResult,
    operation: () => Promisable<TResult>
): Promise<TResult> {
    return withUtilityErrorHandling(
        async () => operation(),
        description,
        fallback
    );
}
