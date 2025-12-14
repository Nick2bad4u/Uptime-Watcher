import crypto from "node:crypto";

function encodeUrlSafeBaseSixtyFour(buffer: Buffer): string {
    return buffer
        .toString("base64")
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replaceAll("=", "");
}

/**
 * Generates a PKCE verifier/challenge pair.
 */
export function createPkcePair(): {
    codeChallenge: string;
    codeVerifier: string;
} {
    const codeVerifier = encodeUrlSafeBaseSixtyFour(crypto.randomBytes(32));
    const hash = crypto.createHash("sha256").update(codeVerifier).digest();
    const codeChallenge = encodeUrlSafeBaseSixtyFour(hash);

    return { codeChallenge, codeVerifier };
}
