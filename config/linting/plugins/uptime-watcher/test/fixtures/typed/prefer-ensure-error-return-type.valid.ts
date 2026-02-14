export const __typedFixtureModule = "typed-fixture-module";

try {
    throw new Error("boom");
} catch (error: unknown) {
    const normalized = ensureError(error);
    const messageLength = normalized.message.length;
    if (messageLength < 0) {
        throw normalized;
    }
}

declare function ensureError(error: unknown): Error;
