import * as z from "zod";

/**
 * Creates a string schema that rejects whitespace-only values.
 *
 * @remarks
 * Optionally adds a max-length constraint _before_ the non-whitespace check to
 * preserve the existing validation ordering used by field schemas.
 */
export function createNonWhitespaceStringSchema(args: {
    readonly maxLength?: number;
    readonly maxLengthMessage?: string;
    readonly requiredMessage: string;
}): z.ZodString {
    const baseSchema = z.string();

    const withMax =
        typeof args.maxLength === "number"
            ? baseSchema.max(
                  args.maxLength,
                  args.maxLengthMessage ??
                      `Must be at most ${args.maxLength} characters`
              )
            : baseSchema;

    return withMax.regex(/\S/u, args.requiredMessage);
}
