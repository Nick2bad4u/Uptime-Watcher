import React, { useId, useMemo } from "react";

import "./GalaxyBackground.css";

interface GalaxyBackgroundProperties {
    readonly className?: string;
    readonly isDark?: boolean;
}

/**
 * Generates a pseudo-random box-shadow string for stars.
 *
 * @param count - Number of stars to render.
 * @param isDark - Whether dark mode is active.
 * @param seed - Seed used to deterministically position stars.
 *
 * @returns Box-shadow string representing star positions.
 */
const createSeededRandom = (seed: number): (() => number) => {
    let value = seed % 2_147_483_647;
    if (value <= 0) {
        value += 2_147_483_646;
    }

    return () => {
        value = (value * 16_807) % 2_147_483_647;
        return (value - 1) / 2_147_483_646;
    };
};

const generateBoxShadow = (
    count: number,
    isDark: boolean,
    seed: number
): string => {
    let value = "";
    const colors = isDark
        ? [
              "rgb(255 255 255)", // White
              "rgb(224 242 254)", // Light Blue
              "rgb(250 232 255)", // Light Purple
              "rgb(240 253 250)", // Light Teal
              "rgb(221 214 254)", // Violet
              "rgb(251 207 232)", // Pink
              "rgb(165 243 252)", // Cyan
          ]
        : [
              "rgb(15 23 42)", // Slate 900
              "rgb(30 41 59)", // Slate 800
              "rgb(51 65 85)", // Slate 700
              "rgb(71 85 105)", // Slate 600
              "rgb(100 116 139)", // Slate 500
          ];

    const random = createSeededRandom(seed);

    for (let i = 0; i < count; i++) {
        const x = Math.floor(random() * 2500);
        const y = Math.floor(random() * 2000);
        const color = colors[Math.floor(random() * colors.length)];
        value += `${x}px ${y}px ${color}, `;
    }
    return value.slice(0, -2);
};

