/**
 * Text utilities focused on sentence-case formatting.
 *
 * @public
 */

/**
 * Converts the provided string to sentence case.
 *
 * @remarks
 * Uppercases the first character and leaves the remainder untouched. When the
 * input is empty the function returns an empty string, making it safe for UI
 * bindings without additional guards.
 *
 * @param value - Text to convert.
 *
 * @returns The text with the first character uppercased and the remaining
 *   characters unchanged. Returns an empty string when the input is falsy.
 *
 * @public
 */
export function toSentenceCase(value: string): string {
    if (value.length === 0) {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}
