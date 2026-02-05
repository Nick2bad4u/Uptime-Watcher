/**
 * Utilities used by the GalaxyBackground component.
 *
 * @remarks
 * These helpers are kept separate from the React component to reduce the size
 * of the render module and to keep deterministic math/string generation logic
 * easy to test and reuse.
 */

const SEEDED_RANDOM_MODULUS = 2_147_483_647;
const SEEDED_RANDOM_MULTIPLIER = 16_807;

/**
 * Creates a deterministic pseudo-random generator.
 *
 * @remarks
 * This uses a Park–Miller LCG variant. It is not cryptographically secure, but
 * is stable and fast for procedural UI effects.
 */
export function createSeededRandom(seed: number): () => number {
    let value = seed % SEEDED_RANDOM_MODULUS;

    if (value <= 0) {
        value += SEEDED_RANDOM_MODULUS - 1;
    }

    return () => {
        value = (value * SEEDED_RANDOM_MULTIPLIER) % SEEDED_RANDOM_MODULUS;
        return (value - 1) / (SEEDED_RANDOM_MODULUS - 1);
    };
}

const DARK_STAR_COLORS = [
    "rgb(255 255 255)", // White
    "rgb(224 242 254)", // Light Blue
    "rgb(250 232 255)", // Light Purple
    "rgb(240 253 250)", // Light Teal
    "rgb(221 214 254)", // Violet
    "rgb(251 207 232)", // Pink
    "rgb(165 243 252)", // Cyan
] as const;

const LIGHT_STAR_COLORS = [
    "rgb(15 23 42)", // Slate 900
    "rgb(30 41 59)", // Slate 800
    "rgb(51 65 85)", // Slate 700
    "rgb(71 85 105)", // Slate 600
    "rgb(100 116 139)", // Slate 500
] as const;

/**
 * Generates a pseudo-random box-shadow string for stars.
 */
export function generateStarfieldBoxShadow(args: {
    readonly count: number;
    readonly isDark: boolean;
    readonly seed: number;
}): string {
    const { count, isDark, seed } = args;

    let value = "";
    const colors = isDark ? DARK_STAR_COLORS : LIGHT_STAR_COLORS;
    const random = createSeededRandom(seed);

    for (let i = 0; i < count; i++) {
        const x = Math.floor(random() * 2500);
        const y = Math.floor(random() * 2000);
        const color = colors[Math.floor(random() * colors.length)];
        value += `${x}px ${y}px ${color}, `;
    }

    return value.length > 2 ? value.slice(0, -2) : value;
}

/**
 * Sanitizes React's generated id so it can be safely used in SVG `<defs>` ids.
 */
export function normalizeReactSvgIdPrefix(reactId: string): string {
    return reactId.replaceAll(":", "");
}

/**
 * Derives a stable numeric seed from a string prefix.
 */
export function deriveNumericSeedFromPrefix(prefix: string): number {
    const characters = prefix.split("");
    let total = 1;

    for (const [index, character] of characters.entries()) {
        const codePoint = character.codePointAt(0) ?? 0;
        total += codePoint * (index + 1);
    }

    return total;
}

/**
 * Creates stable SVG `<defs>` ids for the "banded" planet gradients.
 */
export function createBandPlanetGradientIds(
    uniquePrefix: string,
    planetNumber: 1 | 2
): {
    readonly bands: string;
    readonly core: string;
    readonly highlight: string;
} {
    return {
        bands: `${uniquePrefix}-planet${planetNumber}-bands`,
        core: `${uniquePrefix}-planet${planetNumber}-core`,
        highlight: `${uniquePrefix}-planet${planetNumber}-highlight`,
    };
}

/**
 * Creates stable SVG `<defs>` ids for the "atmosphere" planet gradients.
 */
export function createAtmospherePlanetGradientIds(uniquePrefix: string): {
    readonly atmosphere: string;
    readonly core: string;
    readonly highlight: string;
} {
    return {
        atmosphere: `${uniquePrefix}-planet3-atmosphere`,
        core: `${uniquePrefix}-planet3-core`,
        highlight: `${uniquePrefix}-planet3-highlight`,
    };
}
