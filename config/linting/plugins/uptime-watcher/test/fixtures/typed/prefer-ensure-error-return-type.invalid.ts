export const __typedFixtureModule = "typed-fixture-module";

try {
    throw new Error("boom");
} catch (error: any) {
    const normalized = ensureError(error) as Error & { readonly code: string };
    if (normalized.code.length === 0) {
        throw normalized;
    }
}

declare function ensureError(error: unknown): Error;
