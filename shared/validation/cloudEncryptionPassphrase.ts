import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { getUtfByteLength } from "@shared/utils/utfByteLength";

/** Maximum byte budget accepted for cloud encryption passphrases. */
export const CLOUD_ENCRYPTION_PASSPHRASE_MAX_BYTES = 1024;

/** Minimum trimmed character length accepted for cloud encryption passphrases. */
export const CLOUD_ENCRYPTION_PASSPHRASE_MIN_TRIMMED_LENGTH = 8;

export interface CloudEncryptionPassphraseMessages {
    readonly controlCharacters: string;
    readonly minimumLength: string;
    readonly tooLarge: string;
}

const MINIMUM_LENGTH_MESSAGE = `passphrase must be at least ${CLOUD_ENCRYPTION_PASSPHRASE_MIN_TRIMMED_LENGTH} characters (after trimming)`;
const TOO_LARGE_MESSAGE = `passphrase must not exceed ${CLOUD_ENCRYPTION_PASSPHRASE_MAX_BYTES} bytes`;

export const CLOUD_ENCRYPTION_PASSPHRASE_MESSAGES: CloudEncryptionPassphraseMessages =
    {
        controlCharacters: "passphrase must not contain control characters",
        minimumLength: MINIMUM_LENGTH_MESSAGE,
        tooLarge: TOO_LARGE_MESSAGE,
    };

/**
 * Collects cloud encryption passphrase policy violations.
 */
export function collectCloudEncryptionPassphraseIssues(
    passphrase: string
): string[] {
    const issues: string[] = [];

    if (getUtfByteLength(passphrase) > CLOUD_ENCRYPTION_PASSPHRASE_MAX_BYTES) {
        issues.push(CLOUD_ENCRYPTION_PASSPHRASE_MESSAGES.tooLarge);
    }

    if (hasAsciiControlCharacters(passphrase)) {
        issues.push(CLOUD_ENCRYPTION_PASSPHRASE_MESSAGES.controlCharacters);
    }

    if (
        passphrase.trim().length <
        CLOUD_ENCRYPTION_PASSPHRASE_MIN_TRIMMED_LENGTH
    ) {
        issues.push(CLOUD_ENCRYPTION_PASSPHRASE_MESSAGES.minimumLength);
    }

    return issues;
}
