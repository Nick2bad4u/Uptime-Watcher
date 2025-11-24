import fc, { type Arbitrary } from "fast-check";

import { STATUS_KIND, type StatusKind } from "@shared/types";
import { isValidUrl } from "@shared/validation/validatorUtils";

const readableCharacters = [
    ..."abcdefghijklmnopqrstuvwxyz",
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ..."0123456789",
    " ",
    "-",
    "_",
    "&",
    ".",
    ",",
    "/",
    ":",
    "'",
    "(",
    ")",
];

const slugCharacters = [..."abcdefghijklmnopqrstuvwxyz", ..."0123456789"];

const collapseWhitespace = (value: string): string =>
    value.replaceAll(/\s+/gu, " ").trim();

const hasVisibleCharacters = (value: string): boolean => value.length > 0;

const stringFromCharacters = (
    characters: readonly string[],
    constraints: { maxLength: number; minLength: number }
): Arbitrary<string> =>
    fc
        .array(fc.constantFrom(...characters), constraints)
        .map((chars) => chars.join(""));

/**
 * Generates trimmed, human-friendly labels that avoid control characters.
 */
export const readableLabelArbitrary: Arbitrary<string> = stringFromCharacters(
    readableCharacters,
    {
        maxLength: 48,
        minLength: 3,
    }
)
    .map((value) => collapseWhitespace(value))
    .filter((value) => hasVisibleCharacters(value));

/**
 * Arbitrary producing realistic site names for renderer and electron tests.
 */
export const siteNameArbitrary: Arbitrary<string> = readableLabelArbitrary;

/**
 * Arbitrary producing monitor names with the same constraints as site names.
 */
export const monitorNameArbitrary: Arbitrary<string> = readableLabelArbitrary;

/**
 * Arbitrary emitting kebab-case identifiers suitable for site slugs.
 */
const slugSegmentArbitrary = stringFromCharacters(slugCharacters, {
    maxLength: 8,
    minLength: 3,
});

export const siteIdentifierArbitrary: Arbitrary<string> = fc
    .tuple(slugSegmentArbitrary, slugSegmentArbitrary)
    .map(([left, right]) => `${left}-${right}`.toLowerCase());

/**
 * Arbitrary generating unique monitor identifiers using uuid v4 strings.
 */
export const monitorIdArbitrary: Arbitrary<string> = fc.uuid();

/**
 * Arbitrary emitting valid HTTP/HTTPS URLs with optional queries and fragments.
 */
export const siteUrlArbitrary: Arbitrary<string> = fc
    .webUrl({
        authoritySettings: {
            withIPv4: true,
            withPort: true,
        },
        validSchemes: ["http", "https"],
        withFragments: true,
        withQueryParameters: true,
    })
    .filter((url) => isValidUrl(url));

/**
 * Arbitrary spanning every STATUS_KIND option for alerts and monitors.
 */
export const statusKindArbitrary: Arbitrary<StatusKind> = fc.constantFrom(
    STATUS_KIND.DEGRADED,
    STATUS_KIND.DOWN,
    STATUS_KIND.PENDING,
    STATUS_KIND.UP
);

/**
 * Samples a single value from an arbitrary for scenarios that only need one
 * instance.
 *
 * @param arbitrary - Arbitrary to sample from.
 *
 * @returns The generated value.
 */
export const sampleOne = <TValue>(arbitrary: fc.Arbitrary<TValue>): TValue => {
    const [value] = fc.sample(arbitrary, 1);
    if (value === undefined) {
        throw new Error("fast-check failed to sample a value");
    }
    return value;
};
