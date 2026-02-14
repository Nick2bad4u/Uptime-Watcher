import type { CSSProperties } from "react";

import { useMemo } from "react";

import { TRANSITION_ALL } from "../../constants";

/**
 * Visual tone for theme-aware form controls.
 */
export type ThemedControlTone = "default" | "transparent";

interface ThemeTokens {
    readonly borderRadius: {
        readonly md: string;
    };
    readonly spacing: {
        readonly md: string;
        readonly sm: string;
    };
    readonly typography: {
        readonly fontSize: {
            readonly sm: string;
        };
    };
}

type ThemeClassGetter = (tone?: "primary") => CSSProperties;

/**
 * Shared styling hook for theme-aware form controls (inputs/selects).
 *
 * @remarks
 * Keeps ThemedInput / ThemedSelect visually consistent and prevents drift.
 */
export function useThemedControlStyles(args: {
    readonly currentTheme: ThemeTokens;
    readonly cursor?: CSSProperties["cursor"];
    readonly disabled?: boolean;
    readonly fluid?: boolean;
    readonly getBackgroundClass: ThemeClassGetter;
    readonly getBorderClass: ThemeClassGetter;
    readonly getTextClass: ThemeClassGetter;
    readonly tone: ThemedControlTone;
}): CSSProperties {
    const {
        currentTheme,
        cursor,
        disabled,
        fluid,
        getBackgroundClass,
        getBorderClass,
        getTextClass,
        tone,
    } = args;

    return useMemo((): CSSProperties => {
        let nextCursor: CSSProperties["cursor"] | undefined = undefined;
        if (cursor !== undefined) {
            nextCursor = disabled ? "not-allowed" : cursor;
        }

        const basePadding = `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`;

        const core: CSSProperties = {
            ...getBackgroundClass("primary"),
            ...getTextClass("primary"),
            ...getBorderClass("primary"),
            borderRadius: currentTheme.borderRadius.md,
            borderStyle: "solid",
            borderWidth: "1px",
            fontSize: currentTheme.typography.fontSize.sm,
            outline: "none",
            ...(tone === "transparent" ? {} : { padding: basePadding }),
            transition: TRANSITION_ALL,
            ...(fluid ? { width: "100%" } : {}),
            ...(nextCursor ? { cursor: nextCursor } : {}),
        };

        if (tone === "transparent") {
            return {
                ...core,
                backgroundColor: "transparent",
                borderColor: "transparent",
                borderWidth: "0",
            };
        }

        return core;
    }, [
        currentTheme,
        cursor,
        disabled,
        fluid,
        getBackgroundClass,
        getBorderClass,
        getTextClass,
        tone,
    ]);
}
