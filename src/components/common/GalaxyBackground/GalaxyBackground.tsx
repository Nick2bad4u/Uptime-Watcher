import React, { useMemo } from "react";

import "./GalaxyBackground.css";

interface GalaxyBackgroundProps {
    readonly className?: string;
    readonly isDark?: boolean;
}

/**
 * Generates a random box-shadow string for stars.
 *
 * @param count Number of stars
 * @param isDark Whether dark mode is active
 *
 * @returns Box-shadow string
 */
const generateBoxShadow = (count: number, isDark: boolean): string => {
    let value = "";
    const colors = isDark
        ? [
              "#FFFFFF", // White
              "#E0F2FE", // Light Blue
              "#FAE8FF", // Light Purple
              "#F0FDFA", // Light Teal
              "#DDD6FE", // Violet
              "#FBCFE8", // Pink
              "#A5F3FC", // Cyan
          ]
        : [
              "#0F172A", // Slate 900
              "#1E293B", // Slate 800
              "#334155", // Slate 700
              "#475569", // Slate 600
              "#64748B", // Slate 500
          ];

    for (let i = 0; i < count; i++) {
        // Generate stars in a wider area (2500px) to allow for horizontal drift
        const x = Math.floor(Math.random() * 2500);
        const y = Math.floor(Math.random() * 2000);
        const color = colors[Math.floor(Math.random() * colors.length)];
        value += `${x}px ${y}px ${color}, `;
    }
    return value.slice(0, -2);
};

export const GalaxyBackground: React.FC<GalaxyBackgroundProps> = ({
    className = "",
    isDark = true,
}) => {
    // Memoize the stars so they don't regenerate on re-renders
    const starsSmall = useMemo(() => generateBoxShadow(700, isDark), [isDark]);
    const starsMedium = useMemo(() => generateBoxShadow(200, isDark), [isDark]);
    const starsLarge = useMemo(() => generateBoxShadow(100, isDark), [isDark]);
    const starsTwinkle = useMemo(() => generateBoxShadow(50, isDark), [isDark]);

    return (
        <div
            aria-hidden="true"
            className={`galaxy-background ${
                isDark ? "galaxy-background--dark" : "galaxy-background--light"
            } ${className}`}
        >
            <div className="galaxy-overlay" />
            <div className="galaxy-objects">
                <div className="galaxy-object galaxy-object--planet-1" />
                <div className="galaxy-object galaxy-object--planet-2" />
                <div className="galaxy-object galaxy-object--quasar" />
            </div>
            <div className="stars-container">
                <div
                    className="stars stars-sm"
                    style={{ boxShadow: starsSmall }}
                />
                <div
                    className="stars stars-md"
                    style={{ boxShadow: starsMedium }}
                />
                <div
                    className="stars stars-lg"
                    style={{ boxShadow: starsLarge }}
                />
                <div
                    className="stars stars-twinkle"
                    style={{ boxShadow: starsTwinkle }}
                />
            </div>
        </div>
    );
};
