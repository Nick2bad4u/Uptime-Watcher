/**
 * String safety helpers shared across Electron and renderer.
 */

/**
 * Returns true when the string contains ASCII control characters.
 *
 * @remarks
 * We treat ASCII control characters as unsafe in persisted keys, identifiers,
 * and other values that end up in logs, file paths, or provider object keys.
 */
export function hasAsciiControlCharacters(value: string): boolean {
    for (const char of value) {
        const codePoint = char.codePointAt(0);
        if (
            codePoint !== undefined &&
            (codePoint < 0x20 || codePoint === 0x7f)
        ) {
            return true;
        }
    }

    return false;
}
