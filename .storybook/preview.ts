import type { Preview } from "@storybook/react-vite";

import preview from "../storybook/preview";

const decorators = Array.isArray(preview.decorators)
    ? Array.from(preview.decorators)
    : preview.decorators;

const extendedPreview: Preview = {
    ...preview,
    ...(decorators === undefined ? {} : { decorators }),
};

export default extendedPreview;
