import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    scrypt,
    timingSafeEqual,
} from "node:crypto";

import { decodeCanonicalBase64 } from "../internal/cloudServicePrimitives";

const MAGIC = Buffer.from("UWENC001", "ascii");
const VERSION = 1;

const IV_LENGTH_BYTES = 12;
const TAG_LENGTH_BYTES = 16;

const KEY_LENGTH_BYTES = 32;

const KEY_CHECK_PLAINTEXT = "uptime-watcher-passphrase-check-v1";

/**
 * Derives a 32-byte encryption key from a user passphrase.
 *
 * @remarks
 * Uses Node's scrypt KDF with conservative parameters to balance UX and
 * security. The caller must provide a cryptographically random salt.
 */
export async function derivePassphraseKey(args: {
    passphrase: string;
    salt: Buffer;
}): Promise<Buffer> {
    const { passphrase, salt } = args;
    if (passphrase.trim().length === 0) {
        throw new Error("Passphrase must not be empty");
    }

    const derived = await new Promise<Buffer>((resolve, reject) => {
        scrypt(
            passphrase,
            salt,
            KEY_LENGTH_BYTES,
            {
                // Reasonable interactive defaults.
                N: 2 ** 14,
                p: 1,
                r: 8,
            },
            (error, derivedKey) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(
                    Buffer.isBuffer(derivedKey)
                        ? derivedKey
                        : Buffer.from(derivedKey)
                );
            }
        );
    });

    if (derived.length !== KEY_LENGTH_BYTES) {
        throw new Error("Derived key length mismatch");
    }

    return derived;
}

/** Creates a new random salt suitable for scrypt. */
export function generateEncryptionSalt(): Buffer {
    return randomBytes(16);
}

/**
 * Returns true when the buffer begins with the Uptime Watcher encryption
 * header.
 */
export function isEncryptedPayload(buffer: Buffer): boolean {
    if (buffer.length < MAGIC.length + 1) {
        return false;
    }

    return buffer.subarray(0, MAGIC.length).equals(MAGIC);
}

/**
 * Encrypts a buffer using AES-256-GCM.
 *
 * @returns Buffer containing the magic header + version + IV + tag +
 *   ciphertext.
 */
export function encryptBuffer(args: {
    key: Buffer;
    plaintext: Buffer;
}): Buffer {
    if (args.key.length !== KEY_LENGTH_BYTES) {
        throw new Error("Invalid encryption key length");
    }

    const iv = randomBytes(IV_LENGTH_BYTES);
    const cipher = createCipheriv("aes-256-gcm", args.key, iv);

    const ciphertext = Buffer.concat([
        cipher.update(args.plaintext),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    if (tag.length !== TAG_LENGTH_BYTES) {
        throw new Error("Unexpected AES-GCM tag length");
    }

    return Buffer.concat([
        MAGIC,
        Buffer.from([VERSION]),
        iv,
        tag,
        ciphertext,
    ]);
}

/**
 * Decrypts a buffer previously encrypted by {@link encryptBuffer}.
 */
export function decryptBuffer(args: {
    ciphertext: Buffer;
    key: Buffer;
}): Buffer {
    if (args.key.length !== KEY_LENGTH_BYTES) {
        throw new Error("Invalid encryption key length");
    }

    const payload = args.ciphertext;
    if (!isEncryptedPayload(payload)) {
        throw new Error("Payload is not encrypted");
    }

    const minimumLength =
        MAGIC.length + 1 + IV_LENGTH_BYTES + TAG_LENGTH_BYTES + 1;
    if (payload.length < minimumLength) {
        throw new Error("Encrypted payload is truncated");
    }

    const version = payload.readUInt8(MAGIC.length);
    if (version !== VERSION) {
        throw new Error(`Unsupported encrypted payload version: ${version}`);
    }

    const ivStart = MAGIC.length + 1;
    const tagStart = ivStart + IV_LENGTH_BYTES;
    const dataStart = tagStart + TAG_LENGTH_BYTES;

    const iv = payload.subarray(ivStart, tagStart);
    const tag = payload.subarray(tagStart, dataStart);
    const data = payload.subarray(dataStart);

    const decipher = createDecipheriv("aes-256-gcm", args.key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(data), decipher.final()]);
}

/**
 * Encrypts a sentinel plaintext to allow validating a passphrase-derived key.
 */
export function createKeyCheckBase64(key: Buffer): string {
    const encrypted = encryptBuffer({
        key,
        plaintext: Buffer.from(KEY_CHECK_PLAINTEXT, "utf8"),
    });

    return encrypted.toString("base64");
}

/**
 * Returns true when the provided base64 key-check blob decrypts to the expected
 * sentinel plaintext.
 */
export function verifyKeyCheckBase64(args: {
    key: Buffer;
    keyCheckBase64: string;
}): boolean {
    try {
        const decoded = decodeCanonicalBase64({
            label: "key check",
            value: args.keyCheckBase64,
        });
        const plaintext = decryptBuffer({
            ciphertext: decoded,
            key: args.key,
        }).toString("utf8");

        return timingSafeEqual(
            Buffer.from(plaintext, "utf8"),
            Buffer.from(KEY_CHECK_PLAINTEXT, "utf8")
        );
    } catch {
        return false;
    }
}
