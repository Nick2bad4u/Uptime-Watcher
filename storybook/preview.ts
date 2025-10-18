import "@app/index.css";
import type { ThemeName } from "@app/theme/types";

import { useMount } from "@app/hooks/useMount";
import { themeManager } from "@app/theme/ThemeManager";
import type { Decorator, Preview, ReactRenderer } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
import { useEffect } from "react";
import { themes } from "storybook/theming";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import { installElectronAPIMock } from "./setup/electron-api-mock";

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

const mswInitializeOptions: Parameters<typeof initialize>[0] = {
    onUnhandledRequest: "bypass",
};

initialize(mswInitializeOptions);

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
        },
        controls: {
            matchers: {
                color: /(?<property>background|color)$/iv,
                date: /(?<date>date)$/iv,
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
