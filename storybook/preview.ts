import type { Decorator, Preview, ReactRenderer } from "@storybook/react";

import { withThemeByClassName } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
import { useEffect } from "react";
import { useDarkMode } from "storybook-dark-mode";
import { themes } from "storybook/theming";

import "../src/index.css";
import type { ThemeName } from "../src/theme/types";

import { useMount } from "../src/hooks/useMount";
import { themeManager } from "../src/theme/ThemeManager";
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
    isDarkMode: boolean
): StoryThemeName => {
    if (isStoryThemeName(candidate)) {
        return candidate;
    }

    return isDarkMode ? "dark" : DEFAULT_STORY_THEME;
};

const withTailwindThemeClasses = withThemeByClassName<ReactRenderer>({
    defaultTheme: DEFAULT_STORY_THEME,
    themes: STORYBOOK_THEME_CLASS_MAP,
});

const extractThemeFromGlobals = (globals: StoryGlobals): unknown => {
    const record = globals as Record<string, unknown>;
    return Object.hasOwn(record, "theme") ? record["theme"] : undefined;
};

const initializeElectronMocks = (): void => {
    installElectronAPIMock();
};

const withApplicationProviders: Decorator = (storyFn, context) => {
    const isDarkMode = useDarkMode();
    const storyTheme = resolveStoryTheme(
        extractThemeFromGlobals(context.globals),
        isDarkMode
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
    loaders: [mswLoader],
    parameters: {
        controls: {
            matchers: {
                color: /(?<property>background|color)$/iv,
                date: /(?<date>date)$/iv,
            },
        },
        darkMode: {
            classTarget: "html",
            current: "light",
            darkClass: ["dark"],
            stylePreview: true,
        },
        docs: {
            theme: themes.dark,
        },
        layout: "centered",
    },
    tags: ["autodocs"],
};

export default preview;
