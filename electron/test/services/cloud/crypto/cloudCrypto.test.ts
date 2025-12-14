import { describe, expect, it } from "vitest";

import {
    createKeyCheckBase64,
    decryptBuffer,
    derivePassphraseKey,
    encryptBuffer,
    generateEncryptionSalt,
    isEncryptedPayload,
    verifyKeyCheckBase64,
} from "@electron/services/cloud/crypto/cloudCrypto";

describe("cloudCrypto", () => {
    it("derives deterministic keys for same passphrase and salt", async () => {
        const salt = generateEncryptionSalt();
        const key1 = await derivePassphraseKey({
            passphrase: "correct horse battery staple",
            salt,
        });
        const key2 = await derivePassphraseKey({
            passphrase: "correct horse battery staple",
            salt,
        });

        expect(key1.equals(key2)).toBeTruthy();
    });

    it("round-trips encryption", async () => {
        const salt = generateEncryptionSalt();
        const key = await derivePassphraseKey({
            passphrase: "p@ssw0rd",
            salt,
        });

        const plaintext = Buffer.from("hello world", "utf8");
        const encrypted = encryptBuffer({ key, plaintext });
        expect(isEncryptedPayload(encrypted)).toBeTruthy();

        const decrypted = decryptBuffer({ key, ciphertext: encrypted });
        expect(decrypted.toString("utf8")).toBe("hello world");
    });

    it("key-check validates correct key and rejects wrong key", async () => {
        const salt = generateEncryptionSalt();
        const key = await derivePassphraseKey({ passphrase: "secret", salt });
        const wrongKey = await derivePassphraseKey({
            passphrase: "not secret",
            salt,
        });

        const keyCheckBase64 = createKeyCheckBase64(key);
        expect(
            verifyKeyCheckBase64({
                key,
                keyCheckBase64,
            })
        ).toBeTruthy();

        expect(
            verifyKeyCheckBase64({
                key: wrongKey,
                keyCheckBase64,
            })
        ).toBeFalsy();
    });
});
