import type { StorybookConfig } from "@storybook/react-vite";

import config from "../storybook/main.ts";

const stories: StorybookConfig["stories"] = Array.isArray(config.stories)
    ? ((): typeof config.stories => {
          const normalizedStories = [...config.stories];

          for (const [index, entry] of normalizedStories.entries()) {
              if (typeof entry === "string" && entry.startsWith("./")) {
                  normalizedStories[index] = `../storybook/${entry.slice(2)}`;
              }
          }

          return normalizedStories;
      })()
    : config.stories;

/**
 * Storybook configuration shim used to bridge the new `storybook/` directory
 * structure with tooling that still expects `.storybook/` entry points.
 */
const storybookConfig: StorybookConfig = {
    ...config,
    stories,
};

export default storybookConfig;