export const GalaxyBackground: React.FC<GalaxyBackgroundProperties> = ({
    className = "",
    isDark = true,
}) => {
    const reactId = useId();
    const uniquePrefix = useMemo(() => reactId.replaceAll(":", ""), [reactId]);

    const planetOneIds = useMemo(
        () => ({
            bands: `${uniquePrefix}-planet1-bands`,
            core: `${uniquePrefix}-planet1-core`,
            highlight: `${uniquePrefix}-planet1-highlight`,
        }),
        [uniquePrefix]
    );

    const planetTwoIds = useMemo(
        () => ({
            bands: `${uniquePrefix}-planet2-bands`,
            core: `${uniquePrefix}-planet2-core`,
            highlight: `${uniquePrefix}-planet2-highlight`,
        }),
        [uniquePrefix]
    );

    const planetThreeIds = useMemo(
        () => ({
            atmosphere: `${uniquePrefix}-planet3-atmosphere`,
            core: `${uniquePrefix}-planet3-core`,
            highlight: `${uniquePrefix}-planet3-highlight`,
        }),
        [uniquePrefix]
    );

    const seedBase = useMemo(() => {
        const characters = uniquePrefix.split("");
        let total = 1;

        for (const [index, character] of characters.entries()) {
            const codePoint = character.codePointAt(0) ?? 0;
            total += codePoint * (index + 1);
        }

        return total;
    }, [uniquePrefix]);

    const starsSmall = useMemo(
        () => generateBoxShadow(700, isDark, seedBase + 1),
        [isDark, seedBase]
    );
    const starsMedium = useMemo(
        () => generateBoxShadow(200, isDark, seedBase + 2),
        [isDark, seedBase]
    );
    const starsLarge = useMemo(
        () => generateBoxShadow(100, isDark, seedBase + 3),
        [isDark, seedBase]
    );
    const starsTwinkle = useMemo(
        () => generateBoxShadow(50, isDark, seedBase + 4),
        [isDark, seedBase]
    );

    const starStyles = useMemo(
        () => ({
            large: { boxShadow: starsLarge },
            medium: { boxShadow: starsMedium },
            small: { boxShadow: starsSmall },
            twinkle: { boxShadow: starsTwinkle },
        }),
        [
            starsLarge,
            starsMedium,
            starsSmall,
            starsTwinkle,
        ]
    );

    return (
        <div
            aria-hidden="true"
            className={`galaxy-background ${
                isDark ? "galaxy-background--dark" : "galaxy-background--light"
            } ${className}`}
        >
            <div className="galaxy-overlay" />
            <div className="galaxy-objects">
                <div className="galaxy-object galaxy-object--planet-1">
                    <svg
                        aria-hidden="true"
                        className="galaxy-object__svg"
                        focusable="false"
                        viewBox="0 0 140 140"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <radialGradient
                                cx="0.35"
                                cy="0.3"
                                id={planetOneIds.core}
                                r="0.75"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(255 247 220)"
                                />
                                <stop
                                    offset="30%"
                                    stopColor="rgb(253 213 141)"
                                />
                                <stop
                                    offset="55%"
                                    stopColor="rgb(251 146 60)"
                                />
                                <path
                                    d="M12 58 C28 44 68 36 96 50 C88 68 60 82 34 78"
                                    fill={`url(#${planetThreeIds.core}-water)`}
                                    opacity="0.45"
                                />
                                <path
                                    d="M24 86 C50 94 78 94 98 84 C76 72 56 70 36 74"
                                    fill={`url(#${planetThreeIds.core}-water)`}
                                    opacity="0.4"
                                />
                                <path
                                    d="M32 48 C40 40 60 44 66 54 C56 62 38 64 30 58"
                                    fill={`url(#${planetThreeIds.core}-land)`}
                                    opacity="0.65"
                                />
                                <path
                                    d="M58 76 C70 70 92 74 100 88 C84 90 68 88 58 82"
                                    fill={`url(#${planetThreeIds.core}-land)`}
                                    opacity="0.55"
                                />
                                <stop offset="80%" stopColor="rgb(194 65 12)" />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(124 45 18)"
                                />
                            </radialGradient>
                            <linearGradient
                                id={planetOneIds.bands}
                                x1="0%"
                                x2="100%"
                                y1="0%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(255 255 255 / 0.12)"
                                />
                                <stop
                                    offset="25%"
                                    stopColor="rgb(255 255 255 / 0.04)"
                                />
                                <linearGradient
                                    id={`${planetThreeIds.core}-water`}
                                    x1="0%"
                                    x2="100%"
                                    y1="0%"
                                    y2="100%"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="rgb(34 197 94 / 0.25)"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="rgb(59 130 246 / 0.3)"
                                    />
                                </linearGradient>
                                <linearGradient
                                    id={`${planetThreeIds.core}-land`}
                                    x1="0%"
                                    x2="100%"
                                    y1="100%"
                                    y2="0%"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="rgb(21 128 61 / 0.65)"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="rgb(34 197 94 / 0.45)"
                                    />
                                </linearGradient>
                                <stop
                                    offset="50%"
                                    stopColor="rgb(255 255 255 / 0.12)"
                                />
                                <stop
                                    offset="75%"
                                    stopColor="rgb(255 255 255 / 0.04)"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(255 255 255 / 0.1)"
                                />
                            </linearGradient>
                            <linearGradient
                                id={`${planetOneIds.core}-currents`}
                                x1="0%"
                                x2="100%"
                                y1="0%"
                                y2="0%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(255 255 255 / 0.2)"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(255 255 255 / 0)"
                                />
                            </linearGradient>
                            <linearGradient
                                id={`${planetOneIds.core}-water`}
                                x1="0%"
                                x2="100%"
                                y1="0%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(125 211 252 / 0.75)"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(59 130 246 / 0.15)"
                                />
                            </linearGradient>
                            <radialGradient
                                cx="0.25"
                                cy="0.2"
                                id={planetOneIds.highlight}
                                r="0.5"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(255 255 255)"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(255 255 255 / 0)"
                                />
                            </radialGradient>
                        </defs>
                        <circle
                            cx="70"
                            cy="70"
                            fill={`url(#${planetOneIds.core})`}
                            r="68"
                        />
                        <circle
                            cx="70"
                            cy="70"
                            fill={`url(#${planetOneIds.bands})`}
                            opacity="0.25"
                            r="68"
                        />
                        <path
                            d="M12 64 C38 24 102 28 129 60"
                            fill="none"
                            opacity="0.3"
                            stroke={`url(#${planetOneIds.core}-currents)`}
                            strokeLinecap="round"
                            strokeWidth={6}
                        />
                        <path
                            d="M18 92 C54 110 96 110 132 90"
                            fill="none"
                            opacity="0.2"
                            stroke={`url(#${planetOneIds.core}-currents)`}
                            strokeLinecap="round"
                            strokeWidth={5}
                        />
                        <path
                            d="M28 62 C48 48 82 46 108 60 C92 68 70 78 40 74"
                            fill={`url(#${planetOneIds.core}-water)`}
                            opacity="0.4"
                        />
                        <path
                            d="M20 82 C44 94 96 92 118 76 C96 70 64 70 44 74"
                            fill={`url(#${planetOneIds.core}-water)`}
                            opacity="0.35"
                        />
                        <circle
                            cx="94"
                            cy="66"
                            fill={`url(#${planetOneIds.core}-water)`}
                            opacity="0.45"
                            r="14"
                        />
                        <circle
                            cx="55"
                            cy="45"
                            fill={`url(#${planetOneIds.highlight})`}
                            opacity="0.7"
                            r="30"
                        />
                        {[
                            12,
                            32,
                            52,
                            72,
                            92,
                        ].map((y) => (
                            <ellipse
                                cx="70"
                                cy={y}
                                fill="rgb(255 255 255 / 0.08)"
                                key={`planet-one-band-${y}`}
                                opacity="0.35"
                                rx={75 - y * 0.4}
                                ry={7 + (y % 20)}
                                transform={`rotate(${y > 60 ? 6 : -4} 70 ${y})`}
                            />
                        ))}
                        {[
                            1,
                            2,
                            3,
                        ].map((crater) => (
                            <circle
                                cx={45 + crater * 15}
                                cy={30 + crater * 12}
                                fill="rgb(255 255 255 / 0.18)"
                                key={`planet-one-tempest-${crater}`}
                                opacity={0.25 + crater * 0.05}
                                r={5 + crater * 1.5}
                            />
                        ))}
                    </svg>
                </div>
                <div className="galaxy-object galaxy-object--planet-2">
                    <span
                        aria-hidden="true"
                        className="galaxy-object__ring galaxy-object__ring--planet-2"
                    />
                    <svg
                        aria-hidden="true"
                        className="galaxy-object__svg galaxy-object__planet-surface galaxy-object__planet-surface--magenta"
                        focusable="false"
                        viewBox="0 0 120 120"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            {[
                                0,
                                1,
                                2,
                            ].map((ridge) => (
                                <path
                                    d={`M${20 + ridge * 36} ${32 + ridge * 18} C ${42 + ridge * 20} ${20 + ridge * 12}, ${86 + ridge * 12} ${50 + ridge * 8}, ${118 + ridge * 6} ${42 + ridge * 12}`}
                                    fill="none"
                                    key={`planet-one-ridge-${ridge}`}
                                    opacity="0.12"
                                    stroke="rgb(255 255 255 / 0.35)"
                                    strokeLinecap="round"
                                    strokeWidth={ridge + 1}
                                />
                            ))}
                            <radialGradient
                                cx="0.35"
                                cy="0.35"
                                id={planetTwoIds.core}
                                r="0.75"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(255 228 240)"
                                />
                                <stop
                                    offset="25%"
                                    stopColor="rgb(251 194 218)"
                                />
                                <stop
                                    offset="55%"
                                    stopColor="rgb(244 114 182)"
                                />
                                <stop
                                    offset="85%"
                                    stopColor="rgb(219 39 119)"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(190 24 93)"
                                />
                            </radialGradient>
                            <linearGradient
                                id={planetTwoIds.bands}
                                x1="0%"
                                x2="100%"
                                y1="20%"
                                y2="80%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(255 255 255 / 0.08)"
                                />
                                <stop
                                    offset="50%"
                                    stopColor="rgb(255 255 255 / 0.2)"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(255 255 255 / 0.08)"
                                />
                            </linearGradient>
                            <radialGradient
                                cx="0.3"
                                cy="0.25"
                                id={planetTwoIds.highlight}
                                r="0.5"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(255 255 255)"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(255 255 255 / 0)"
                                />
                            </radialGradient>
                        </defs>
                        <circle
                            cx="60"
                            cy="60"
                            fill={`url(#${planetTwoIds.core})`}
                            r="58"
                        />
                        <ellipse
                            cx="60"
                            cy="60"
                            fill={`url(#${planetTwoIds.bands})`}
                            opacity="0.3"
                            rx="58"
                            ry="30"
                            transform="rotate(-20 60 60)"
                        />
                        <circle
                            cx="48"
                            cy="42"
                            fill={`url(#${planetTwoIds.highlight})`}
                            opacity="0.6"
                            r="24"
                        />
                        {[
                            0,
                            1,
                            2,
                            3,
                        ].map((index) => (
                            <circle
                                cx={30 + index * 14}
                                cy={65 + (index % 2) * 12}
                                fill="rgb(0 0 0 / 0.28)"
                                key={`planet-two-crater-${index}`}
                                opacity="0.65"
                                r={6 + (index % 3) * 2}
                            />
                        ))}
                        {[0, 1].map((lava) => (
                            <path
                                d={
                                    lava === 0
                                        ? "M20 70 Q40 50 60 66 T100 62"
                                        : "M18 84 Q50 100 82 88 T118 82"
                                }
                                fill="none"
                                key={`planet-two-lava-${lava}`}
                                opacity="0.65"
                                stroke="rgb(255 140 115)"
                                strokeLinecap="round"
                                strokeWidth={4 - lava}
                            />
                        ))}
                        <circle
                            cx="88"
                            cy="32"
                            fill="rgb(255 255 255 / 0.08)"
                            r="10"
                        />
                        <circle
                            cx="92"
                            cy="36"
                            fill="rgb(255 255 255 / 0.18)"
                            r="6"
                        />
                    </svg>
                </div>
                <div className="galaxy-object galaxy-object--planet-3">
                    <svg
                        aria-hidden="true"
                        className="galaxy-object__svg"
                        focusable="false"
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <radialGradient
                                cx="0.35"
                                cy="0.3"
                                id={planetThreeIds.core}
                                r="0.75"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(209 250 229)"
                                />
                                <stop
                                    offset="30%"
                                    stopColor="rgb(134 239 172)"
                                />
                                <stop
                                    offset="55%"
                                    stopColor="rgb(74 222 128)"
                                />
                                <stop offset="80%" stopColor="rgb(34 197 94)" />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(22 163 74)"
                                />
                            </radialGradient>
                            <radialGradient
                                cx="0.25"
                                cy="0.2"
                                id={planetThreeIds.highlight}
                                r="0.5"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(255 255 255)"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(255 255 255 / 0)"
                                />
                            </radialGradient>
                            <radialGradient
                                cx="0.5"
                                cy="0.5"
                                id={planetThreeIds.atmosphere}
                                r="0.85"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="rgb(134 239 172 / 0)"
                                />
                                <stop
                                    offset="70%"
                                    stopColor="rgb(74 222 128 / 0.15)"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(34 197 94 / 0.4)"
                                />
                            </radialGradient>
                        </defs>
                        <circle
                            cx="50"
                            cy="50"
                            fill={`url(#${planetThreeIds.core})`}
                            r="48"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            fill={`url(#${planetThreeIds.atmosphere})`}
                            opacity="0.6"
                            r="48"
                        />
                        <circle
                            cx="40"
                            cy="35"
                            fill={`url(#${planetThreeIds.highlight})`}
                            opacity="0.65"
                            r="22"
                        />
                        {[
                            15,
                            35,
                            55,
                            75,
                        ].map((y) => (
                            <ellipse
                                cx="50"
                                cy={y}
                                fill="rgb(255 255 255 / 0.08)"
                                key={`planet-three-swirl-${y}`}
                                opacity="0.3"
                                rx={40 - y * 0.3}
                                ry={5 + (y % 15)}
                                transform={`rotate(${y > 50 ? -8 : 8} 50 ${y})`}
                            />
                        ))}
                        {[
                            0,
                            1,
                            2,
                        ].map((bubble) => (
                            <circle
                                cx={35 + bubble * 12}
                                cy={58 + bubble * 6}
                                fill="rgb(255 255 255 / 0.12)"
                                key={`planet-three-bubble-${bubble}`}
                                opacity={0.4 - bubble * 0.08}
                                r={5 - bubble}
                            />
                        ))}
                        <path
                            d="M12 54 C 30 72 74 80 96 62"
                            fill="none"
                            opacity="0.25"
                            stroke="rgb(187 247 208 / 0.45)"
                            strokeLinecap="round"
                            strokeWidth={4}
                        />
                    </svg>
                </div>
                <div
                    aria-hidden="true"
                    className="galaxy-object galaxy-object--planet-ring"
                />
                <div
                    aria-hidden="true"
                    className="galaxy-object galaxy-object--comet"
                >
                    <span className="galaxy-object__comet-core" />
                </div>
                <div className="galaxy-object galaxy-object--quasar" />
            </div>
            <div className="stars-container">
                <div className="stars stars-sm" style={starStyles.small} />
                <div className="stars stars-md" style={starStyles.medium} />
                <div className="stars stars-lg" style={starStyles.large} />
                <div
                    className="stars stars-twinkle"
                    style={starStyles.twinkle}
                />
            </div>
        </div>
    );
};
