import { createHash, randomBytes } from "node:crypto";

/**
 * PKCE verifier/challenge pair.
 */
export interface PkcePair {
    readonly codeChallenge: string;
    readonly codeChallengeMethod: "S256";
    readonly codeVerifier: string;
}

/**
 * Encodes a buffer to a base64url string.
 */
function encodeUrlSafeBase64(buffer: Buffer): string {
    return buffer
        .toString("base64")
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replaceAll("=", "");
}

/**
 * Creates a PKCE verifier/challenge pair.
 */
export function createPkcePair(): PkcePair {
    const codeVerifier = encodeUrlSafeBase64(randomBytes(32));
    const hashed = createHash("sha256").update(codeVerifier).digest();

    return {
        codeChallenge: encodeUrlSafeBase64(hashed),
        codeChallengeMethod: "S256",
        codeVerifier,
    };
}
