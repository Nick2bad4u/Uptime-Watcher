/**
 * Tests for Dropbox PKCE generation utilities.
 */

import crypto from "node:crypto";

import { describe, expect, it } from "vitest";

import { createPkcePair } from "@electron/services/cloud/providers/dropbox/DropboxPkce";

function encodeBase64Url(buffer: Buffer): string {
    return buffer
        .toString("base64")
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replaceAll("=", "");
}

describe(createPkcePair, () => {
    it("returns URL-safe verifier/challenge and challenge matches sha256(verifier)", () => {
        const { codeChallenge, codeVerifier } = createPkcePair();

        expect(codeVerifier.length).toBeGreaterThan(10);
        expect(codeVerifier).not.toContain("+");
        expect(codeVerifier).not.toContain("/");
        expect(codeVerifier).not.toContain("=");

        expect(codeChallenge.length).toBeGreaterThan(10);
        expect(codeChallenge).not.toContain("+");
        expect(codeChallenge).not.toContain("/");
        expect(codeChallenge).not.toContain("=");

        const expectedChallenge = encodeBase64Url(
            crypto.createHash("sha256").update(codeVerifier).digest()
        );
        expect(codeChallenge).toBe(expectedChallenge);
    });
});
