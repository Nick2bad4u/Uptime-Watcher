const MAX_CLOUD_ACCOUNT_LABEL_CHARS = 320;

function replaceAsciiControlCharacters(value: string): string {
    let result = "";

    for (const character of value) {
        const codePoint = character.codePointAt(0);
        result +=
            codePoint !== undefined && (codePoint < 0x20 || codePoint === 0x7f)
                ? " "
                : character;
    }

    return result;
}

/**
 * Normalizes cloud provider account labels before persisting or exposing them.
 */
export function normalizeCloudAccountLabel(
    accountLabel: string | undefined
): string | undefined {
    if (!accountLabel) {
        return undefined;
    }

    const compacted = replaceAsciiControlCharacters(accountLabel)
        .replaceAll(/\s+/gu, " ")
        .trim();

    if (!compacted) {
        return undefined;
    }

    return compacted.length <= MAX_CLOUD_ACCOUNT_LABEL_CHARS
        ? compacted
        : `${compacted.slice(0, MAX_CLOUD_ACCOUNT_LABEL_CHARS)}...`;
}
