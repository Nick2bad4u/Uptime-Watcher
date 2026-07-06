import { isDefined } from "ts-extras";

/**
 * Returns true when the string contains at least one ASCII letter.
 */
export function hasAsciiLetter(value: string): boolean {
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (
            isDefined(codePoint) &&
            ((codePoint >= 65 && codePoint <= 90) ||
                (codePoint >= 97 && codePoint <= 122))
        ) {
            return true;
        }
    }

    return false;
}

/**
 * Returns true when the string contains only ASCII digits.
 *
 * @remarks
 * Empty strings are rejected so callers can use this directly after trimming
 * numeric key fragments or wire-format values.
 */
export function isAsciiDigits(value: string): boolean {
    if (value.length === 0) {
        return false;
    }

    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (!isDefined(codePoint) || codePoint < 48 || codePoint > 57) {
            return false;
        }
    }

    return true;
}
