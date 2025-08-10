---
title: "@packageDocumentation"
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Core](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Modifier](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Usage

Used to indicate a doc comment that describes an entire NPM package (as opposed to an individual API item belonging
to that package). The `@packageDocumentation` comment is found in the \*.d.ts file that acts as the entry point for
the package, and it should be the first `/**` comment encountered in that file. A comment containing
a `@packageDocumentation` tag should never be used to describe an individual API item.

## Example

```ts
// Copyright (c) Example Company. All rights reserved. Licensed under the MIT license.

/**
 * A library for building widgets.
 *
 * @remarks
 * The `widget-lib` defines the {@link IWidget} interface and {@link Widget} class,
 * which are used to build widgets.
 *
 * @packageDocumentation
 */

/**
 * Interface implemented by all widgets.
 * @public
 */
export interface IWidget {
 /**
  * Draws the widget on the screen.
  */
 render(): void;
}
```

## See also

- [@alpha](https://tsdoc.org/pages/tags/alpha/) tag
- [@beta](https://tsdoc.org/pages/tags/beta/) tag
- [@experimental](https://tsdoc.org/pages/tags/experimental/) tag
- [@public](https://tsdoc.org/pages/tags/public/) tag
- [API Extractor: @packageDocumentation](https://api-extractor.com/pages/tsdoc/tag_packagedocumentation/):
  a reference implementation of this feature
