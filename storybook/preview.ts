// eslint-disable-next-line sonarjs/no-implicit-dependencies -- Storybook uses Vite alias to load global styles
import "@app/index.css";
import type { ThemeName } from "@app/theme/types";
import type { Decorator, Preview, ReactRenderer } from "@storybook/react";

import { useMount } from "@app/hooks/useMount";
import { themeManager } from "@app/theme/ThemeManager";
import { ensureRecordLike } from "@shared/utils/typeHelpers";
import { withThemeByClassName } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
import { createElement, useEffect } from "react";
import { themes } from "storybook/theming";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { installElectronAPIMock } from "./setup/electron-api-mock";

type AccessibilityTestMode = "error" | "warn";

const storybookAccessibilityModeEnvKeys = [
    "VITE_STORYBOOK_A11Y_ASSERT_MODE",
    "STORYBOOK_A11Y_ASSERT_MODE",
] as const;

const normalizeAccessibilityTestMode = (
    value: unknown
): AccessibilityTestMode | undefined => {
    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim().toLowerCase();

    if (trimmed === "error" || trimmed === "warn") {
        return trimmed;
    }

    return undefined;
};

const readEnvVariable = (
    envRecord: Record<string, unknown> | undefined
): AccessibilityTestMode | undefined => {
    if (!envRecord) {
        return undefined;
    }

    for (const key of storybookAccessibilityModeEnvKeys) {
        const candidate = normalizeAccessibilityTestMode(envRecord[key]);

        if (candidate) {
            return candidate;
        }
    }

    return undefined;
};

const getProcessEnvRecord = (): Record<string, unknown> | undefined => {
    const processCandidate = (
        globalThis as {
            process?: undefined | { env?: unknown };
        }
    ).process;

    const processRecord = ensureRecordLike(processCandidate);

    if (!processRecord) {
        return undefined;
    }

    return ensureRecordLike(processRecord["env"]);
};

const resolveStorybookAccessibilityMode = (): AccessibilityTestMode => {
    const importMetaEnv = ensureRecordLike(
        (import.meta as { env?: unknown }).env
    );

    const importMetaCandidate = readEnvVariable(importMetaEnv);

    if (importMetaCandidate) {
        return importMetaCandidate;
    }

    const processEnv = getProcessEnvRecord();

    const processCandidate = readEnvVariable(processEnv);

    if (processCandidate) {
        return processCandidate;
    }

    return "warn";
};

const storybookAccessibilityTestMode = resolveStorybookAccessibilityMode();

type StoryThemeName = Extract<ThemeName, "dark" | "high-contrast" | "light">;

type StoryGlobals = Parameters<Decorator>[1]["globals"];

const STORYBOOK_THEME_CLASS_MAP: Record<StoryThemeName, string> = {
    dark: "theme-dark dark",
    "high-contrast": "theme-high-contrast dark",
    light: "theme-light",
};

const DEFAULT_STORY_THEME: StoryThemeName = "light";

const isStoryThemeName = (value: unknown): value is StoryThemeName =>
    typeof value === "string" &&
    Object.hasOwn(STORYBOOK_THEME_CLASS_MAP, value);

const resolveStoryTheme = (
    candidate: unknown,
    fallback: StoryThemeName
): StoryThemeName => {
    if (isStoryThemeName(candidate)) {
        return candidate;
    }

    return fallback;
};

const withTailwindThemeClasses = withThemeByClassName<ReactRenderer>({
    defaultTheme: DEFAULT_STORY_THEME,
    themes: STORYBOOK_THEME_CLASS_MAP,
});

const extractThemeFromGlobals = (globals: StoryGlobals): unknown => {
    const record = globals as Record<string, unknown>;
    return Object.hasOwn(record, "theme") ? record["theme"] : undefined;
};

const determineSystemFallbackTheme = (): StoryThemeName => {
    const preference = themeManager.getSystemThemePreference();

    return preference === "dark" ? "dark" : DEFAULT_STORY_THEME;
};

const initializeElectronMocks = (): void => {
    installElectronAPIMock();
};

const STORYBOOK_VIEWPORTS = {
    ...INITIAL_VIEWPORTS,
    desktop1440: {
        name: "Desktop 1440p",
        styles: {
            height: "900px",
            width: "1440px",
        },
        type: "desktop" as const,
    },
    desktopFullHD: {
        name: "Desktop 1080p",
        styles: {
            height: "1080px",
            width: "1920px",
        },
        type: "desktop" as const,
    },
} satisfies Record<
    string,
    {
        name: string;
        styles: {
            height: string;
            width: string;
        };
        type: "desktop" | "mobile" | "other" | "tablet";
    }
>;

const withApplicationProviders: Decorator = (storyFn, context) => {
    const ApplicationProvidersDecorator = (): ReturnType<Decorator> => {
        const fallbackTheme = determineSystemFallbackTheme();
        const storyTheme = resolveStoryTheme(
            extractThemeFromGlobals(context.globals),
            fallbackTheme
        );

        useMount(initializeElectronMocks);

        useEffect(
            function applyStoryTheme() {
                const resolvedTheme = themeManager.getTheme(storyTheme);
                themeManager.applyTheme(resolvedTheme);
            },
            [storyTheme]
        );

        return storyFn({
            ...context,
            globals: {
                ...context.globals,
                theme: storyTheme,
            },
        });
    };

    return createElement(ApplicationProvidersDecorator);
};

/**
 * Default Mock Service Worker options used to initialize Storybook network
 * handlers.
 */
const mswInitializeOptions: Parameters<typeof initialize>[0] = {
    onUnhandledRequest: "bypass",
    quiet: true,
};

// `@storybook/addon-vitest` imports this file in the Vitest (Node) process to
// build portable stories. MSW's Storybook addon will attempt to construct
// Node-side interceptors (including WebSocket interceptors) when initialized
// outside a browser, which can interfere with Vitest's browser provider.
//
// We only need MSW to initialize in the actual browser preview runtime.
if (typeof window !== "undefined") {
    initialize(mswInitializeOptions);
}


/**
 * Global Storybook preview configuration shared across all stories.
 */
const preview: Preview = {
    decorators: [withTailwindThemeClasses, withApplicationProviders],
    initialGlobals: {
        viewport: {
            isRotated: false,
            value: "desktop1440",
        },
    },
    loaders: [mswLoader],
    parameters: {
        a11y: {
            options: {
                runOnly: {
                    type: "tag",
                    values: [
                        "wcag2a",
                        "wcag2aa",
                        "wcag2aaa",
                        "wcag21a",
                        "wcag21aa",
                        "section508",
                        "best-practice",
                    ],
                },
            },
            test: storybookAccessibilityTestMode,
        },
        controls: {
            matchers: {
                color: /(?<property>background|color)$/iu,

                date: /(?<date>date)$/iu,
            },
        },
        docs: {
            theme: themes.dark,
        },
        layout: "centered",
        viewport: {
            options: STORYBOOK_VIEWPORTS,
        },
    },
    tags: ["autodocs"],
};

export default preview;
