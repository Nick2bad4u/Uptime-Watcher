import {
    CLOUD_ENCRYPTION_PASSPHRASE_MESSAGES,
    collectCloudEncryptionPassphraseIssues,
} from "@shared/validation/cloudEncryptionPassphrase";
import { describe, expect, it } from "vitest";

describe("cloud encryption passphrase validation", () => {
    it("accepts valid passphrases", () => {
        expect(
            collectCloudEncryptionPassphraseIssues(
                "correct horse battery staple"
            )
        ).toEqual([]);
    });

    it("rejects weak passphrases", () => {
        expect(collectCloudEncryptionPassphraseIssues("pass")).toContain(
            CLOUD_ENCRYPTION_PASSPHRASE_MESSAGES.minimumLength
        );
    });

    it("rejects passphrases with control characters", () => {
        expect(
            collectCloudEncryptionPassphraseIssues("correct\nhorse")
        ).toContain(CLOUD_ENCRYPTION_PASSPHRASE_MESSAGES.controlCharacters);
    });

    it("rejects oversized passphrases", () => {
        expect(
            collectCloudEncryptionPassphraseIssues("x".repeat(2000))
        ).toContain(CLOUD_ENCRYPTION_PASSPHRASE_MESSAGES.tooLarge);
    });
});
