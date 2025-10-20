import type { StorybookConfig } from "@storybook/react-vite";

import config from "../storybook/main";

type StoriesArray = ReadonlyArray<Record<string, unknown> | string>;

const addons = Array.from(
    // eslint-disable-next-line perfectionist/sort-sets -- keep sorted
    new Set([...(config.addons ?? []), "@storybook/addon-vitest"])
);

const normalizeStoryPaths = (entries: StoriesArray): StoriesArray =>
    entries.map((entry) => {
        if (typeof entry !== "string" || !entry.startsWith("./")) {
            return entry;
        }

        return `../storybook/${entry.slice(2)}`;
    });

const stories: StorybookConfig["stories"] = Array.isArray(config.stories)
    ? (normalizeStoryPaths(
          config.stories as StoriesArray
      ) as StorybookConfig["stories"])
    : config.stories;

const storybookConfig: StorybookConfig = {
    ...config,
    addons,
    stories,
};

export default storybookConfig;
