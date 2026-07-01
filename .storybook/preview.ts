import type { Preview } from "@storybook/react-vite";

import preview from "../storybook/preview";

const decorators: Preview["decorators"] = Array.isArray(preview.decorators)
    ? [...preview.decorators]
    : preview.decorators;

/**
 * Extended Storybook preview configuration that reuses the shared
 * `storybook/preview` settings while allowing local overrides.
 */
const extendedPreview: Preview = {
    ...preview,
    ...(decorators !== undefined && { decorators }),
};

export default extendedPreview;
