import type { Decorator, Preview } from "@storybook/react-vite";

import { createElement } from "react";

import themeStyles from "../src/index.css?inline";
import { ThemeProvider } from "../src/theme/components/ThemeProvider";
import { installElectronAPIMock } from "./setup/electron-api-mock";

const injectThemeStyles = (() => {
    let injected = false;

    return (): void => {
        if (injected || typeof document === "undefined") {
            return;
        }

        const styleElement = document.createElement("style");
        styleElement.setAttribute("data-storybook-theme", "app");
        styleElement.textContent = themeStyles;
        document.head.append(styleElement);

        injected = true;
    };
})();

const withThemeProvider: Decorator = (Story) => {
    installElectronAPIMock();
    injectThemeStyles();

    return createElement(ThemeProvider, undefined, createElement(Story));
};

const preview: Preview = {
    decorators: [withThemeProvider],
    parameters: {
        controls: {
            matchers: {
                color: /(?<property>background|color)$/iv,
                date: /(?<date>date)$/iv,
            },
        },
        layout: "centered",
    },
};

export default preview;
