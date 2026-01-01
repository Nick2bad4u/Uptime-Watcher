/**
 * @remarks
 * This used to exist only in the Electron layer; it is process-agnostic and is
 * now shared so all layers use a single implementation.
 *
 * @module validationError
 * Generic validation error type.
 */

/**
 * Error thrown when validation fails.
 *
 * @public
 */
export class ValidationError extends Error {
    public readonly errors: readonly string[];

    public constructor(errors: readonly string[]) {
        super(`Validation failed: ${errors.join(", ")}`);
        this.name = "ValidationError";
        this.errors = errors;
    }
}
