import type { Decorator, Preview } from "@storybook/react-vite";

import { initialize, mswLoader } from "msw-storybook-addon";
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
        styleElement.dataset["storybookTheme"] = "app";
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

const mswInitializeOptions: Parameters<typeof initialize>[0] = {
    onUnhandledRequest: "bypass",
};

initialize(mswInitializeOptions);

const preview: Preview = {
    decorators: [withThemeProvider],
    loaders: [mswLoader],
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
