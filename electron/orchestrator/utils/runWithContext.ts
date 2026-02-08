import type {
    ContextualErrorFactory,
    ContextualErrorInput,
} from "./contextualErrorFactory";

/**
 * Options for a contextual run wrapper (excludes the thrown cause).
 */
export type RunWithContextOptions = Omit<ContextualErrorInput, "cause">;

/**
 * Signature for executing an async operation with contextual error wrapping.
 */
export type RunWithContext = <T>(
    operation: () => Promise<T>,
    options: RunWithContextOptions
) => Promise<T>;

/**
 * Creates a helper that wraps async operations and normalizes errors using the
 * provided {@link ContextualErrorFactory}.
 */
export function createRunWithContext(
    createContextualError: ContextualErrorFactory
): RunWithContext {
    return async <T>(
        operation: () => Promise<T>,
        options: RunWithContextOptions
    ): Promise<T> => {
        try {
            return await operation();
        } catch (error) {
            throw createContextualError({
                ...options,
                cause: error,
            });
        }
    };
}
