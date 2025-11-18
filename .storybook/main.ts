import type { StorybookConfig } from "@storybook/react-vite";

import config from "../storybook/main";

const addons = Array.from(
    // eslint-disable-next-line perfectionist/sort-sets -- keep sorted
    new Set([...(config.addons ?? []), "@storybook/addon-vitest"])
);

const stories: StorybookConfig["stories"] = Array.isArray(config.stories)
    ? ((): typeof config.stories => {
          const normalizedStories = Array.from(config.stories);

          for (const [index, entry] of normalizedStories.entries()) {
              if (typeof entry === "string" && entry.startsWith("./")) {
                  normalizedStories[index] = `../storybook/${entry.slice(2)}`;
              }
          }

          return normalizedStories;
      })()
    : config.stories;

/**
 * Legacy Storybook configuration shim used to bridge the new `storybook/`
 * directory structure with the classic `.storybook` entry points.
 */
const storybookConfig: StorybookConfig = {
    ...config,
    addons,
    stories,
};

export default storybookConfig;
