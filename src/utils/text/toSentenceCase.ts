/**
 * Converts the provided string to sentence case.
 *
 * @param value - Text to convert.
 *
 * @returns The text with the first character uppercased and the remaining
 *   characters unchanged. Returns an empty string when the input is falsy.
 */
export function toSentenceCase(value: string): string {
    if (value.length === 0) {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}
