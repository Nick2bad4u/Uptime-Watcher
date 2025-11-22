import type { StorybookConfig } from "@storybook/react-vite";

// eslint-disable-next-line import-x/extensions -- storybook wants an extension
import config from "../storybook/main.ts";

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
    stories,
};

export default storybookConfig;
