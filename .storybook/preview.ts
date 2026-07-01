import type { Preview } from "@storybook/react-vite";

import preview from "../storybook/preview";

const decorators = Array.isArray(preview.decorators)
    ? [...preview.decorators]
    : preview.decorators;

/**
 * Extended Storybook preview configuration that reuses the shared
 * `storybook/preview` settings while allowing local overrides.
 */
const extendedPreview = {
    ...preview,
    ...(decorators !== undefined && { decorators }),
} satisfies Preview;

export default extendedPreview;
