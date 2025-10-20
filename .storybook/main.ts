import type { StorybookConfig } from "@storybook/react-vite";

import config from "../storybook/main";

const addons = Array.from(
    // eslint-disable-next-line perfectionist/sort-sets -- keep sorted
    new Set([...(config.addons ?? []), "@storybook/addon-vitest"])
);

const stories = config.stories?.map((pattern) =>
    pattern.startsWith("./") ? `../storybook/${pattern.slice(2)}` : pattern
);

const storybookConfig: StorybookConfig = {
    ...config,
    addons,
    stories,
};

export default storybookConfig;
